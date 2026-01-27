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

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(request: Request) {
  const t = withTimeout(12000);

  try {
    // forward query params
    const incomingUrl = new URL(request.url);
    const qs = incomingUrl.searchParams.toString();
    const path = `/gamification/api/child/rewards/${qs ? `?${qs}` : ""}`;

    const startFetch = await djangoFetch(path, {
      method: "GET",
      signal: t.signal,
      // headers/session/cookies handled by proxy.ts
    });

    const data = safeJsonParse(startFetch.text);

    if (!startFetch.response.ok) {
      const res = NextResponse.json(
        { error: data?.detail || "Failed to fetch data", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    // Image normalization: ensure all avatars are absolute URLs
    if (data?.children && Array.isArray(data.children)) {
      data.children.forEach((child: any) => {
        if (
          child?.avatar &&
          typeof child.avatar === "string" &&
          child.avatar.startsWith("/")
        ) {
          // proxy.ts BASE_URL already points to backend
          child.avatar = `${process.env.STORE_BASE_URL}${child.avatar}`;
        }
      });
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Route] Error fetching data:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
