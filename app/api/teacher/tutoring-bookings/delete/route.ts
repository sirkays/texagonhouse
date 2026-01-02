// app/api/teacher/tutoring-bookings/delete/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const ENDPOINT = `${BASE_URL}/api/teacher/tutoring-bookings/`;

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "upcoming";
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await fetch(`${ENDPOINT}?tab=${tab}&id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    
    // 204 No Content: Success, no body
    if (res.status === 204) {
      return new Response(null, { status: 204 });
    }

    // For all other cases, try to parse JSON
    const text = await res.text();
    const contentType = res.headers.get("content-type");

    if (!contentType?.includes("application/json") && text) {
      console.error("[Route] Non-JSON response:", text);
      return NextResponse.json(
        { error: "Backend returned invalid response" },
        { status: 502 }
      );
    }

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from backend" },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to delete" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("[Route] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}