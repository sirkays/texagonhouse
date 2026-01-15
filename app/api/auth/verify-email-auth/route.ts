// app/api/auth/verify/route.ts (example path)
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  console.log(`[Verify Route] Received POST request`);

  try {
    const body = await request.json();

    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/auth/verify-email-auth/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    // Parse JSON safely
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[Verify Route] Failed to parse JSON. Raw:", text.slice(0, 200));
      const out = NextResponse.json(
        { error: "Backend Error: Received invalid response from server." },
        { status: response.status || 500 }
      );

      if (setCookie) out.headers.append("set-cookie", setCookie);
      return out;
    }

    // Build response
    const out = NextResponse.json(
      response.ok ? data : { error: data.detail || "Failed to verify email" },
      { status: response.ok ? 200 : response.status }
    );

    // IMPORTANT: forward Django sessionid (or any cookies) back to browser
    if (setCookie) out.headers.append("set-cookie", setCookie);

    return out;
  } catch (error) {
    console.error("[Verify Route] Internal Server Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
