import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function POST(req, {params}) {
  const {product_id} = params;
  const endpoint = `/api/store/reviews/${product_id}`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Review API] Posting to:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[Review API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Review API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 400) {
        return createErrorResponse("Invalid product", 400);
      }
      return createErrorResponse("Failed to submit review", response.status);
    }

    const data = await response.json();
    console.log("[Review API] Submit successful");

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
