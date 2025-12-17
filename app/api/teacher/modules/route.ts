import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
//const BASE_URL = "http://127.0.0.1:9098";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

function normalizeMedia(media: string | undefined): string | undefined {
  if (!media) return undefined;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  // Handle cases where media already has /media/ prefix
  if (cleaned.startsWith("media/")) {
    return `${BASE_URL}/${cleaned}`;
  }
  return `${BASE_URL}/media/${cleaned}`;
}

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

interface Lesson {
  id: string;
  title: string;
  type: "video" | "audio" | "text" | "quiz";
  duration: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
  coverImageUrl?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: { id: string; name: string } | null;
  estimatedDuration: number; // ✅ minutes (API)
  order: number;
  active: boolean;
  isPublished: boolean;
  course: { id: string; name: string } | null;
  createdAt: string | null;
  updatedAt: string | null;
  lessons: Lesson[];
  lessonCount?: number;

  // optional
  enrollments?: number;
  rating?: number;
  type?: "video" | "audio" | "document" | "tutorial";
}

export async function GET(req: Request) {
  noStore();
  const { searchParams } = new URL(req.url);

  const endpoint = "/learning/api/teacher/modules/";
  const query = new URLSearchParams();

  // ✅ forward all supported filters
  const active = searchParams.get("active");
  const search = searchParams.get("search");
  const difficulty = searchParams.get("difficulty");
  const course = searchParams.get("course");
  const category = searchParams.get("category");
  const include_lessons = searchParams.get("include_lessons");

  if (active) query.set("active", active);
  if (search) query.set("search", search);
  if (difficulty) query.set("difficulty", difficulty.toLowerCase());
  if (course) query.set("course", course);
  if (category) query.set("category", category);
  if (include_lessons) query.set("include_lessons", include_lessons);

  const fullUrl = `${BASE_URL}${endpoint}${query.toString() ? `?${query.toString()}` : ""}`;

  console.log("[TeacherModulesAPI] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TeacherModulesAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user
      ? { id: session.user.id, role: session.user.role }
      : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TeacherModulesAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  try {
    console.log(
      "[TeacherModulesAPI] Fetching from",
      fullUrl,
      "with token:",
      session.user.sessionToken
    );
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[TeacherModulesAPI] Fetch response status:", response.status);
    console.log(
      "[TeacherModulesAPI] Fetch response headers:",
      Object.fromEntries(response.headers)
    );
    console.log(
      "[TeacherModulesAPI] Fetch response content-type:",
      response.headers.get("content-type")
    );

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(
      "[TeacherModulesAPI] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[TeacherModulesAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Teacher modules endpoint not found" },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch teacher modules" },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherModulesAPI] Non-JSON response received:",
        contentType
      );
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data: { modules: any[] };
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[TeacherModulesAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!Array.isArray(data.modules)) {
      console.error(
        "[TeacherModulesAPI] Response does not contain a modules array:",
        data
      );
      return NextResponse.json(
        { error: "Invalid response format, expected modules array" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

  const normalizedData: Module[] = data.modules.map((module) => ({
    id: String(module.id),
    title: module.title || "",
    description: module.description || "",
    type: module.type || "video",

    // ✅ keep API field name + number type
    estimatedDuration: Number(module.estimatedDuration ?? 0),

    difficulty: module.difficulty
      ? ((module.difficulty.charAt(0).toUpperCase() +
          module.difficulty.slice(1).toLowerCase()) as
          | "Beginner"
          | "Intermediate"
          | "Advanced")
      : "Beginner",

    // ✅ keep API category shape
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
      ? module.lessons.map((lesson: any): Lesson => ({
          id: String(lesson.id),
          title: lesson.title || "",
          type: lesson.type || "video",

          // keep as-is OR normalize if backend sends seconds (see section 3)
          duration: lesson.duration ?? "",

          content: lesson.content || undefined,
          videoUrl: lesson.video_url ? normalizeMedia(lesson.video_url) : undefined,
          audioUrl: lesson.audio_url ? normalizeMedia(lesson.audio_url) : undefined,
          coverImageUrl: lesson.cover_image ? normalizeMedia(lesson.cover_image) : undefined,
        }))
      : [],
  }));


    console.log(
      "[TeacherModulesAPI] Fetch successful, normalized data:",
      normalizedData
    );
    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[TeacherModulesAPI] Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch teacher modules",
        details: (error as Error).message,
      },
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
