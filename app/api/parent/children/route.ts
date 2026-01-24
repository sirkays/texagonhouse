import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

// simple retry wrapper (keeps your old behavior)
async function djangoFetchWithRetry(
  path: string,
  init: RequestInit,
  retries = 3,
  timeoutMs = 30000
) {
  let lastErr: any = null;

  for (let i = 0; i < retries; i++) {
    const t = withTimeout(timeoutMs);
    try {
      return await djangoFetch(path, {
        ...init,
        signal: t.signal,
      });
    } catch (err: any) {
      lastErr = err;
      const isTimeout = err?.name === "AbortError";
      console.error("[Route] Fetch attempt", i + 1, "failed:", isTimeout ? "timeout" : (err?.message || String(err)));

      if (i === retries - 1) throw err;

      // backoff: 1s, 2s, 3s...
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    } finally {
      t.clear();
    }
  }

  throw lastErr || new Error("Max retries reached");
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    let path: string;

    switch (url.pathname) {
      case "/api/parent/children-progress": {
        const childId = url.searchParams.get("child_id") || "all";
        const timePeriod = url.searchParams.get("time_period") || "week";
        path = `/accounts/api/parent/children-progress/?child_id=${encodeURIComponent(
          childId
        )}&time_period=${encodeURIComponent(timePeriod)}`;
        break;
      }

      case "/api/parent/children-list":
        path = `/accounts/api/parent/children-list/`;
        break;

      case "/api/parent/time-periods":
        path = `/accounts/api/parent/time-periods/`;
        break;

      default:
        return NextResponse.json({ detail: "Endpoint not found" }, { status: 404 });
    }

    const startFetch = await djangoFetchWithRetry(
      path,
      { method: "GET" },
      3,
      30000
    );

    const data = safeJsonParse(startFetch.text);

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 403) {
        return NextResponse.json(
          { detail: "Unauthorized: Invalid session token or API key" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { detail: data?.detail || "Failed to fetch data", raw: startFetch.text },
        { status: startFetch.response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Route] Error fetching data:", error?.message || String(error));

    return NextResponse.json(
      {
        detail: isTimeout ? "Connection timeout" : "Internal server error",
        error: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
