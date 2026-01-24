// app/api/store/payments/card/[orderId]/start/route.ts
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

// Keep your request/response types
interface PaymentStartRequest {
  provider?: "stripe" | "paystack";
  currency?: string;
}

interface PaymentStartResponse {
  payment_id: string;
  status: string;
  amount: string;
}

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } | Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  let body: PaymentStartRequest;
  try {
    body = (await req.json()) as PaymentStartRequest;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message || String(error) },
      { status: 400 }
    );
  }

  const t = withTimeout(20000);

  try {
    // NOTE: proxy.ts handles Api-Key + session token (NextAuth) + cookies.
    // So we just call the backend relative path.
    // DRF usually expects trailing slash.
    const startFetch = await djangoFetch(
      `/store/api/payments/card/${orderId}/start/`,
      {
        method: "POST",
        signal: t.signal,
        body: JSON.stringify(body),
      }
    );

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 404) {
        const res = NextResponse.json({ error: "Order not found" }, { status: 404 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      // Try to surface backend message if it was JSON
      const parsed = safeJsonParse<any>(startFetch.text);
      const msg =
        parsed?.detail ||
        parsed?.error ||
        "Failed to start payment";

      const res = NextResponse.json(
        { error: msg, raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = safeJsonParse<PaymentStartResponse>(startFetch.text);
    if (data === null) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: (startFetch.text || "").slice(0, 300) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("Payment start error:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to start payment",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
