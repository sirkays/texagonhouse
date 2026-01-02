import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.sessionToken) {
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

    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const data = await res.json();

    if (!res.ok) {
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
