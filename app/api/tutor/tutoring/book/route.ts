// app/api/tutor/tutoring/book/route.ts
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
export async function POST(req: Request) {
  noStore();
  const endpoint = "/api/tutor/tutoring/book/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TutoringBookAPI] POST booking:", fullUrl);
  const session = await getServerSession(authOptions);
  console.log("[TutoringBookAPI] Session:", { userId: session?.user?.id, hasToken: !!session?.user?.sessionToken });
  if (!session?.user?.sessionToken) {
    console.log("[TutoringBookAPI] No session token, returning 401");
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
  try {
    const body = await req.json();
    console.log("[TutoringBookAPI] Request body:", body);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(body),
    });
    console.log("[TutoringBookAPI] Backend response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    console.log("[TutoringBookAPI] Backend raw response:", raw);
    if (!response.ok) {
      console.log("[TutoringBookAPI] Error response:", { status: response.status, raw });
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
        { error: "Failed to create/update booking" },
        { status: response.status, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (!contentType.includes("application/json")) {
      console.log("[TutoringBookAPI] Invalid content-type:", contentType);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }
    const data = JSON.parse(raw);
    console.log("[TutoringBookAPI] Parsed data:", data);
    return NextResponse.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.log("[TutoringBookAPI] Catch error:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}