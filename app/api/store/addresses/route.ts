import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req) {
  const endpoint = "/api/store/addresses";
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Addresses API] Fetching:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(session.user.sessionToken),
    });

    console.log("[Addresses API] Response status:", response.status);

    if (!response.ok) {
      return createErrorResponse("Failed to fetch addresses", response.status);
    }

    const data = await response.json();
    console.log("[Addresses API] Fetch successful");

    return NextResponse.json(data, {
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}

export async function POST(req) {
  const endpoint = "/api/store/addresses";
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Addresses API] Creating address:", fullUrl);

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return createErrorResponse("Not authenticated", 401);
  }

  try {
    const body = await req.json();
    console.log("[Addresses API] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: storeHeaders(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Addresses API] Response status:", response.status);

    if (!response.ok) {
      return createErrorResponse("Failed to create address", response.status);
    }

    const data = await response.json();
    console.log("[Addresses API] Create successful");

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
