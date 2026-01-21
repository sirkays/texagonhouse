// app/api/accounts/verify-email/route.ts  (adjust path to your actual file)
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  console.log(`[Verify Route] Received POST request`);

  try {
    const body = await request.json();

    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/auth/verify-email/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    // Read text -> parse JSON safely (handles HTML/timeouts)
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error(
        "[Verify Route] Failed to parse JSON. Raw response:",
        text.slice(0, 200)
      );

      const res = NextResponse.json(
        { error: "Backend Error: Received invalid response from server." },
        { status: response.status || 500 }
      );

      // Forward Django cookie if present
      if (setCookie) res.headers.set("set-cookie", setCookie);

      return res;
    }

    if (!response.ok) {
      const res = NextResponse.json(
        { error: data?.detail || data?.error || "Failed to verify email" },
        { status: response.status }
      );

      if (setCookie) res.headers.set("set-cookie", setCookie);

      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Verify Route] Internal Server Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
