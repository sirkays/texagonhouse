import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req) {
  const endpoint = "/api/store/categories";
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[Categories API] Fetching:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(), // No session token needed for categories
    });

    console.log("[Categories API] Response status:", response.status);

    if (!response.ok) {
      return createErrorResponse("Failed to fetch categories", response.status);
    }

    const data = await response.json();
    console.log("[Categories API] Fetch successful");

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
