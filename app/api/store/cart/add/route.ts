import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function POST(req) {
  const endpoint = "/api/store/cart/add";
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Cart Add API] Posting to:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[Cart Add API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Cart Add API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 400) {
        return createErrorResponse("Invalid product", 400);
      }
      return createErrorResponse("Failed to add item to cart", response.status);
    }

    const data = await response.json();
    console.log("[Cart Add API] Add successful");

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
