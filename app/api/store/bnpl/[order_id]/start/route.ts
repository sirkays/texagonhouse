import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = any>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
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

interface BnplStartResponse {
  agreement_id: string;
  status: string;
}

export async function POST(
  req: Request,
  { params }: { params: { order_id: string } | Promise<{ order_id: string }> }
) {
  noStore();

  const { order_id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message || String(error) },
      { status: 400 }
    );
  }

  const t = withTimeout(20000);

  try {
    // DRF usually expects trailing slash
    const startFetch = await djangoFetch(`/store/api/bnpl/${order_id}/start/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return attachSetCookie(res, startFetch.setCookie);
      }
      if (startFetch.response.status === 404) {
        const res = NextResponse.json({ error: "Order not found" }, { status: 404 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to start BNPL", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = safeJsonParse<BnplStartResponse>(startFetch.text);

    if (!data) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: startFetch.text?.slice(0, 300) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const normalizedData: BnplStartResponse = {
      agreement_id: data.agreement_id || "",
      status: data.status || "",
    };

    const res = NextResponse.json(normalizedData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });

    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to start BNPL",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
