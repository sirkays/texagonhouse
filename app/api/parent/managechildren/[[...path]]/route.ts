import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

// lib/config.ts
export const BASE_URL =
  process.env.BASE_URL || "https://texagonbackend.onrender.com";

export const API_KEY =
  process.env.API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c"; // fallback for dev

//const BASE_URL = "http://127.0.0.1:9098";
// ✅ GET endpoint - fetch children
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    const url = `${BASE_URL}/accounts/api/parent/children/`;

    const headers = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    };

    const res = await fetch(url, {method: "GET", headers});

    const text = await res.text();

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
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    const body = await request.json();

    const userId = session.user.id; // 👈 adjust this field name if your session uses userId instead
    const {childId, newPassword} = body;

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

    const headers = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({childId: childId, newPassword}), // 👈 backend expects "childId"
    });

    const text = await res.text();

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
