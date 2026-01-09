import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/admin/students/${params.id}/available-courses/${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    { method: "GET" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("content-type", response.headers.get("content-type") || "application/json");
  return res;
}
