// app/api/teacher/courses/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface Course {
  id: string;
  name: string;
  subject: string;
  classroom: string;
  description: string;
  isActive: boolean;
}

export async function GET(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const courseType = searchParams.get("course_type"); // optional e.g. "private"

  // If your Django endpoint supports course_type filtering, pass it through.
  const path = courseType
    ? `/learning/api/teacher/courses/?course_type=${encodeURIComponent(courseType)}`
    : `/learning/api/teacher/courses/`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

    // If Django returned non-2xx, forward its payload (best for debugging)
    if (!response.ok) {
      const res = NextResponse.json(
        {
          error: "Failed to fetch teacher courses",
          detail: safeJson(text)?.detail ?? safeJson(text)?.error ?? text,
        },
        { status: response.status }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const data = safeJson(text);

    // Your Django payload: { courses: [...] }
    const normalizedData: Course[] = (data?.courses ?? []).map((course: any) => ({
      id: String(course.id ?? ""),
      name: course.name || "",
      subject: course.subject || "",
      classroom: course.classroom || "",
      description: course.description || "",
      isActive: course.isActive ?? true,
    }));

    const res = NextResponse.json(normalizedData, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch teacher courses", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
