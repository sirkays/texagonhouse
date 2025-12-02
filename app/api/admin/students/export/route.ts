// app/api/students/export/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
  console.log("[Route] Received GET request to /api/students/export");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BASE_URL}/api/admin/students/export/?${queryString}`
      : `${BASE_URL}/api/admin/students/export/`;
    console.log("[Route] Fetching export from", url);
    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Route] API response status:", res.status);

    if (!res.ok) {
      const data = await res.json();
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to export data"},
        {status: res.status}
      );
    }

    const headers = new Headers(res.headers);
    headers.set("Content-Type", "text/csv");
    headers.set("Content-Disposition", "attachment; filename=students.csv");

    return new NextResponse(res.body, {
      status: res.status,
      headers,
    });
  } catch (error) {
    console.error("[Route] Error exporting data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
