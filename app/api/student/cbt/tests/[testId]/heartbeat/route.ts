// app/api/tests/[testId]/heartbeat/route.ts
//
// Proxy for /assessments/api/tests/<int:test_id>/heartbeat/
// Used by lib/cbt/heartbeat.ts:
// fetch(`/api/tests/${testId}/heartbeat/`)

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}

function isValidTestId(testId: string) {
  return /^\d+$/.test(testId);
}

// GET /api/tests/[testId]/heartbeat/
export async function GET(
  request: Request,
  context: { params: Promise<{ testId: string }> }
) {
  const { testId } = await context.params;

  if (!isValidTestId(testId)) {
    return NextResponse.json(
      {
        error: "Invalid test id.",
      },
      { status: 400 }
    );
  }

  const deviceId = request.headers.get("X-Device-Id");

  const t = withTimeout(8000);

  try {
    const r = await djangoFetch(
      `/assessments/api/tests/${encodeURIComponent(testId)}/heartbeat/`,
      {
        method: "GET",
        signal: t.signal,
        headers: {
          ...(deviceId ? { "X-Device-Id": deviceId } : {}),
        },
      }
    );

    let data: any = null;

    try {
      data = r.text ? JSON.parse(r.text) : null;
    } catch {
      data = {
        error: r.text || "Invalid JSON response from backend.",
      };
    }

    if (!r.response.ok) {
      const res = NextResponse.json(data, {
        status: r.response.status,
      });

      return attachSetCookie(res, r.setCookie);
    }

    const res = NextResponse.json(data, {
      status: 200,
    });

    return attachSetCookie(res, r.setCookie);
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: err?.message || String(err),
      },
      {
        status: isTimeout ? 504 : 500,
      }
    );
  } finally {
    t.clear();
  }
}