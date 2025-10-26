// app/api/tutor/tutoring/tutors/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req: Request) {
  noStore();
  const endpoint = "/api/tutor/tutoring/tutors/";
  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();
  const fullUrl = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;
  console.log("[TutoringTutorsAPI] GET tutors:", fullUrl);

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
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
          { error: "Session expired", redirect: "/login" },
          { status: 401, headers: { "Cache-Control": "no-store" } }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Access denied. Parent profile required." },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch tutors" },
        { status: response.status, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = JSON.parse(raw);
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}