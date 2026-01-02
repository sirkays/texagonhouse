import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";
//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  "X-Session-Token": sessionToken,
});

export async function PUT(
  req: Request,
  context: {params: Promise<{id: string}>}
) {
  noStore();
  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.id}/update/`;
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
    const body = await req.json();
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error(
        "[TestUpdateAPI] Request failed:",
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
          {error: "Test update endpoint not found"},
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
        {error: "Failed to update test"},
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
      console.error("[TestUpdateAPI] Non-JSON response received:", contentType);
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
      console.error("[TestUpdateAPI] Failed to parse JSON:", parseError);
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

    // Validate and transform response to match test specification
    const processedData = {
      test: {
        id: data.test?.id || "",
        title: data.test?.title || "",
        instructions: data.test?.instructions || "",
        duration: data.test?.duration || 0,
        total_marks: data.test?.total_marks || 0,
        totalPoints: data.test?.totalPoints || 0,
        difficulty: data.test?.difficulty || "Medium",
        category: data.test?.category || "",
        isPublished: data.test?.isPublished || false,
        questionsCount: data.test?.questionsCount || 0,
        createdAt: data.test?.createdAt || "",
        updatedAt: data.test?.updatedAt || "",
        start_at: data.test?.start_at || null,
        end_at: data.test?.end_at || null,
        questions: Array.isArray(data.test?.questions)
          ? data.test.questions.map((q: any) => ({
              id: q.id || "",
              type: q.type || "",
              question: q.question || "",
              points: q.points || 0,
              options: q.options || [],
              explanation: q.explanation || "",
              difficulty: q.difficulty || "Medium",
              correctAnswer:
                q.correctAnswer ??
                (q.type === "multiple-choice"
                  ? 0
                  : q.type === "true-false"
                  ? false
                  : ""),
            }))
          : [],
      },
      message: data.message || "Test updated successfully.",
    };

    return NextResponse.json(processedData, {
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
    console.error("[TestUpdateAPI] Request error:", error);
    return NextResponse.json(
      {error: "Failed to update test", details: (error as Error).message},
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
