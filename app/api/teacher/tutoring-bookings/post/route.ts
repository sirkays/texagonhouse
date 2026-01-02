import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const ENDPOINT = `${BASE_URL}/api/teacher/tutoring-bookings/`;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(
        "[Route] POST response is not JSON, content-type:",
        contentType
      );
      return NextResponse.json(
        {error: `Backend returned non-JSON response (status: ${res.status})`},
        {status: res.status}
      );
    }

    const data = JSON.parse(text);
    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to create tutoring offering"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] POST error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
