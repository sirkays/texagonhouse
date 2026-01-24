import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, other_email, action, relationship } = body ?? {};

    // Basic validation
    if (!email || !other_email || !action) {
      return NextResponse.json(
        { detail: "Missing required fields: email, other_email, action" },
        { status: 400 }
      );
    }

    // NOTE: this endpoint is NOT under /orgs (it’s /accounts/...)
    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/update-parent-child-link/",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          other_email,
          action,
          relationship: relationship || "Parent",
        }),
      }
    );

    const data = parseJsonSafely(text) ?? { detail: text };

    if (!response.ok) {
      const res = NextResponse.json(data, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    console.error("Parent-Child Link API Error:", error);
    return NextResponse.json(
      { detail: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
