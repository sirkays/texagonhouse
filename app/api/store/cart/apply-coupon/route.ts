// app/api/store/cart/apply-coupon/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: string;
  quantity: number;
  line_total: string;
}

interface CartResponse {
  id: string;
  items: CartItem[];
  coupon: string | null;
  subtotal: string;
  discount_total: string;
  grand_total: string;
  shipping_total: string;
  tax_total: string;
  payable_total: string;
}

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const { response, text, setCookie } = await djangoFetch(
      "/store/api/cart/apply-coupon/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      let payload: any = { error: "Failed to apply coupon" };

      if (response.status === 401)
        payload = { error: "Session expired", redirect: "/login" };
      else if (response.status === 400)
        payload = { error: "Invalid coupon" };
      else if (response.status === 403)
        payload = { error: "Forbidden" };

      const err = NextResponse.json(payload, { status: response.status });
      if (setCookie) err.headers.set("set-cookie", setCookie);
      return err;
    }

    let data: CartResponse;
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

    const normalized: CartResponse = {
      id: data.id || "",
      items: (data.items || []).map((item) => ({
        id: item.id || "",
        product_id: item.product_id || "",
        title: item.title || "",
        price: item.price || "0",
        quantity: item.quantity || 0,
        line_total: item.line_total || "0",
      })),
      coupon: data.coupon ?? null,
      subtotal: data.subtotal ?? "0.00",
      discount_total: data.discount_total ?? "0.00",
      grand_total: data.grand_total ?? "0.00",
      shipping_total: data.shipping_total ?? "0.00",
      tax_total: data.tax_total ?? "0.00",
      payable_total: data.payable_total ?? "0.00",
    };

    const ok = NextResponse.json(normalized, { status: 200 });
    if (setCookie) ok.headers.set("set-cookie", setCookie);
    return ok;
  } catch {
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}
