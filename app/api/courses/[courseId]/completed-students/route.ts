// app/api/courses/[courseId]/completed-students/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const { response, text, setCookie } = await djangoFetch(
    `/academics/api/courses/${courseId}/completed-students/`,
    { method: "GET" }
  );

  const res = new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });

  // Forward Django session cookie if present
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}
