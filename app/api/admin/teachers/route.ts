// app/api/admin/teachers/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
  console.log("[Route] Received GET request to /api/teachers");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BASE_URL}/api/admin/teachers/?${queryString}`
      : `${BASE_URL}/api/admin/teachers/`;
    console.log("[Route] Fetching data from", url);
    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
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
  console.log("[Route] Received POST request to /api/teachers");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
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
      console.log("[Route] Request body:", jsonBody);
      if (!jsonBody.email) {
        return NextResponse.json({error: "Email is required"}, {status: 400});
      }
      fetchBody = JSON.stringify(jsonBody);
      headers["Content-Type"] = "application/json";
    }

    console.log(
      "[Route] Creating teacher from",
      `${BASE_URL}/api/admin/teachers/`
    );
    const res = await fetch(`${BASE_URL}/api/admin/teachers/`, {
      method: "POST",
      headers,
      body: fetchBody,
    });

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API post failed:", data);
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
