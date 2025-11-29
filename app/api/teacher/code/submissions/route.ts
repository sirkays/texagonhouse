// app/code-ide/api/teacher/submissions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
export async function GET(request: Request) {
  console.log("[Route] Received GET request to code-ide/api/teacher/submissions/");
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }
  try {
    const backendUrl = new URL(`${BASE_URL}/code-ide/api/teacher/submissions/`);
    const { searchParams } = new URL(request.url);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });
    console.log("[Route] Fetching data from", backendUrl.toString());
    const res = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
    });
    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);
    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to fetch data" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}