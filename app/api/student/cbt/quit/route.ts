// app/api/student/cbt/quit/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    if (!text) return null;
    return JSON.parse(text) as T;
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

export async function POST(request: Request) {
  let payload: any = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  const test_id = payload?.test_id ?? payload?.testId ?? payload?.test;

  if (test_id == null || Number.isNaN(Number(test_id))) {
    return NextResponse.json(
      { detail: "Missing or invalid 'test_id'." },
      { status: 400 }
    );
  }

  // Pass through device id if provided by the client
  const deviceId =
    request.headers.get("x-device-id") ||
    request.headers.get("X-Device-ID") ||
    "";

  const t = withTimeout(15000);

  try {
    const startFetch = await djangoFetch(`/assessments/api/student/cbt-quit/`, {
      method: "POST",
      signal: t.signal,
      headers: deviceId ? { "X-Device-ID": deviceId } : undefined,
      body: JSON.stringify({ test_id: Number(test_id) }),
    });

    // If backend returned JSON, parse it; otherwise wrap raw
    const parsed = safeJsonParse<any>(startFetch.text);
    const data = parsed ?? (startFetch.text ? { raw: startFetch.text } : {});

    if (!startFetch.response.ok) {
      const res = NextResponse.json(
        data?.detail
          ? { detail: data.detail }
          : { error: "Upstream error", data },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    console.error("[Route] Error proxying to cbt-quit:", err);

    return NextResponse.json(
      { error: isTimeout ? "Connection timeout" : "Internal server error", details: String(err) },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
