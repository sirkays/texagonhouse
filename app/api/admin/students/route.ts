// app/api/students/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

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
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BASE_URL}/api/admin/students/?${queryString}`
      : `${BASE_URL}/api/admin/students/`;

    const res = await fetch(url, {
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

    if (!body.name || !body.email || !body.admissionNo || !body.classroom) {
      return NextResponse.json(
        {error: "Name, email, admissionNo, and classroom are required"},
        {status: 400}
      );
    }

    const res = await fetch(`${BASE_URL}/api/admin/students/`, {
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
        {error: data.detail || "Failed to create student"},
        {status: res.status}
      );
    }

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    console.error("[Route] Error creating student:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
