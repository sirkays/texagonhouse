import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ achievement_id: string }> | { achievement_id: string } }
) {
  noStore();

  // ✅ supports both Next styles (params may be a Promise in newer versions)
  const { achievement_id } = await Promise.resolve(ctx.params);
  const achievementId = achievement_id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/gamification/achievements/${encodeURIComponent(achievementId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
        // headers optional; djangoFetch already sets Api-Key + session token + cookies
      }
    );

    // parse JSON safely
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { detail: text };
    }

    if (!response.ok) {
      const msg =
        data?.detail ||
        data?.error ||
        data?.message ||
        "Failed to update achievement";

      const status = response.status;

      // keep your custom mapping
      let errorResp: any = { error: msg };

      if (status === 401) {
        errorResp = { error: "Session expired", redirect: "/login" };
      } else if (status === 403) {
        errorResp = { error: "Forbidden - not an org admin/teacher" };
      } else if (status === 404) {
        errorResp = { error: "Achievement not found" };
      } else if (status === 400) {
        errorResp = { error: "Bad request (validation error)" };
      } else {
        errorResp = { error: "Failed to update achievement", details: msg };
      }

      const res = NextResponse.json(errorResp, { status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Achievement PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
