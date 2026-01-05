// app/api/store/cart/items/[item_id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ item_id: string }> }
) {
  const { item_id } = await params;
  const body = await req.json();

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/store/api/cart/items/${item_id}/`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errRes = NextResponse.json(
        {
          error: `Backend returned ${response.status}`,
          body: text.slice(0, 500),
        },
        { status: response.status }
      );
      if (setCookie) errRes.headers.set("set-cookie", setCookie);
      return errRes;
    }

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
      id: data.id ?? "",
      items: (data.items ?? []).map((i: any) => ({
        id: i.id ?? "",
        product_id: i.product_id ?? "",
        title: i.title ?? "Unknown",
        price: i.price ?? "0",
        quantity: i.quantity ?? 0,
        line_total: i.line_total ?? "0",
        image_url: i.image_url ?? null,
        type: i.type ?? "physical",
        bnpl_enabled: i.bnpl_enabled ?? false,
      })),
      coupon: data.coupon ?? null,
      subtotal: data.subtotal ?? "0.00",
    };

    const ok = NextResponse.json(normalized, { status: 200 });
    if (setCookie) ok.headers.set("set-cookie", setCookie);
    return ok;
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
