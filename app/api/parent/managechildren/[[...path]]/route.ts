import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
// import { BASE_URL, API_KEY } from "@/lib/config";

// lib/config.ts
export const BASE_URL =
  process.env.BASE_URL || "https://texagonbackend.epichouse.online";

export const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz"; // fallback for dev

// ✅ GET endpoint - fetch children
export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/parent/managechildren");

  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    const url = `${BASE_URL}/accounts/api/parent/children/`;
    console.log("[Route] Fetching data from", url);

    const headers = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    };

    const res = await fetch(url, {method: "GET", headers});
    console.log("[Route] API response status:", res.status);

    const text = await res.text();
    console.log("[Route] API response text:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[Route] Failed to parse JSON:", e);
      return NextResponse.json(
        {detail: "External API returned an invalid response"},
        {status: 502}
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {detail: data.detail || "Failed to fetch children data"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching children data:", error);
    return NextResponse.json({detail: "Internal server error"}, {status: 500});
  }
}

// ✅ POST endpoint - reset password (using userId instead of childId)
export async function POST(request: Request) {
  console.log("[Route] Received POST request to /api/parent/managechildren");

  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user,
  });

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    const body = await request.json();
    console.log("[Route] Received request body:", body);

    const userId = session.user.id; // 👈 adjust this field name if your session uses userId instead
    const {newPassword} = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        {detail: "userId and newPassword are required."},
        {status: 400}
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {detail: "Password must be at least 8 characters."},
        {status: 400}
      );
    }

    const url = `${BASE_URL}/accounts/api/parent/reset-child-password/`;
    console.log("[Route] Sending reset password request to", url);

    const headers = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({childId: userId, newPassword}), // 👈 backend expects "childId"
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    console.log("[Route] API response text:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[Route] Failed to parse JSON:", e);
      return NextResponse.json(
        {detail: "External API returned an invalid response"},
        {status: 502}
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {detail: data.detail || "Failed to reset password"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error resetting password:", error);
    return NextResponse.json({detail: "Internal server error"}, {status: 500});
  }
}
