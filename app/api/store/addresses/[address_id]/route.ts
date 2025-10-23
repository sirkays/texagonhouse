import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function PATCH(req, {params}) {
  const {address_id} = params;
  const endpoint = `/api/store/addresses/${address_id}`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Address Update API] Patching:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[Address Update API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Address Update API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Address not found", 404);
      }
      return createErrorResponse("Failed to update address", response.status);
    }

    const data = await response.json();
    console.log("[Address Update API] Update successful");

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}

export async function DELETE(req, {params}) {
  const {address_id} = params;
  const endpoint = `/api/store/addresses/${address_id}`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Address Delete API] Deleting:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: storeHeaders(session.user.sessionToken),
    });

    console.log("[Address Delete API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Address not found", 404);
      }
      return createErrorResponse("Failed to delete address", response.status);
    }

    console.log("[Address Delete API] Delete successful");

    return new NextResponse(null, {status: 204});
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
