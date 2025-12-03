// app/api/student/cbt/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "https://texagonbackend.onrender.com";
const BASE_URL = "http://127.0.0.1:9098";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function fetchWithTimeout(url: string, options: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/student/cbt");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  const deviceId = request.headers.get("x-device-id") || undefined;

  try {
    // Pass through query params (e.g., page, page_size, status, etc.)
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const qp = queryString ? `?${queryString}` : "";

    // Available tests
    const testsUrl = `${BASE_URL}/assessments/api/tests/available/`;
    console.log("[Route] Fetching tests from:", testsUrl);
    const testsRes = await fetchWithTimeout(testsUrl, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
        ...(deviceId ? { "X-Device-Id": deviceId } : {}),
        cookie: request.headers.get("cookie") ?? "",
      },
      credentials: "include", 
      timeout: 40000,
    });
    if (!testsRes.ok) {
      const errorText = await testsRes.text();
      console.error("[Route] External API error response (tests):", errorText);
      return NextResponse.json(
        { error: `Failed to fetch tests: ${errorText}` },
        { status: testsRes.status }
      );
    }
    const testsData = await testsRes.json();

    // Student test attempts (paginated)
    // NOTE: The docs say /assessments + /api/student/test-attempts
    const attemptsUrl = `${BASE_URL}/assessments/api/student/test-attempts/${qp}`;
    console.log("[Route] Fetching attempts from:", attemptsUrl);
    const attemptsRes = await fetchWithTimeout(attemptsUrl, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
        cookie: request.headers.get("cookie") ?? "",
      },
      credentials: "include", 
      timeout: 40000,
    });
    if (!attemptsRes.ok) {
      const errorText = await attemptsRes.text();
      console.error("[Route] External API error response (attempts):", errorText);
      return NextResponse.json(
        { error: `Failed to fetch attempts: ${errorText}` },
        { status: attemptsRes.status }
      );
    }
    const attemptsData = await attemptsRes.json();
    console.log(attemptsData, " data....")


    // 🔹 Normalize tests
    let tests: any[] = [];
    let results: any = {};

    if (Array.isArray(testsData)) {
      // backend returned raw array
      tests = testsData;
    } else if (Array.isArray(testsData?.tests)) {
      tests = testsData.tests;
    } else if (Array.isArray(testsData?.results)) {
      // sometimes APIs put the array in "results"
      tests = testsData.results;
    }

    if (!Array.isArray(testsData) && testsData?.results && !Array.isArray(testsData.results)) {
      // results is a dict / stats object
      results = testsData.results;
    }

    // 🔹 Normalize attempts into { count, page, page_size, results }
    let attempts: any;

    if (Array.isArray(attemptsData)) {
      attempts = {
        count: attemptsData.length,
        page: Number(searchParams.get("page") || 1),
        page_size: Number(searchParams.get("page_size") || attemptsData.length),
        results: attemptsData,
      };
    } else if (Array.isArray(attemptsData?.results)) {
      attempts = {
        count: Number(attemptsData.count ?? attemptsData.results.length ?? 0),
        page: Number(attemptsData.page ?? 1),
        page_size: Number(attemptsData.page_size ?? attemptsData.results.length ?? 20),
        results: attemptsData.results,
      };
    } else {
      attempts = { count: 0, page: 1, page_size: 20, results: [] };
    }

    const payload = {
      tests,
      results,
      attempts,
    };

    console.log("[Route] Normalized payload:", {
      tests_len: tests.length,
      attempts_count: attempts.count,
    });

    return NextResponse.json(payload, { status: 200 });

  } catch (error: any) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("[Route] Received POST request to..... /api/student/cbt");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }
  const deviceId = request.headers.get("x-device-id") || undefined;
  const maxRetries = 3;
  let attempt = 0;
  let body: any;

  try {
    body = await request.json();
    console.log("[Route] Raw POST body:", body);
  } catch (err: any) {
    console.error("[Route] Error parsing request body:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err.message },
      { status: 400 }
    );
  }

  const testId = body.test || body.testPk || body.currentTest;
  if (!testId) {
    console.error("[Route] Missing test ID in request body");
    return NextResponse.json(
      { error: "Missing test ID (test/testPk/currentTest)" },
      { status: 400 }
    );
  }

  const answers = (body.answers || [])
    .map((a: any) => {
      const questionId = a.question;
      if (!questionId) return null;

      const cleaned: any = { question: Number(questionId) };

      if (Array.isArray(a.choice)) {
        cleaned.choices = a.choice.map(Number);
      } else if (Array.isArray(a.choices)) {
        cleaned.choices = a.choices.map(Number);
      } else if (a.text !== undefined) {
        cleaned.text = a.text;
      } else if (a.choice !== undefined) {
        const numeric = Number(a.choice);
        if (!isNaN(numeric)) {
          cleaned.choice = numeric;
        } else {
          console.warn(
            `[Route] Skipping invalid non-numeric choice for question ${questionId}:`,
            a.choice
          );
        }
      }

      return cleaned;
    })
    .filter(Boolean);



  const payload = {
    answers,
    started_at: body.started_at || new Date().toISOString(),
    duration_seconds: body.duration_seconds || 0,
    suspicious_activity: body.suspicious_activity || 0,
  };

  console.log("[Route] Final payload for backend:", JSON.stringify(payload, null, 2));

  while (attempt < maxRetries) {
    try {
      const submitUrl = `${BASE_URL}/assessments/api/tests/${testId}/submit/`;
      console.log("[Route] Submitting to:", submitUrl);

      const res = await fetchWithTimeout(submitUrl, {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
        ...(deviceId ? { "X-Device-Id": deviceId } : {}),
        cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify(payload),
        credentials: "include", 
        timeout: 20000,
      });

      console.log("[Route] External API response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Route] External API error response:", errorText);
        return NextResponse.json(
          { error: `Failed to submit test: ${errorText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      console.log("[Route] External API response data:", data);
      return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
      console.error(`[Route] Attempt ${attempt + 1} failed:`, err.message);
      attempt++;
      if (attempt === maxRetries) {
        return NextResponse.json(
          { error: "Failed after retries", details: err.message },
          { status: 500 }
        );
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }
}
