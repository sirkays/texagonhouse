import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request) {
  const body = await req.json();

  const { response, text, setCookie } = await djangoFetch(
    "/accounts/api/parent/resume/",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const res = new NextResponse(text, { status: response.status });

  // forward cookies if Django sets any
  if (setCookie) res.headers.set("set-cookie", setCookie);

  // keep content-type consistent
  res.headers.set("content-type", "application/json");

  return res;
}
