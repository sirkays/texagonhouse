import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function GET(request) {
  console.log("[Route] Received GET request to /api/student/cbt");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const url = `${BASE_URL}/assessments/api/tests/available/`;
    console.log("[Route] Fetching tests from:", url);

    const res = await fetchWithTimeout(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      timeout: 8000,
    });

    console.log("[Route] External API response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Route] External API error response:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch data: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[Route] External API response data:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log("[Route] Received POST request to /api/student/cbt");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  const maxRetries = 3;
  let attempt = 0;
  let body;

  try {
    body = await request.json();
    console.log("[Route] Raw POST body:", body);
  } catch (err) {
    console.error("[Route] Error parsing request body:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err.message },
      { status: 400 }
    );
  }

  // ✅ Normalize and validate test ID
  const testId = body.test || body.testPk || body.currentTest;
  if (!testId) {
    console.error("[Route] Missing test ID in request body");
    return NextResponse.json(
      { error: "Missing test ID (test/testPk/currentTest)" },
      { status: 400 }
    );
  }

  // ✅ Normalize answer structure according to API spec
  const answers = (body.answers || []).map((a) => {
    const questionId = a.question;
    if (!questionId) return null;
  
    const cleaned = { question: Number(questionId) };
  
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
        console.warn(`[Route] Skipping invalid non-numeric choice for question ${questionId}:`, a.choice);
      }
    }
  
    return cleaned;
  }).filter(Boolean);
  

  if (!answers.length) {
    return NextResponse.json(
      { error: "answers must be a non-empty list." },
      { status: 400 }
    );
  }

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
        },
        body: JSON.stringify(payload),
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
    } catch (err) {
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