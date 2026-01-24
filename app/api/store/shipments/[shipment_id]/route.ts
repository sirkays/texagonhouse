// app/api/store/shipments/[shipmentId]/route.ts
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

interface ShipmentItem {
  order_item_id: string;
  title: string;
  quantity: number;
}

interface ShipmentEvent {
  id: string;
  code: string;
  desc: string;
  occurred_at: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  carrier_status: string;
}

interface ShipmentAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

interface Shipment {
  id: string;
  order_id: string;
  status: string;
  carrier: string | null;
  method: string | null;
  tracking_number: string;
  tracking_url: string | null;
  label_url: string | null;
  label_cost: string;
  currency: string;
  to: ShipmentAddress;
  shipped_at: string | null;
  delivered_at: string | null;
  items: ShipmentItem[];
  events: ShipmentEvent[];
}

export async function GET(
  _req: Request,
  { params }: { params: { shipmentId: string } | Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await params;

  const t = withTimeout(15000);

  try {
    const startFetch = await djangoFetch(`/store/api/shipments/${shipmentId}/`, {
      method: "GET",
      signal: t.signal,
    });

    if (!startFetch.response.ok) {
      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 404) {
        const res = NextResponse.json({ error: "Not found" }, { status: 404 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to fetch shipment", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = safeJsonParse<Shipment>(startFetch.text);

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
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to fetch shipment",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}
