import {NextResponse} from "next/server";
import {
  storeHeaders,
  getSession,
  handleApiError,
  createErrorResponse,
} from "@/lib/store-api";

export async function GET(req) {
  const endpoint = "/api/store/bnpl/plans";
  const fullUrl = `${STORE_BASE_URL}${endpoint}`;
  console.log("[BNPL Plans API] Fetching:", fullUrl);

  const session = await getSession();

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: storeHeaders(session?.user?.sessionToken),
    });

    console.log("[BNPL Plans API] Response status:", response.status);

    if (!response.ok) {
      return createErrorResponse("Failed to fetch BNPL plans", response.status);
    }

    const data = await response.json();
    console.log("[BNPL Plans API] Fetch successful");

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return handleApiError(error, endpoint);
  }
}
