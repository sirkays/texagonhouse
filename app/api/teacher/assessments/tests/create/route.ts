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

export async function POST(req: Request, { params }: { params: { path?: string[] } }) {
  noStore();
  const endpoint = "/assessments/api/teacher/tests/create/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TestCreateAPI] Initiating POST request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TestCreateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TestCreateAPI] No session token found");
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
    console.log("[TestCreateAPI] Request body:", body);

    // Validate and transform request body
    const processedBody = {
      title: body.title || "",
      description: body.description || "",
      instructions: body.instructions || "",
      duration: body.duration || 0,
      difficulty: body.difficulty || "Medium",
      course_id: body.course_id || 0,
      category: body.category || "",
      start_at: body.start_at || null,
      end_at: body.end_at || null,
      total_marks: body.total_marks || 0,
    };

    console.log("[TestCreateAPI] Sending request to", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(processedBody),
    });

    console.log("[TestCreateAPI] Response status:", response.status);
    console.log("[TestCreateAPI] Response headers:", Object.fromEntries(response.headers));
    console.log("[TestCreateAPI] Response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[TestCreateAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[TestCreateAPI] Request failed:", response.status, rawResponse.slice(0, 100));
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
          { error: "Test creation endpoint not found" },
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
        { error: "Failed to create test" },
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
      console.error("[TestCreateAPI] Non-JSON response received:", contentType);
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
      console.error("[TestCreateAPI] Failed to parse JSON:", parseError);
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

    // Validate and transform response
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
        questions: Array.isArray(data.test?.questions) ? data.test.questions.map((q: any) => ({
          id: q.id || "",
          type: q.type || "",
          question: q.question || "",
          points: q.points || 0,
          options: q.options || [],
          explanation: q.explanation || "",
          difficulty: q.difficulty || "Medium",
          correctAnswer: q.correctAnswer ?? (q.type === "multiple-choice" ? 0 : q.type === "true-false" ? false : ""),
        })) : [],
      },
      message: data.message || "Test created successfully.",
    };

    console.log("[TestCreateAPI] Test created successfully:", processedData);
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
    console.error("[TestCreateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to create test", details: (error as Error).message },
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

export async function PUT(req: Request, { params }: { params: { path: string[] } }) {
  noStore();
  const [segment1, testId, segment2, questionId] = params.path || [];
  let endpoint: string;
  let logPrefix: string;

  if (segment1 === "assessments" && segment2 === "questions") {
    endpoint = `/assessments/api/teacher/tests/${testId}/questions/${questionId}/update/`;
    logPrefix = "[QuestionUpdateAPI]";
  } else if (segment1 === "assessments" && !segment2) {
    endpoint = `/assessments/api/teacher/tests/${testId}/update/`;
    logPrefix = "[TestUpdateAPI]";
  } else {
    return NextResponse.json(
      { error: "Invalid endpoint" },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log(`${logPrefix} Initiating PUT request to:`, fullUrl);

  const session = await getServerSession(authOptions);
  console.log(`${logPrefix} Session retrieved:`, {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log(`${logPrefix} No session token found`);
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
    console.log(`${logPrefix} Request body:`, body);

    // Process request body
    let processedBody = body;
    if (endpoint.includes("/tests/") && !endpoint.includes("/questions/")) {
      processedBody = {
        start_at: body.start_at || null,
        end_at: body.end_at || null,
      };
    } else if (endpoint.includes("/questions/")) {
      processedBody = {
        type: body.type || "",
        question: body.question || "",
        options: body.options || [],
        correctAnswer: body.correctAnswer ?? (body.type === "multiple-choice" ? 0 : body.type === "true-false" ? false : ""),
        points: body.points || 0,
        explanation: body.explanation || "",
        difficulty: body.difficulty || "Medium",
      };
    }

    console.log(`${logPrefix} Sending request to`, fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(processedBody),
    });

    console.log(`${logPrefix} Response status:`, response.status);
    console.log(`${logPrefix} Response headers:`, Object.fromEntries(response.headers));
    console.log(`${logPrefix} Response content-type:`, response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(`${logPrefix} Raw response:`, rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error(`${logPrefix} Request failed:`, response.status, rawResponse.slice(0, 100));
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
          { error: `Endpoint not found: ${endpoint}` },
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
        { error: `Failed to ${endpoint.includes("/questions/") ? "update question" : "update test"}` },
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
      console.error(`${logPrefix} Non-JSON response received:`, contentType);
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
      console.error(`${logPrefix} Failed to parse JSON:`, parseError);
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

    // Process response
    let processedData = data;
    if (endpoint.includes("/tests/") && !endpoint.includes("/questions/")) {
      processedData = {
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
          questions: Array.isArray(data.test?.questions) ? data.test.questions.map((q: any) => ({
            id: q.id || "",
            type: q.type || "",
            question: q.question || "",
            points: q.points || 0,
            options: q.options || [],
            explanation: q.explanation || "",
            difficulty: q.difficulty || "Medium",
            correctAnswer: q.correctAnswer ?? (q.type === "multiple-choice" ? 0 : q.type === "true-false" ? false : ""),
          })) : [],
        },
        message: data.message || "Test updated successfully.",
      };
    } else if (endpoint.includes("/questions/")) {
      processedData = {
        question: {
          id: data.question?.id || "",
          type: data.question?.type || "",
          question: data.question?.question || "",
          points: data.question?.points || 0,
          options: data.question?.options || [],
          explanation: data.question?.explanation || "",
          difficulty: data.question?.difficulty || "Medium",
          correctAnswer: data.question?.correctAnswer ?? (data.question?.type === "multiple-choice" ? 0 : data.question?.type === "true-false" ? false : ""),
        },
        message: data.message || "Question updated successfully.",
      };
    }

    console.log(`${logPrefix} ${endpoint.includes("/questions/") ? "Question updated" : "Test updated"} successfully:`, processedData);
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
    console.error(`${logPrefix} Request error:`, error);
    return NextResponse.json(
      { error: `Failed to ${endpoint.includes("/questions/") ? "update question" : "update test"}`, details: (error as Error).message },
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