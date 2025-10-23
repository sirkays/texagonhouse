import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function POST(req, {params}) {
  const {order_id} = params;
  const endpoint = `/api/store/bnpl/${order_id}/start`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[BNPL Start API] Posting to:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[BNPL Start API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[BNPL Start API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 400) {
        return createErrorResponse("Invalid plan or order not eligible", 400);
      }
      if (response.status === 404) {
        return createErrorResponse("Order not found", 404);
      }
      return createErrorResponse("Failed to start BNPL", response.status);
    }

    const data = await response.json();
    console.log("[BNPL Start API] Start successful");

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
