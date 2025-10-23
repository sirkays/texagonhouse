import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req) {
  const {searchParams} = new URL(req.url);
  const endpoint = "/api/store/products";
  const queryString = searchParams.toString();
  const fullUrl = `${STORE_BASE_URL}${endpoint}${
    queryString ? `?${queryString}` : ""
  }`;

  console.log("[Products API] Fetching:", fullUrl);

  const session = await getSession();

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(session?.user?.sessionToken),
    });

    console.log("[Products API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        return createErrorResponse("Not authenticated", 401);
      }
      return createErrorResponse("Failed to fetch products", response.status);
    }

    const data = await response.json();
    console.log("[Products API] Fetch successful");

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
