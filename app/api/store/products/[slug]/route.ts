import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req, {params}) {
  const {slug} = params;
  const endpoint = `/api/store/products/${slug}`;
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;

  console.log("[Product Detail API] Fetching:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(), // No session token needed for product details
    });

    console.log("[Product Detail API] Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return createErrorResponse("Product not found", 404);
      }
      return createErrorResponse("Failed to fetch product", response.status);
    }

    const data = await response.json();
    console.log("[Product Detail API] Fetch successful");

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
