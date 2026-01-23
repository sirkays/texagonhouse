import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

type Params = { id: string };

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;

  const r = await djangoFetch(`/core/api/admin/classrooms/${id}/modal/`, {
    method: "GET",
  });

  if (!r.response.ok) {
    const res = NextResponse.json(
      { detail: r.text || "Failed to fetch classroom modal data." },
      { status: r.response.status }
    );
    return attachSetCookie(res, r.setCookie);
  }

  // Django returns JSON, but djangoFetch gives us text
  let data: any = null;
  try {
    data = r.text ? JSON.parse(r.text) : null;
  } catch {
    data = null;
  }

  const res = NextResponse.json(data ?? {}, { status: 200 });
  return attachSetCookie(res, r.setCookie);
}
