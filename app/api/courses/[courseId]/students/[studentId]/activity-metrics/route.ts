import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string; studentId: string }> }
) {
  const { courseId, studentId } = await params;

  const { response, text, setCookie } = await djangoFetch(
    `/academics/api/courses/${courseId}/students/${studentId}/activity-metrics/`,
    { method: "GET" }
  );

  const headers: Record<string, string> = {};
  if (setCookie) headers["set-cookie"] = setCookie;

  return new NextResponse(text, {
    status: response.status,
    headers,
  });
}
