// texagon_academy\texagonui\app\api\teacher\assessments\tests\test\[testId]\questions\add\route.ts
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

export async function POST(
  req: Request,
  context: {params: Promise<{testId: string}>}
) {
  noStore();
  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/questions/add/`;
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

    // Validate and transform request body
    const processedBody = {
      type: body.type || "",
      question: body.question || "",
      options: body.options || [],
      correctAnswer:
        body.correctAnswer ??
        (body.type === "multiple-choice"
          ? 0
          : body.type === "true-false"
          ? false
          : body.type === "short-answer"
          ? ""
          : ""),
      points: body.points || 0,
      explanation: body.explanation || "",
      difficulty: body.difficulty || "Medium",
    };

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(processedBody),
    });

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error(
        "[QuestionAddAPI] Request failed:",
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
          {error: "Question add endpoint not found"},
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
        {error: "Failed to add question"},
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
        "[QuestionAddAPI] Non-JSON response received:",
        contentType
      );
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
      console.error("[QuestionAddAPI] Failed to parse JSON:", parseError);
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
      question: {
        id: data.question?.id || "",
        type: data.question?.type || "",
        question: data.question?.question || "",
        points: data.question?.points || 0,
        options: data.question?.options || [],
        explanation: data.question?.explanation || "",
        difficulty: data.question?.difficulty || "Medium",
        correctAnswer:
          data.question?.correctAnswer ??
          (data.question?.type === "multiple-choice"
            ? 0
            : data.question?.type === "true-false"
            ? false
            : data.question?.type === "short-answer"
            ? ""
            : ""),
      },
      message: data.message || "Question added successfully.",
    };

    return NextResponse.json(processedData, {
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
    console.error("[QuestionAddAPI] Request error:", error);
    return NextResponse.json(
      {error: "Failed to add question", details: (error as Error).message},
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
