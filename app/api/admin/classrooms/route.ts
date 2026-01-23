// app/api/admin/classrooms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

function tryJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ✅ GET /api/admin/classrooms - List all classrooms
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionToken =
    session?.user && "sessionToken" in session.user
      ? (session.user as any).sessionToken
      : undefined;

  if (!sessionToken) {
    console.warn("[Admin Classrooms] No session token found");
    return NextResponse.json(
      { detail: "Invalid or missing session token." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const org_id = searchParams.get("org_id");
    const page_size = searchParams.get("page_size");

    // proxy BASE_URL is https://texagonbackend.onrender.com
    // so include /orgs in the path (same as your old BASE_URL)
    const qs = new URLSearchParams();
    if (org_id) qs.set("org_id", org_id);
    if (page_size) qs.set("page_size", page_size);

    const path = `/orgs/api/classrooms/${qs.toString() ? `?${qs.toString()}` : ""}`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const data = tryJson(text) ?? { detail: text };

    if (!response.ok) {
      console.error("[Admin Classrooms] Backend error:", data);

      if (response.status === 403) {
        return NextResponse.json(
          { detail: "Unauthorized: Invalid session token or API key" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { detail: (data as any)?.detail || "Failed to fetch classrooms" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data);
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Admin Classrooms] Error fetching classrooms:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// ✅ POST /api/admin/classrooms - Create a new classroom
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionToken =
    session?.user && "sessionToken" in session.user
      ? (session.user as any).sessionToken
      : undefined;

  if (!sessionToken) {
    console.warn("[Admin Classrooms] No session token found");
    return NextResponse.json(
      { detail: "Invalid or missing session token." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const { response, text, setCookie } = await djangoFetch("/orgs/api/classrooms/", {
      method: "POST",
      body: JSON.stringify(body),
      // headers optional; proxy already sets Content-Type: application/json
    });

    const data = tryJson(text) ?? { detail: text };

    if (!response.ok) {
      console.error("[Admin Classrooms] Backend error:", data);

      if (response.status === 403) {
        return NextResponse.json(
          { detail: "Unauthorized: Invalid session token or API key" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { detail: (data as any)?.detail || "Failed to create classroom" },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data, { status: 201 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Admin Classrooms] Error creating classroom:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
