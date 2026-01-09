import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Context = { params: Promise<{ complaintId: string }> };

export async function POST(req: NextRequest, context: Context) {
  const { complaintId } = await context.params;
  const body = await req.json();

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/admin/complaints/${complaintId}/responses/`,
    { method: "POST", body: JSON.stringify(body) }
  );

  const data = text ? JSON.parse(text) : null;
  const res = NextResponse.json(data, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}
