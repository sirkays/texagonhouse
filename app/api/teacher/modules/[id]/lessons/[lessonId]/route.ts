// texagon_academy\texagonui\app\api\teacher\modules\[id]\lessons\[lessonId]\route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; lessonId: string }> }
) {
  noStore();

  const { id: moduleId, lessonId } = await context.params;
  const endpoint = `/learning/api/teacher/modules/${moduleId}/lessons/${lessonId}/`;

  try {
    const contentType = req.headers.get("content-type") || "";
    const isMultipart = contentType.toLowerCase().includes("multipart/form-data");

    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "PATCH",
      body: isMultipart ? await req.formData() : JSON.stringify(await req.json()),
    });

    const responseContentType = response.headers.get("content-type") || "";
    const rawResponse = text;

    if (!response.ok) {
      console.error(
        "[LessonUpdateAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 200)
      );

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
          { error: "Failed to update lesson", details: rawResponse.slice(0, 200) },
          { status: response.status }
        ),
        setCookie
      );
    }

    if (!responseContentType.includes("application/json")) {
      console.error("[LessonUpdateAPI] Non-JSON response received:", responseContentType);
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format, expected JSON" },
          { status: 500 }
        ),
        setCookie
      );
    }

    let data: any;
    try {
      data = rawResponse ? JSON.parse(rawResponse) : null;
    } catch (parseError) {
      console.error("[LessonUpdateAPI] Failed to parse JSON:", parseError);
      return attachSetCookie(
        NextResponse.json({ error: "Invalid response format" }, { status: 500 }),
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
    console.error("[LessonUpdateAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to update lesson", details: (error as Error).message },
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
