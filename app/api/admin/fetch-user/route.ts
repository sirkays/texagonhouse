// app/api/.../fetch-user/route.ts  (wherever this POST route lives)
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body?.email) {
      return NextResponse.json(
        { detail: "Email field is required." },
        { status: 400 }
      );
    }

    // Your proxy already handles:
    // - Api-Key
    // - X-Session-Token (from NextAuth session)
    // - Cookies forwarding
    const { response, text, setCookie } = await djangoFetch(
      `/accounts/api/auth/fetch-user/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const data = safeJson(text);

    const res = NextResponse.json(
      response.ok
        ? (data ?? { raw: text })
        : (data ?? { detail: "Backend request failed" }),
      { status: response.status }
    );

    // Forward Django cookies (sessionid, etc.)
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error: any) {
    console.error("Error in fetch-user API:", error);
    return NextResponse.json(
      { detail: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
