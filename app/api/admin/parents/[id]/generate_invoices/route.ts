import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function POST(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log(
    "[Route] Received POST request to /api/admin/parents/[id]/generate_invoices"
  );
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {id} = params;

    console.log(
      "[Route] Generating invoices at",
      `${BASE_URL}/api/parents/${id}/generate_invoices/`
    );
    const res = await fetch(
      `${BASE_URL}/api/parents/${id}/generate_invoices/`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "X-Session-Token": session.user.sessionToken,
        },
      }
    );

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API post failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to generate invoices"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error generating invoices:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
