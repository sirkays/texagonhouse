import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098/store/api"
const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (token?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(token && {"X-Session-Token": token}),
});

export async function PATCH(
  req: Request,
  {params}: {params: Promise<{item_id: string}>}
) {
  const {item_id} = await params; // ← awaited
  const body = await req.json();
  const fullUrl = `${BASE_URL}/cart/items/${item_id}/`;

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  try {
    const res = await fetch(fullUrl, {
      method: "PATCH",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    if (!res.ok) {
      // ... handle errors
    }

    const data = JSON.parse(raw);
    const normalized = {
      id: data.id,
      items: data.items.map((i: any) => ({
        id: i.id,
        product_id: i.product_id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        line_total: i.line_total,
        image_url: i.image_url,
        type: i.type,
        bnpl_enabled: i.bnpl_enabled,
      })),
      coupon: data.coupon,
      subtotal: data.subtotal,
    };

    return NextResponse.json(normalized);
  } catch (e) {
    return NextResponse.json({error: "Failed"}, {status: 500});
  }
}
