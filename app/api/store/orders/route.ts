import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req) {
  const endpoint = "/api/store/orders";
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Orders API] Fetching:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(session.user.sessionToken),
    });

    console.log("[Orders API] Response status:", response.status);

    if (!response.ok) {
      return createErrorResponse("Failed to fetch orders", response.status);
    }

    const data = await response.json();
    console.log("[Orders API] Fetch successful");

    return NextResponse.json(data, {
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
