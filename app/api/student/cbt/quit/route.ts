// app/api/student/cbt/quit/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function POST(request: Request) {
  console.log("[Route] Received POST to /api/student/cbt/quit");

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json(
      { detail: "Authentication required." },
      { status: 401 }
    );
  }

  let payload: any = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const test_id = payload?.test_id ?? payload?.testId ?? payload?.test;
  if (test_id == null || Number.isNaN(Number(test_id))) {
    return NextResponse.json(
      { detail: "Missing or invalid 'test_id'." },
      { status: 400 }
    );
  }

  // Pass through device id if provided by the client
  const deviceId = request.headers.get("x-device-id") || request.headers.get("X-Device-ID") || "";

  try {
    const upstreamRes = await fetch(
      `${BASE_URL}/assessments/api/student/cbt-quit/`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
          ...(deviceId ? { "X-Device-ID": deviceId } : {}),
        },
        body: JSON.stringify({ test_id: Number(test_id) }),
      }
    );

    const text = await upstreamRes.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // If backend didn’t return JSON, wrap raw text
      data = { raw: text };
    }

    if (!upstreamRes.ok) {
      console.log("[Route] Upstream error:", upstreamRes.status, data);
      return NextResponse.json(
        data?.detail ? { detail: data.detail } : { error: "Upstream error", data },
        { status: upstreamRes.status }
      );
    }

    // Expected success shape from your Django view: { status: "success" }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[Route] Error proxying to cbt-quit:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
