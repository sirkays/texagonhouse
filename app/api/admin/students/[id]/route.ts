import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function PUT(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received PUT request to /api/admin/students/[id]");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const {id} = params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({error: "Invalid student ID"}, {status: 400});
  }

  try {
    const body = await request.json();
    console.log("[Route] Request body:", body);

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        {error: "Request body is required"},
        {status: 400}
      );
    }

    console.log(
      "[Route] Updating student from",
      `${BASE_URL}/api/admin/students/${id}/`
    );
    const res = await fetch(`${BASE_URL}/api/admin/students/${id}/`, {
      method: "PUT",
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
      console.log("[Route] API put failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to update student"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error updating student:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function DELETE(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received DELETE request to /api/admin/students/[id]");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const {id} = params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({error: "Invalid student ID"}, {status: 400});
  }

  try {
    console.log(
      "[Route] Deleting student from",
      `${BASE_URL}/api/admin/students/${id}/`
    );
    const res = await fetch(`${BASE_URL}/api/admin/students/${id}/`, {
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
        {error: data.detail || "Failed to delete student"},
        {status: res.status}
      );
    }

    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error("[Route] Error deleting student:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
