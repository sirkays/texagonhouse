// texagon_academy\texagonui\app\api\certificate\list\route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(request: Request) {
  console.groupCollapsed(
    "[Route: /api/academics/certificate/list] GET - Fetch certificates"
  );

  try {
    // Keep existing query passthrough behavior
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const path = `/academics/api/certificate/list/${queryString ? `?${queryString}` : ""}`;
    console.info("[Route] Proxying to Django path:", path);

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    console.info("[Route] External API response status:", response.status);

    // Parse JSON safely (Django should return JSON, but don't assume)
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    // If Django errored, return its payload/text
    if (!response.ok) {
      console.error(`[Route] Backend Error (${response.status}):`, text);

      const res = NextResponse.json(
        { error: data?.detail ?? data ?? text },
        { status: response.status }
      );

      // Forward session cookie updates if present
      if (setCookie) res.headers.set("set-cookie", setCookie);

      console.groupEnd();
      return res;
    }

    // Optional logging similar to your original
    if (data?.results) {
      console.info(`[Route] Found ${data.count || 0} certificates`);
    } else {
      console.info("[Route] External API result:", data);
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);

    console.groupEnd();
    return res;
  } catch (error: any) {
    console.error("[Route] Internal server error:", error?.message || error);
    console.groupEnd();
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
