// app/api/store/cart/add/route.ts
export const runtime = "nodejs"; // <--- Add this line to force Node.js runtime

import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function POST(req: Request) {
  const body = await req.json();
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}/cart/add/`, {
      method: "POST",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify({
        product_id: body.product_id,
        quantity: body.quantity ?? 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const raw = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {error: `Backend returned ${response.status}`, body: raw},
        {status: response.status}
      );
    }

    const data = JSON.parse(raw);
    return NextResponse.json(data, {status: 201});
  } catch (err) {
    console.error("❌ Add to cart error:", err);
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: (err as Error).message,
        hint: "If you're on Vercel, add `export const runtime = 'nodejs'`.",
      },
      {status: 502}
    );
  }
}
