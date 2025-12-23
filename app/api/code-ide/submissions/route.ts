// app/api/student/code/submissions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /code-ide/api/ide/submissions/");

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  // forward optional ?lesson= query to backend
  const { searchParams } = new URL(request.url);
  const lesson = searchParams.get("lesson");

  const backendUrl = new URL(`${BASE_URL}/code-ide/api/ide/student/submissions/`);
  if (lesson) backendUrl.searchParams.set("lesson", lesson);

  try {
    console.log("[Route] Fetching data from", backendUrl.toString());

    const res = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("[Route] API response status:", res.status);

    const raw = await res.text();
    let data: any = raw;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // keep as text (useful when backend returns HTML/trace)
    }

    console.log("[Route] API response data:", data);

    if (!res.ok) {
      return NextResponse.json(
        { error: (data && (data.detail || data.error)) || "Failed to fetch data", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
