import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : {};
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

/**
 * Parent cancels an upcoming tutoring booking
 * Proxies PATCH to Django via proxy.ts (Api-Key + X-Session-Token handled there)
 */
export async function PATCH(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  // Accept either booking_id or id (nice DX)
  const booking_id = body.booking_id ?? body.id;

  if (!booking_id) {
    return NextResponse.json(
      { detail: "booking_id (or id) is required." },
      { status: 400 }
    );
  }

  const t = withTimeout(15000);

  try {
    // Django endpoint: /api/tutor/tutoring/bookings/cancel/
    const startFetch = await djangoFetch(`/api/tutor/tutoring/bookings/cancel/`, {
      method: "PATCH",
      signal: t.signal,
      body: JSON.stringify({ booking_id }),
    });

    const data = safeJsonParse(startFetch.text);

    if (data === null) {
      const res = NextResponse.json(
        {
          detail: "External API returned non-JSON response",
          raw: (startFetch.text || "").slice(0, 500),
        },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: startFetch.response.status });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        detail: isTimeout ? "Connection timeout" : "Internal server error",
        error: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
