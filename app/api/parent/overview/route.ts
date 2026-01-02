import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const res = await fetch(
      `${BASE_URL}/accounts/api/dashboard/parent/overview/`,
      {
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
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
