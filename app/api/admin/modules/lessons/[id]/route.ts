import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(_request: Request, ctx: RouteParams) {
  // ✅ Next.js 15-safe (params can be a Promise)
  const { id } = await Promise.resolve(ctx.params);

  try {
    // Validate module ID
    const moduleIdNum = Number.parseInt(id, 10);
    if (!id || Number.isNaN(moduleIdNum)) {
      return NextResponse.json({ detail: "Invalid module ID" }, { status: 400 });
    }

    // NOTE: this is an /orgs endpoint (matches your original BASE_URL=/orgs)
    const path = `/orgs/api/admin/module/lessons/${encodeURIComponent(id)}/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
      // IMPORTANT: do NOT add X-Session-Key / Session-Token / X-Session-Token here.
      // djangoFetch already attaches X-Session-Token consistently.
    });

    const data = parseJsonSafely(text);

    if (!response.ok) {
      if (response.status === 403) {
        const res = NextResponse.json(
          { detail: data?.detail || "Authentication failed" },
          { status: 403 }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { detail: data?.detail || "Module not found" },
          { status: 404 }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      const res = NextResponse.json(
        { detail: data?.detail || "Failed to fetch module lessons" },
        { status: response.status }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Admin Module Lessons] Error fetching module lessons:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
