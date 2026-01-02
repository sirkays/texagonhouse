import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function POST(req: Request, {params}: {params: {id: string}}) {
  noStore();
  const lessonId = params.id;
  const endpoint = `/learning/api/save/lesson/${lessonId}/`;
  const fullUrl = `${BASE_URL}${endpoint}`;

  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated"},
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
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify({}),
    });

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error(
        "[SaveLessonAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      if (response.status === 401) {
        return NextResponse.json(
          {error: "Session expired"},
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
          {error: "Lesson not found"},
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
        {error: "Failed to save lesson"},
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
      console.error("[SaveLessonAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        {error: "Invalid response format, expected JSON"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[SaveLessonAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        {error: "Invalid response format"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(data, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[SaveLessonAPI] Fetch error:", error);
    return NextResponse.json(
      {error: "Failed to save lesson", details: error.message},
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
