import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function DELETE(req, {params}) {
  const {item_id} = params;
  const endpoint = `/api/store/cart/items/${item_id}/remove`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Cart Remove API] Deleting:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: storeHeaders(session.user.sessionToken),
    });

    console.log("[Cart Remove API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Item not found", 404);
      }
      return createErrorResponse(
        "Failed to remove item from cart",
        response.status
      );
    }

    const data = await response.json();
    console.log("[Cart Remove API] Remove successful");

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
