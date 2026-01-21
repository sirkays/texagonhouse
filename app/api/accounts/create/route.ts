// texagon_academy/texagonui/app/api/accounts/create/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/account/create/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    // Try parse JSON, but gracefully handle HTML/timeouts/etc.
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      const res = NextResponse.json(
        {
          detail:
            "Backend Error: The server returned an invalid response (likely timeout/HTML).",
        },
        { status: response.status || 500 }
      );

      // Forward Django cookie if present
      if (setCookie) res.headers.set("set-cookie", setCookie);

      return res;
    }

    if (!response.ok) {
      const res = NextResponse.json(
        { detail: data?.detail || data?.error || "Failed to create account" },
        { status: response.status }
      );

      if (setCookie) res.headers.set("set-cookie", setCookie);

      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Create Route] Internal Server Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
