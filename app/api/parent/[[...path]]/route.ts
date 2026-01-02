import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY =
  process.env.TEXAGON_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c"; // Fallback for dev, should be in .env

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    const headers = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": session.user.sessionToken,
    };

    const backendUrl = new URL("/accounts/api/parent/children/", BASE_URL);

    const incomingUrl = new URL(request.url);
    incomingUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const res = await fetch(backendUrl.toString(), {method: "GET", headers});

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
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
    const {childId, newPassword} = body;

    if (!childId || !newPassword) {
      return NextResponse.json(
        {detail: "child_id and new_password are required."},
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
      body: JSON.stringify({child_id: childId, new_password: newPassword}),
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
      if (res.status === 403) {
        return NextResponse.json(
          {detail: "Unauthorized: Invalid session token or API key"},
          {status: 403}
        );
      }
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
