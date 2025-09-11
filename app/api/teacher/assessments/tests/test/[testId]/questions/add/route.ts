import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";

const headers = (sessionToken: string) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function POST(req: Request, context: { params: Promise<{ testId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/questions/add/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[QuestionAddAPI] Initiating POST request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[QuestionAddAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[QuestionAddAPI] No session token found");
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
    console.log("[QuestionAddAPI] Request body:", body);

    const processedBody = {
      ...body,
      correctAnswer: body.correctAnswer ?? (body.type === "multiple-choice" ? 0 : body.type === "true-false" ? "true" : ""),
      options: body.options || [],
      explanation: body.explanation || "",
      difficulty: body.difficulty || "Medium",
    };

    console.log("[QuestionAddAPI] Sending request to", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(processedBody),
    });

    console.log("[QuestionAddAPI] Response status:", response.status);
    console.log("[QuestionAddAPI] Response headers:", Object.fromEntries(response.headers));
    console.log("[QuestionAddAPI] Response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[QuestionAddAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[QuestionAddAPI] Request failed:", response.status, rawResponse.slice(0, 100));
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
          { error: "Question add endpoint not found" },
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
        { error: "Failed to add question" },
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
      console.error("[QuestionAddAPI] Non-JSON response received:", contentType);
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
      console.error("[QuestionAddAPI] Failed to parse JSON:", parseError);
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

    const processedData = {
      ...data,
      question: {
        ...data.question,
        correctAnswer: data.question.correctAnswer ?? (data.question.type === "multiple-choice" ? 0 : data.question.type === "true-false" ? "true" : ""),
        options: data.question.options || [],
        explanation: data.question.explanation || "",
        difficulty: data.question.difficulty || "Medium",
      },
    };

    console.log("[QuestionAddAPI] Question added successfully:", processedData);
    return NextResponse.json(processedData, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[QuestionAddAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to add question", details: error.message },
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