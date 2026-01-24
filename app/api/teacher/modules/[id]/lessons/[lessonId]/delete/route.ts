import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; lessonId: string }> }
) {
  noStore();

  const { id: moduleId, lessonId } = await context.params;
  const endpoint = `/learning/api/teacher/modules/${moduleId}/lessons/${lessonId}/delete/`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "DELETE",
    });

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      if (response.status === 401) {
        return attachSetCookie(
          NextResponse.json(
            { error: "Session expired", redirect: "/auth/signin" },
            { status: 401 }
          ),
          setCookie
        );
      }

      if (response.status === 404) {
        return attachSetCookie(
          NextResponse.json(
            { error: `Lesson with ID ${lessonId} not found` },
            { status: 404 }
          ),
          setCookie
        );
      }

      return attachSetCookie(
        NextResponse.json(
          {
            error: "Failed to delete lesson",
            details: typeof text === "string" ? text.slice(0, 200) : data,
          },
          { status: response.status }
        ),
        setCookie
      );
    }

    const res = NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[LessonDeleteAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson", details: (error as Error).message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
