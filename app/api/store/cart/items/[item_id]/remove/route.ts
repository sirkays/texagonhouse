// app/api/store/cart/items/[item_id]/remove/route.ts
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
}

export async function DELETE(
  req: Request,
  { params }: { params: { item_id: string } }
) {
  try {
    const { response, text, setCookie } = await djangoFetch(
      `/store/api/cart/items/${params.item_id}/remove/`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      let errorPayload: any = { error: "Failed to remove cart item" };

      if (response.status === 401)
        errorPayload = { error: "Session expired", redirect: "/login" };
      else if (response.status === 403)
        errorPayload = { error: "Forbidden" };
      else if (response.status === 404)
        errorPayload = { error: "Item not found" };

      const errRes = NextResponse.json(errorPayload, {
        status: response.status,
      });
      if (setCookie) errRes.headers.set("set-cookie", setCookie);
      return errRes;
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
      subtotal: data.subtotal || "0",
    };

    const ok = NextResponse.json(normalized, { status: 200 });
    if (setCookie) ok.headers.set("set-cookie", setCookie);
    return ok;
  } catch {
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
}
