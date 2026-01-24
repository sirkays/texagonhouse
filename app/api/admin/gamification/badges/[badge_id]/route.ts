import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ badge_id: string }> | { badge_id: string } }
) {
  noStore();

  // ✅ supports both Next styles (params may be a Promise)
  const { badge_id } = await Promise.resolve(ctx.params);
  const badgeId = badge_id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/gamification/badges/${encodeURIComponent(badgeId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const status = response.status;

      // Map common statuses like your original code
      let errorResp: any = { error: "Failed to update badge" };

      if (status === 401) {
        errorResp = { error: "Session expired", redirect: "/login" };
      } else if (status === 403) {
        errorResp = { error: "Forbidden - not an org admin/teacher" };
      } else if (status === 404) {
        errorResp = { error: "Badge not found" };
      } else if (status === 400) {
        errorResp = { error: "Bad request (validation error)" };
      } else {
        const msg = data?.detail || data?.error || data?.message || text;
        errorResp = { error: "Failed to update badge", details: msg };
      }

      const res = NextResponse.json(errorResp, { status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Badge PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
