import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Context = { params: Promise<{ planId: string }> };

export async function POST(_req: NextRequest, context: Context) {
  const { planId } = await context.params;

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/admin/billing/plans/${planId}/activate/`,
    { method: "POST" }
  );

  const data = text ? JSON.parse(text) : null;
  const res = NextResponse.json(data, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}
