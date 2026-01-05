import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request) {
  const body = await req.json();

  const { response, text, setCookie } = await djangoFetch(
    "/store/api/cart/add/",
    {
      method: "POST",
      body: JSON.stringify({
        product_id: body.product_id,
        quantity: body.quantity ?? 1,
      }),
    }
  );

  const res = NextResponse.json(
    JSON.parse(text),
    { status: response.status }
  );

  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}
