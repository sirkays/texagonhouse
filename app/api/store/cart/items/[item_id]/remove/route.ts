// app/api/store/cart/items/[item_id]/remove/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

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
}

export async function DELETE(
  req: Request,
  {params}: {params: {item_id: string}}
) {
  const fullUrl = `${BASE_URL}/cart/items/${params.item_id}/remove/`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(sessionToken ? sessionToken : undefined),
    });
    const rawResponse = await response.text();
    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Item not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to remove cart item"},
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
      coupon: data.coupon || null,
      subtotal: data.subtotal || "0",
    };
    return NextResponse.json(normalizedData, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to remove cart item"},
      {status: 500}
    );
  }
}
