// app/api/classrooms/[id]/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received GET request to /api/classrooms/[id]");
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

    if (!id) {
      return NextResponse.json(
        {error: "Classroom ID is required"},
        {status: 400}
      );
    }

    console.log(
      "[Route] Fetching classroom from",
      `${BASE_URL}/api/classrooms/${id}/`
    );
    const res = await fetch(`${BASE_URL}/api/classrooms/${id}/`, {
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
        {error: data.detail || "Failed to fetch classroom"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching classroom:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function PATCH(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received PATCH request to /api/classrooms/[id]");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();
    console.log("[Route] Request body:", body);
    const {id} = params;

    if (!id) {
      return NextResponse.json(
        {error: "Classroom ID is required"},
        {status: 400}
      );
    }

    console.log(
      "[Route] Updating classroom from",
      `${BASE_URL}/api/classrooms/${id}/`
    );
    const res = await fetch(`${BASE_URL}/api/classrooms/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
    });

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API patch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to update classroom"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error updating classroom:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function DELETE(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received DELETE request to /api/classrooms/[id]");
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

    if (!id) {
      return NextResponse.json(
        {error: "Classroom ID is required"},
        {status: 400}
      );
    }

    console.log(
      "[Route] Deleting classroom from",
      `${BASE_URL}/api/classrooms/${id}/`
    );
    const res = await fetch(`${BASE_URL}/api/classrooms/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Route] API response status:", res.status);

    if (!res.ok) {
      const data = await res.json();
      console.log("[Route] API delete failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to delete classroom"},
        {status: res.status}
      );
    }

    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error("[Route] Error deleting classroom:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
