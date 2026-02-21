import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const { searchParams } = new URL(req.url);

    const qs = new URLSearchParams();
    const date = searchParams.get("date");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const student_id = searchParams.get("student_id");

    if (date) qs.append("date", date);
    if (start_date) qs.append("start_date", start_date);
    if (end_date) qs.append("end_date", end_date);
    if (student_id) qs.append("student_id", student_id);

    const path = `/api/attendance/teacher/${courseId}/records/${
      qs.toString() ? `?${qs}` : ""
    }`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const res = new NextResponse(text, { status: response.status });

    if (setCookie) res.headers.set("set-cookie", setCookie);
    res.headers.set("Content-Type", "application/json");

    return res;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch attendance records",
        detail: String(error?.message ?? error),
      },
      { status: 500 }
    );
  }
}