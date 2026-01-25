import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function getId(req: Request) {
  const parts = new URL(req.url).pathname.split("/");
  return parts[parts.length - 1];
}

export async function PATCH(req: Request) {
  const id = getId(req);
  const body = await req.json();

  const { response, text, setCookie } = await djangoFetch(`/gamification/api/admin/gamification/achievements/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}
