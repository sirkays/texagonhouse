// app/api/teacher/onboarding/route.ts
// Proxies teacher onboarding status GET/POST to the Django backend.

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

/**
 * GET /api/teacher/onboarding
 * Returns { has_seen_onboarding: boolean } for the authenticated teacher.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "dashboard";

    const { response, text } = await djangoFetch(
      `/accounts/api/teacher/onboarding-status/?page=${page}`,
      { method: "GET" }
    );

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(
      response.ok ? data : { error: data?.detail ?? "Failed to fetch onboarding status" },
      { status: response.status }
    );
  } catch (error) {
    console.error("[teacher/onboarding GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/teacher/onboarding
 * Marks the authenticated teacher's onboarding tour as complete.
 * Returns { has_seen_onboarding: true }
 */
export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Ignored
    }
    const page = body?.page || "dashboard";

    const { response, text } = await djangoFetch(
      "/accounts/api/teacher/onboarding-complete/",
      { 
        method: "POST",
        body: JSON.stringify({ page }),
        headers: {
            "Content-Type": "application/json"
        }
      }
    );

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(
      response.ok ? data : { error: data?.detail ?? "Failed to mark onboarding complete" },
      { status: response.status }
    );
  } catch (error) {
    console.error("[teacher/onboarding POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
