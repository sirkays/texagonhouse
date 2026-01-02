import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const ENDPOINT = `${BASE_URL}/api/teacher/tutoring-bookings/`;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const {searchParams} = new URL(request.url);
  const tab = searchParams.get("tab") || "upcoming";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "3";

  try {
    const res = await fetch(
      `${ENDPOINT}?tab=${tab}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
      }
    );

    const text = await res.text();

    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("[Route] Response is not JSON, content-type:", contentType);
      return NextResponse.json(
        {error: `Backend returned non-JSON response (status: ${res.status})`},
        {status: res.status}
      );
    }

    const data = JSON.parse(text);

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || `Failed to fetch data (status: ${res.status})`},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
