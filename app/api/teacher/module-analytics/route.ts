// app/api/assessments/teacher/module-analytics/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";
//const BASE_URL = "http://127.0.0.1:9098";
//const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:9098";
const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function GET(req: Request) {
  noStore();
  const endpoint = "/assessments/api/teacher/module-analytics/";
  const {searchParams} = new URL(req.url);
  const fullUrl = `${BASE_URL}${endpoint}`;

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401, headers: {"Cache-Control": "no-store"}}
    );
  }

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401, headers: {"Cache-Control": "no-store"}}
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          {error: "Access denied. Teacher profile required."},
          {status: 403, headers: {"Cache-Control": "no-store"}}
        );
      }
      return NextResponse.json(
        {error: "Failed to fetch module analytics"},
        {status: response.status, headers: {"Cache-Control": "no-store"}}
      );
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500, headers: {"Cache-Control": "no-store"}}
      );
    }

    const data = JSON.parse(raw);
    return NextResponse.json(data, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Server error", details: (error as Error).message},
      {status: 500, headers: {"Cache-Control": "no-store"}}
    );
  }
}
