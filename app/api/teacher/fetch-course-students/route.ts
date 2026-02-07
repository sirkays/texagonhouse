import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const course_id = searchParams.get("course_id");
  const test_id = searchParams.get("test_id");
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "10";

  const params = new URLSearchParams();
  if (course_id) params.append("course_id", course_id);
  if (test_id) params.append("test_id", test_id);
  params.append("page", page);
  params.append("limit", limit);

  const { response, text, setCookie } = await djangoFetch(
    `/assessments/api/teacher/fetch-course-students/?${params.toString()}`,
    { method: "GET" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}
