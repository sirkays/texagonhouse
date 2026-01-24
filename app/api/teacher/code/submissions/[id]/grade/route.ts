// app/api/teacher/code/submissions/[id]/grade/route.ts
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

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body: any = null;
  try {
    body = await request.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message || String(error) },
      { status: 400 }
    );
  }

  const t = withTimeout(20000);

  try {
    const startFetch = await djangoFetch(
      `/code-ide/api/teacher/submissions/${id}/grade/`,
      {
        method: "POST",
        signal: t.signal,
        body: JSON.stringify(body),
      }
    );

    const raw = startFetch.text || "";
    const data = safeJsonParse<any>(raw);

    if (!startFetch.response.ok) {
      const msg = data?.detail || data?.error || "Failed to grade submission";
      const res = NextResponse.json(
        { error: msg, raw },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    if (data === null) {
      const res = NextResponse.json(
        { error: "External API returned non-JSON response", raw: raw.slice(0, 500) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[TeacherGradeRoute] Error posting data:", error);

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
