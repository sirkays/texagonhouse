import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req, {params}) {
  const {order_id} = params;
  const endpoint = `/api/store/orders/${order_id}`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Order Detail API] Fetching:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(session.user.sessionToken),
    });

    console.log("[Order Detail API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Order not found", 404);
      }
      return createErrorResponse("Failed to fetch order", response.status);
    }

    const data = await response.json();
    console.log("[Order Detail API] Fetch successful");

    return NextResponse.json(data, {
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
