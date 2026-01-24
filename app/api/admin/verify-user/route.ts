import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ detail: "Invalid JSON in request body" }, { status: 400 });
    }

    // Validate required fields
    if (!body?.email) {
      return NextResponse.json({ detail: "Email field is required." }, { status: 400 });
    }

    // NOTE: this endpoint is NOT under /orgs (it’s /accounts/...)
    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/auth/verify-user/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const data = parseJsonSafely(text) ?? { detail: text };

    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    console.error("Error in verify-user API:", error);
    return NextResponse.json(
      { detail: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
