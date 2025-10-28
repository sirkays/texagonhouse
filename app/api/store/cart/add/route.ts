import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
//const BASE_URL = "http://127.0.0.1:9098/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headersFor = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

// ---- tiny in-memory idempotency cache (per server instance) ----
declare global {
  // eslint-disable-next-line no-var
  var __IDEMPOTENCY_CACHE__: Map<
    string,
    { expiresAt: number; response: any; status: number }
  > | undefined;
}
const IDEM_TTL_MS = 3000; // 3 seconds
const idemCache =
  globalThis.__IDEMPOTENCY_CACHE__ ||
  (globalThis.__IDEMPOTENCY_CACHE__ = new Map());

function getCached(idemKey: string) {
  const hit = idemCache.get(idemKey);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    idemCache.delete(idemKey);
    return null;
  }
  return hit;
}

function setCached(idemKey: string, payload: any, status: number) {
  idemCache.set(idemKey, {
    response: payload,
    status,
    expiresAt: Date.now() + IDEM_TTL_MS,
  });
}

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

export async function POST(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401 }
    );
  }
  const sessionToken = session.user.sessionToken;

  // Grab idempotency key from client (or synthesize one if missing)
  const incomingIdem = req.headers.get("x-idempotency-key");
  const idemKey =
    incomingIdem ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID()) ||
    `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Serve duplicate requests within TTL from cache
  const cached = getCached(idemKey);
  if (cached) {
    return NextResponse.json(cached.response, {
      status: cached.status,
      headers: { "Cache-Control": "no-store", "x-idempotent": "HIT" },
    });
  }

  let body: { product_id?: string; quantity?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.product_id) {
    return NextResponse.json(
      { error: "product_id is required" },
      { status: 400 }
    );
  }

  const quantity =
    typeof body.quantity === "number" && body.quantity > 0
      ? Math.floor(body.quantity)
      : 1;

  const forwardPayload = { product_id: body.product_id, quantity };
  const fullUrl = `${BASE_URL}/cart/add/`;

  console.log("[StoreCartAddAPI] Initiating POST to:", fullUrl);
  console.log("[StoreCartAddAPI] Received body:", forwardPayload);

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        ...headersFor(sessionToken),
        "X-Idempotency-Key": idemKey, // backend may or may not use this
      },
      body: JSON.stringify(forwardPayload),
    });

    console.log("[StoreCartAddAPI] Backend response status:", response.status);

    const rawResponse = await response.text();
    console.log("[StoreCartAddAPI] Backend raw response:", rawResponse);

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      if (response.status === 403)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (response.status === 404)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      // Cache negative response briefly too, to dedupe rapid dupes
      setCached(idemKey, { error: "Failed to add to cart" }, response.status);

      return NextResponse.json(
        { error: "Failed to add to cart" },
        { status: response.status }
      );
    }

    let data: CartResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[StoreCartAddAPI] Parse error:", parseError);
      setCached(idemKey, { error: "Invalid response format" }, 500);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    const normalizedData: CartResponse = {
      id: data.id || "",
      items: (data.items || []).map((item) => ({
        id: item.id || "",
        product_id: item.product_id || "",
        title: item.title || "",
        price: item.price || "0",
        quantity: item.quantity || 0,
        line_total: item.line_total || "0",
      })),
      coupon: data.coupon || null,
      subtotal: data.subtotal || "0",
    };

    setCached(idemKey, normalizedData, 201);

    return NextResponse.json(normalizedData, {
      status: 201,
      headers: { "Cache-Control": "no-store", "x-idempotent": "MISS" },
    });
  } catch (error) {
    console.error("[StoreCartAddAPI] Fetch error:", error);
    setCached(idemKey, { error: "Failed to add to cart" }, 500);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
