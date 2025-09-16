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

    // Ensure questions have default correctAnswer values
    const processedBody = {
      ...body,
      questions: body.questions?.map((q: any) => ({
        ...q,
        correctAnswer: q.correctAnswer ?? (q.type === "multiple-choice" ? 0 : q.type === "true-false" ? "true" : ""),
        options: q.options || [],
        explanation: q.explanation || "",
        difficulty: q.difficulty || "Medium",
      })) || [],
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

    // Ensure questions in response have default correctAnswer
    const processedData = {
      ...data,
      test: {
        ...data.test,
        questions: data.test.questions?.map((q: any) => ({
          ...q,
          correctAnswer: q.correctAnswer ?? (q.type === "multiple-choice" ? 0 : q.type === "true-false" ? "true" : ""),
          options: q.options || [],
          explanation: q.explanation || "",
          difficulty: q.difficulty || "Medium",
        })) || [],
      },
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
      { error: "Failed to create test", details: error.message },
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
    // Handle PUT /assessments/api/teacher/tests/[testId]/questions/[questionId]/update/
    endpoint = `/assessments/api/teacher/tests/${testId}/questions/${questionId}/update/`;
    logPrefix = "[QuestionUpdateAPI]";
  } else if (segment1 === testId && !segment2) {
    // Handle PUT /api/teacher/assessments/tests/[testId]/update
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

    // Process questions for test update, or single question for question update
    let processedBody = body;
    if (endpoint.includes("/tests/") && !endpoint.includes("/questions/")) {
      processedBody = {
        ...body,
        questions: body.questions?.map((q: any) => ({
          ...q,
          correctAnswer: q.correctAnswer ?? (q.type === "multiple-choice" ? 0 : q.type === "true-false" ? "true" : ""),
          options: q.options || [],
          explanation: q.explanation || "",
          difficulty: q.difficulty || "Medium",
        })) || [],
      };
    } else if (endpoint.includes("/questions/")) {
      processedBody = {
        ...body,
        correctAnswer: body.correctAnswer ?? (body.type === "multiple-choice" ? 0 : body.type === "true-false" ? "true" : ""),
        options: body.options || [],
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

    // Process response to ensure consistent question data
    let processedData = data;
    if (endpoint.includes("/tests/") && !endpoint.includes("/questions/")) {
      processedData = {
        ...data,
        test: {
          ...data.test,
          questions: data.test.questions?.map((q: any) => ({
            ...q,
            correctAnswer: q.correctAnswer ?? (q.type === "multiple-choice" ? 0 : q.type === "true-false" ? "true" : ""),
            options: q.options || [],
            explanation: q.explanation || "",
            difficulty: q.difficulty || "Medium",
          })) || [],
        },
      };
    } else if (endpoint.includes("/questions/")) {
      processedData = {
        ...data,
        question: {
          ...data.question,
          correctAnswer: data.question.correctAnswer ?? (data.question.type === "multiple-choice" ? 0 : data.question.type === "true-false" ? "true" : ""),
          options: data.question.options || [],
          explanation: data.question.explanation || "",
          difficulty: data.question.difficulty || "Medium",
        },
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
      { error: `Failed to ${endpoint.includes("/questions/") ? "update question" : "update test"}`, details: error.message },
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