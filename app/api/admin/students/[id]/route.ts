// app/api/students/[id]/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function PUT(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();

    const {id} = params;

    if (!id) {
      return NextResponse.json(
        {error: "Student ID is required"},
        {status: 400}
      );
    }

    const res = await fetch(`${BASE_URL}/api/admin/students/${id}/`, {
      method: "PUT",
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
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {id} = params;

    if (!id) {
      return NextResponse.json(
        {error: "Student ID is required"},
        {status: 400}
      );
    }

    const res = await fetch(`${BASE_URL}/api/admin/students/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    if (!res.ok) {
      const data = await res.json();

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
