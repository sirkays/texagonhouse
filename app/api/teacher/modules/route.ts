// app/api/teacher/modules/route.ts
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";
import { jsonWithDjangoCookie } from "@/app/api/_lib/nextResponse";



export async function GET(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const endpoint = `/learning/api/teacher/modules/${qs ? `?${qs}` : ""}`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (response.status === 401) {
        return jsonWithDjangoCookie(
          { error: "Session expired", redirect: "/login" },
          { status: 401, setCookie }
        );
      }
      if (response.status === 404) {
        return jsonWithDjangoCookie(
          { error: "Teacher modules endpoint not found" },
          { status: 404, setCookie }
        );
      }
      return jsonWithDjangoCookie(
        { error: "Failed to fetch teacher modules" },
        { status: response.status, setCookie }
      );
    }

    if (!contentType.includes("application/json")) {
      return jsonWithDjangoCookie(
        { error: "Invalid response format, expected JSON" },
        { status: 500, setCookie }
      );
    }

    let parsed: { modules: any[] };
    try {
      parsed = text ? JSON.parse(text) : { modules: [] };
    } catch {
      return jsonWithDjangoCookie(
        { error: "Invalid response format" },
        { status: 500, setCookie }
      );
    }

    if (!Array.isArray(parsed.modules)) {
      return jsonWithDjangoCookie(
        { error: "Invalid response format, expected modules array" },
        { status: 500, setCookie }
      );
    }

    const normalized = parsed.modules.map((module) => ({
      id: String(module.id),
      title: module.title || "",
      description: module.description || "",
      type: module.type || "video",
      estimatedDuration: Number(module.estimatedDuration ?? 0),
      difficulty: module.difficulty
        ? (module.difficulty.charAt(0).toUpperCase() +
            module.difficulty.slice(1).toLowerCase())
        : "Beginner",
      category: module.category
        ? { id: String(module.category.id), name: module.category.name || "" }
        : null,
      enrollments: module.enrollments ?? 0,
      rating: module.rating ?? 0,
      order: module.order ?? 0,
      active: !!module.active,
      isPublished: module.isPublished ?? !!module.active,
      course: module.course
        ? { id: String(module.course.id), name: module.course.name || "" }
        : null,
      createdAt: module.createdAt ?? null,
      updatedAt: module.updatedAt ?? null,
      lessons: Array.isArray(module.lessons)
        ? module.lessons.map((lesson: any) => ({
            id: String(lesson.id),
            title: lesson.title || "",
            type: lesson.type || "video",
            duration: lesson.duration ?? "",
            content: lesson.content || undefined,
            videoUrl: lesson.video_url,
            audioUrl: lesson.audio_url,
            coverImageUrl: lesson.cover_image,
          }))
        : [],
    }));

    return jsonWithDjangoCookie(normalized, { status: 200, setCookie });
  } catch (error) {
    return jsonWithDjangoCookie(
      { error: "Failed to fetch teacher modules", details: (error as Error).message },
      { status: 500 }
    );
  }
}
