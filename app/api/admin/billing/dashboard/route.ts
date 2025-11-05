import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
  console.log(
    "[Billing Dashboard Route] Received GET request to /api/admin/billing/dashboard"
  );
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    console.log("[Billing Dashboard Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const invoicesPage = searchParams.get("invoices_page") || "1";
    const invoicesPageSize = searchParams.get("invoices_page_size") || "10";
    const invoicesSearch = searchParams.get("invoices_search") || "";

    // Build query parameters
    const queryParams = new URLSearchParams({
      invoices_page: invoicesPage,
      invoices_page_size: invoicesPageSize,
    });

    if (invoicesSearch) {
      queryParams.append("invoices_search", invoicesSearch);
    }

    const url = `${BASE_URL}/api/admin/billing/dashboard?${queryParams.toString()}`;
    console.log("[Billing Dashboard Route] Fetching data from", url);

    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Billing Dashboard Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Billing Dashboard Route] API response data:", data);

    if (!res.ok) {
      console.log("[Billing Dashboard Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to fetch billing dashboard"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "[Billing Dashboard Route] Error fetching billing dashboard:",
      error
    );
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
