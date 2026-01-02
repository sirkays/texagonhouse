import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const BASE_URL = "https://texagonbackend.onrender.com/accounts";
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
    const res = await fetch(`${BASE_URL}/api/fetch-admin/access-orgs/`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to fetch data"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();

    if (!body.orgs_id) {
      return NextResponse.json(
        {error: "Organization ID is required"},
        {status: 400}
      );
    }

    const res = await fetch(`${BASE_URL}/api/set-admin/access-orgs/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify({orgs_id: body.orgs_id}),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to set organization"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error setting organization:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
