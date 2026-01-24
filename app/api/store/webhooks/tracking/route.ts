// app/api/store/webhooks/tracking/route.ts
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

interface WebhookResponse {
  detail: string;
  event_id: string;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message || String(error) },
      { status: 400 }
    );
  }

  const t = withTimeout(15000);

  try {
    // Webhook endpoint (no session required, Api-Key handled by proxy.ts)
    const startFetch = await djangoFetch(`/store/api/webhooks/tracking/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 400) {
        const res = NextResponse.json({ error: "Invalid request" }, { status: 400 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 404) {
        const res = NextResponse.json({ error: "Shipment not found" }, { status: 404 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const parsed = safeJsonParse<any>(startFetch.text);
      const msg =
        parsed?.detail ||
        parsed?.error ||
        "Failed to process webhook";

      const res = NextResponse.json(
        { error: msg, raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = safeJsonParse<WebhookResponse>(startFetch.text);
    if (data === null) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: (startFetch.text || "").slice(0, 300) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const normalizedData: WebhookResponse = {
      detail: data.detail || "",
      event_id: data.event_id || "",
    };

    const res = NextResponse.json(normalizedData, { status: 202 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to process webhook",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
