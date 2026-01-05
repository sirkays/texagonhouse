// app/api/store/cart/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  try {
    const { response, text, setCookie } = await djangoFetch("/store/api/cart/", {
      method: "GET",
    });

    // If backend fails, return an empty cart shape (your current behavior)
    if (!response.ok) {
      const fallback = NextResponse.json({
        id: "",
        items: [],
        coupon: null,
        subtotal: "0.00",
        discount_total: "0.00",
        grand_total: "0.00",
        shipping_total: "0.00",
        tax_total: "0.00",
        payable_total: "0.00",
      });

      if (setCookie) fallback.headers.set("set-cookie", setCookie);
      return fallback;
    }

    // Parse JSON safely
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      const bad = NextResponse.json(
        {
          error: "Backend did not return valid JSON",
          status: response.status,
          contentType: response.headers.get("content-type") || "",
          preview: text.slice(0, 300),
        },
        { status: 502 }
      );
      if (setCookie) bad.headers.set("set-cookie", setCookie);
      return bad;
    }

    const normalized = {
      id: data.id || "",
      items: (data.items || []).map((i: any) => ({
        id: i.id || "",
        product_id: i.product_id || "",
        title: i.title || "Unknown",
        price: i.price || "0",
        quantity: i.quantity || 0,
        line_total: i.line_total || "0",
        image: i.image_url ? `${i.image_url}` : "/placeholder.svg",
        type: i.type || "physical",
        bnpl_enabled: i.bnpl_enabled ?? false,
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
  } catch (e: any) {
    // Network/proxy error fallback
    return NextResponse.json({
      id: "",
      items: [],
      coupon: null,
      subtotal: "0.00",
      discount_total: "0.00",
      grand_total: "0.00",
      shipping_total: "0.00",
      tax_total: "0.00",
      payable_total: "0.00",
    });
  }
}
