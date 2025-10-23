import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req, {params}) {
  const {agreement_id} = params;
  const endpoint = `/api/store/bnpl/agreements/${agreement_id}`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[BNPL Agreement API] Fetching:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(session.user.sessionToken),
    });

    console.log("[BNPL Agreement API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Agreement not found", 404);
      }
      return createErrorResponse(
        "Failed to fetch BNPL agreement",
        response.status
      );
    }

    const data = await response.json();
    console.log("[BNPL Agreement API] Fetch successful");

    return NextResponse.json(data, {
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
