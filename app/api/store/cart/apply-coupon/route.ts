// app/api/store/cart/apply-coupon/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098/store/api";
const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

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

  // ✅ NEW
  shipping_total: string;
  tax_total: string;
  payable_total: string;
}



export async function POST(req: Request) {
  const body = await req.json();
  const fullUrl = `${BASE_URL}/cart/apply-coupon/`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
    });
    const rawResponse = await response.text();
    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 400)
        return NextResponse.json({error: "Invalid coupon"}, {status: 400});
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      return NextResponse.json(
        {error: "Failed to apply coupon"},
        {status: response.status}
      );
    }
    let data: CartResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedItems: CartItem[] = data.items.map((item) => ({
      id: item.id || "",
      product_id: item.product_id || "",
      title: item.title || "",
      price: item.price || "0",
      quantity: item.quantity || 0,
      line_total: item.line_total || "0",
    }));

    const normalizedData: CartResponse = {
      id: data.id || "",
      items: normalizedItems,
      coupon: data.coupon ?? null,
      subtotal: data.subtotal ?? "0.00",
      discount_total: data.discount_total ?? "0.00",
      grand_total: data.grand_total ?? "0.00",

      shipping_total: data.shipping_total ?? "0.00",
      tax_total: data.tax_total ?? "0.00",
      payable_total: data.payable_total ?? "0.00",
    };

    return NextResponse.json(normalizedData, {status: 200});
  } catch (error) {
    return NextResponse.json({error: "Failed to apply coupon"}, {status: 500});
  }
}
