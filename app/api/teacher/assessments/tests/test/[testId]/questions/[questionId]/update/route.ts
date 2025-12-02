import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  "X-Session-Token": sessionToken,
});

export async function PUT(req: Request, context: { params: Promise<{ testId: string; questionId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/questions/${params.questionId}/update/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[QuestionUpdateAPI] Initiating PUT request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[QuestionUpdateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[QuestionUpdateAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  try {
    const body = await req.json();
    console.log("[QuestionUpdateAPI] Request body:", body);

    // Validate and transform request body
    const processedBody = {
      type: body.type || "",
      question: body.question || "",
      options: body.options || [],
      correctAnswer: body.correctAnswer ?? (body.type === "multiple-choice" ? 0 : body.type === "true-false" ? false : body.type === "short-answer" ? "" : ""),
      points: body.points || 0,
      explanation: body.explanation || "",
      difficulty: body.difficulty || "Medium",
    };

    console.log("[QuestionUpdateAPI] Sending request to", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(processedBody),
    });

    console.log("[QuestionUpdateAPI] Response status:", response.status);
    console.log("[QuestionUpdateAPI] Response headers:", Object.fromEntries(response.headers));
    console.log("[QuestionUpdateAPI] Response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[QuestionUpdateAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[QuestionUpdateAPI] Request failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
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
          { error: "Question update endpoint not found" },
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
        { error: "Failed to update question" },
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
      console.error("[QuestionUpdateAPI] Non-JSON response received:", contentType);
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

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[QuestionUpdateAPI] Failed to parse JSON:", parseError);
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
        correctAnswer: data.question?.correctAnswer ?? (data.question?.type === "multiple-choice" ? 0 : data.question?.type === "true-false" ? false : data.question?.type === "short-answer" ? "" : ""),
      },
      message: data.message || "Question updated successfully.",
    };

    console.log("[QuestionUpdateAPI] Question updated successfully:", processedData);
    return NextResponse.json(processedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[QuestionUpdateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to update question", details: (error as Error).message },
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