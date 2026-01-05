// app/api/store/checkout/create-order/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface CreateOrderRequest {
  billing_address_id?: string | null;
  shipping_address_id?: string | null;
  phone_number?: string | null;

  // ✅ BNPL additions
  is_bnpl?: boolean;
  bnpl_plan_id?: string | null;
  product_id?: string | null;
  quantity?: number | null;
}

type AnyJson = Record<string, any>;

export async function POST(req: Request) {
  noStore();

  let body: CreateOrderRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      "/store/api/checkout/create-order/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      let backend: AnyJson = {};
      try {
        backend = JSON.parse(text);
      } catch {}

      let payload: AnyJson = {
        error: backend?.detail || backend?.error || "Failed to create order",
      };

      if (response.status === 401) {
        payload = { error: "Session expired", redirect: "/login" };
      } else if (response.status === 400) {
        payload = {
          error: backend?.detail || backend?.error || "Invalid request",
        };
      } else if (response.status === 403) {
        payload = {
          error: backend?.detail || backend?.error || "Forbidden",
        };
      }

      const err = NextResponse.json(payload, { status: response.status });
      if (setCookie) err.headers.set("set-cookie", setCookie);
      return err;
    }

    let data: AnyJson;
    try {
      data = JSON.parse(text);
    } catch {
      const bad = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
      if (setCookie) bad.headers.set("set-cookie", setCookie);
      return bad;
    }

    const normalized = {
      id: data?.id || data?.order_id || data?.orderId || "",
      order_id: data?.order_id || data?.id || "",
      grand_total:
        data?.grand_total || data?.grandTotal || data?.total_amount || "0.00",
      total_amount: data?.total_amount || data?.grand_total || "0.00",
    };

    const ok = NextResponse.json(normalized, { status: 201 });
    if (setCookie) ok.headers.set("set-cookie", setCookie);
    return ok;
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
