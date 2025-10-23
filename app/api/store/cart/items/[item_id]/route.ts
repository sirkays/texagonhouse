import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function PATCH(req, {params}) {
  const {item_id} = params;
  const endpoint = `/api/store/cart/items/${item_id}`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Cart Update API] Patching:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[Cart Update API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Cart Update API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Item not found", 404);
      }
      return createErrorResponse("Failed to update cart item", response.status);
    }

    const data = await response.json();
    console.log("[Cart Update API] Update successful");

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
