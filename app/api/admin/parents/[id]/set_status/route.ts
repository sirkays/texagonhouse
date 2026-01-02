import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function POST(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {id} = params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({error: "status is required"}, {status: 400});
    }

    if (!["active", "inactive", "suspended"].includes(body.status)) {
      return NextResponse.json({error: "Invalid status value"}, {status: 400});
    }

    console.log(
      "[Route] Setting status at",
      `${BASE_URL}/api/parents/${id}/set_status/`
    );
    const res = await fetch(`${BASE_URL}/api/parents/${id}/set_status/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to set status"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error setting status:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
