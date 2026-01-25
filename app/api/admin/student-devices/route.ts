import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  const limit = searchParams.get("limit") || "20";

  const qs = new URLSearchParams({ query, limit });

  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/student-devices?${qs.toString()}`,
    { method: "GET" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}
