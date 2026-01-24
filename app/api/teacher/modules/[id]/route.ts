import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  noStore();

  const params = await context.params;
  const id = params.id;
  const endpoint = `/learning/api/teacher/modules/${id}/`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = text;

    if (!response.ok) {
      console.error(
        "[TeacherModuleDetailsAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );

      if (response.status === 401) {
        return attachSetCookie(
          NextResponse.json(
            { error: "Session expired", redirect: "/auth/signin" },
            {
              status: 401,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
              },
            }
          ),
          setCookie
        );
      }

      if (response.status === 404) {
        return attachSetCookie(
          NextResponse.json(
            { error: `Module with ID ${id} not found` },
            {
              status: 404,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
              },
            }
          ),
          setCookie
        );
      }

      return attachSetCookie(
        NextResponse.json(
          { error: "Failed to fetch module", details: rawResponse.slice(0, 100) },
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        ),
        setCookie
      );
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherModuleDetailsAPI] Non-JSON response received:",
        contentType
      );
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format, expected JSON" },
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        ),
        setCookie
      );
    }

    let data: any;
    try {
      data = rawResponse ? JSON.parse(rawResponse) : null;
    } catch (parseError) {
      console.error("[TeacherModuleDetailsAPI] Failed to parse JSON:", parseError);
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format" },
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        ),
        setCookie
      );
    }

    // Normalize data if needed
    const normalizedData = {
      id: data.module.id.toString(),
      title: data.module.title,
      description: data.module.description,
      difficulty: data.module.difficulty,
      category: data.module.category,
      estimatedDuration: data.module.estimatedDuration,
      order: data.module.order,
      active: data.module.active,
      isPublished: data.module.isPublished,
      course: data.module.course,
      createdAt: data.module.createdAt,
      updatedAt: data.module.updatedAt,
      lessons: data.module.lessons || [],
      lessonCount: data.module.lessons?.length || 0,
    };

    const res = NextResponse.json(normalizedData, {
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
    console.error("[TeacherModuleDetailsAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch module", details: (error as Error).message },
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
