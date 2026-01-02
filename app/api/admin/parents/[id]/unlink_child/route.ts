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
  console.log(
    "[Route] Received POST request to /api/admin/parents/[id]/unlink_child"
  );
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {id} = params;
    const body = await request.json();

    if (!body.student_id) {
      return NextResponse.json(
        {error: "student_id is required"},
        {status: 400}
      );
    }

    const res = await fetch(`${BASE_URL}/api/parents/${id}/unlink_child/`, {
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
        {error: data.detail || "Failed to unlink child"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error unlinking child:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
