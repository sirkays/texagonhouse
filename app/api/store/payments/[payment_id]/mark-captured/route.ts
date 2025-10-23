import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function POST(req, {params}) {
  const {payment_id} = params;
  const endpoint = `/api/store/payments/${payment_id}/mark-captured`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Payment Capture API] Posting to:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[Payment Capture API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Payment Capture API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Payment not found", 404);
      }
      return createErrorResponse(
        "Failed to mark payment as captured",
        response.status
      );
    }

    const data = await response.json();
    console.log("[Payment Capture API] Capture successful");

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
