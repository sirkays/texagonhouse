import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function POST(req) {
  const endpoint = "/api/store/cart/apply-coupon";
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Coupon API] Posting to:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[Coupon API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Coupon API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 400) {
        return createErrorResponse("Invalid coupon", 400);
      }
      return createErrorResponse("Failed to apply coupon", response.status);
    }

    const data = await response.json();
    console.log("[Coupon API] Apply successful");

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
