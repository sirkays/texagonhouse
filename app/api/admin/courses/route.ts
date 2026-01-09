//texagon_academy\texagonui\app\api\admin\courses\route.ts
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098/orgs";
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
      ? `${BASE_URL}/api/admin/courses/?${queryString}`
      : `${BASE_URL}/api/admin/courses/`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to fetch courses"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Courses Route] Error fetching courses:", error);
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
      if (!formData.get("name")) {
        return NextResponse.json({error: "Name is required"}, {status: 400});
      }
      fetchBody = formData;
    } else {
      const jsonBody = await request.json();
      if (!jsonBody.name) {
        return NextResponse.json({error: "Name is required"}, {status: 400});
      }
      fetchBody = JSON.stringify(jsonBody);
      headers["Content-Type"] = "application/json";
    }

    const url = new URL(`${BASE_URL}/api/admin/courses/create/`);
    url.searchParams.append("org_id", "1");
    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: fetchBody,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to create course"},
        {status: res.status}
      );
    }

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    console.error("[Courses Route] Error creating course:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
