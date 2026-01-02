import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

interface Params {
  params: {
    invoiceId: string;
  };
}

export async function GET(request: NextRequest, {params}: Params) {
  const invoiceId = params.invoiceId;

  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  if (!invoiceId) {
    return NextResponse.json({error: "Invoice ID is required"}, {status: 400});
  }

  try {
    const url = `${BASE_URL}/api/admin/billing/invoices/${invoiceId}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to fetch invoice"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Invoice Route] Error fetching invoice:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
