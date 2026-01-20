import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function PATCH(req: Request) {
  const body = await req.json();

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const courseId = parts[3]; // ["api","teacher","courses",":id","general-activation"]

  const { response, text, setCookie } = await djangoFetch(
    `/learning/api/teacher/courses/${courseId}/general-activation/`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );

  const res = new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });

  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}
