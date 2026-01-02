// app/api/admin/teachers/route.ts
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
      ? `${BASE_URL}/api/admin/teachers/?${queryString}`
      : `${BASE_URL}/api/admin/teachers/`;

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
    const contentType = request.headers.get("content-type") || "";
    let fetchBody: BodyInit | null = null;
    const headers: HeadersInit = {
      Authorization: `Api-Key ${API_KEY}`,
      "X-Session-Token": session.user.sessionToken,
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      if (!formData.get("email")) {
        return NextResponse.json({error: "Email is required"}, {status: 400});
      }
      fetchBody = formData;
    } else {
      const jsonBody = await request.json();

      if (!jsonBody.email) {
        return NextResponse.json({error: "Email is required"}, {status: 400});
      }
      fetchBody = JSON.stringify(jsonBody);
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE_URL}/api/admin/teachers/`, {
      method: "POST",
      headers,
      body: fetchBody,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to create teacher"},
        {status: res.status}
      );
    }

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    console.error("[Route] Error creating teacher:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
