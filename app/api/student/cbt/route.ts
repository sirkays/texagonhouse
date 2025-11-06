// app/api/student/cbt/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";
const COOKIE_NAME = "device_id";
const ONE_YEAR = 60 * 60 * 24 * 365;
async function ensureDeviceId(request: Request) {
  // 1) Prefer a client-provided header (e.g., from your SPA)
  const hdr = request.headers.get("x-device-id")?.trim();
  // 2) Use first-party cookie if it exists
  const cookieStore = await cookies(); // ✅ await it
  const c = cookieStore.get("device_id")?.value?.trim();
  // 3) Else, generate a new one
  const deviceId =
    hdr ||
    c ||
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
  const needSetCookie = !c; // only set cookie if missing
  return { deviceId, needSetCookie };
}
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
function withDeviceCookie(res: NextResponse, deviceId: string, setCookie: boolean) {
  if (!setCookie) return res;
  res.cookies.set({
    name: COOKIE_NAME,
    value: deviceId,
    httpOnly: true,
    path: "/",
    sameSite: "lax", // first-party; Lax is fine for normal navigations/fetch
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
  });
  return res;
}
export async function GET(request: Request) {
  console.log("[Route] Received GET /api/student/cbt");
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    const res = NextResponse.json({ error: "No session token" }, { status: 401 });
    return res;
  }
  // --- Bulletproof device id ---
  const { deviceId, needSetCookie } = await ensureDeviceId(request);
  console.log("[Route] Using deviceId:", deviceId);
  try {
    // Passthrough query params for attempts (your tests URL doesn't use them)
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
        "X-Device-ID": deviceId, // <<< forward to Django
      },
      // credentials here affect this server's fetch to backend, not browser
      credentials: "include",
      timeout: 8000,
    });
    if (!testsRes.ok) {
      const errorText = await testsRes.text();
      console.error("[Route] External API error (tests):", errorText);
      const res = NextResponse.json(
        { error: `Failed to fetch tests: ${errorText}` },
        { status: testsRes.status }
      );
      return withDeviceCookie(res, deviceId, needSetCookie);
    }
    const testsData = await testsRes.json();
    // Student attempts (paginated)
    const attemptsUrl = `${BASE_URL}/assessments/api/student/test-attempts/${qp}`;
    console.log("[Route] Fetching attempts from:", attemptsUrl);
    const attemptsRes = await fetchWithTimeout(attemptsUrl, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
        "X-Device-ID": deviceId, // <<< forward to Django
      },
      credentials: "include",
      timeout: 8000,
    });
    if (!attemptsRes.ok) {
      const errorText = await attemptsRes.text();
      console.error("[Route] External API error (attempts):", errorText);
      const res = NextResponse.json(
        { error: `Failed to fetch attempts: ${errorText}` },
        { status: attemptsRes.status }
      );
      return withDeviceCookie(res, deviceId, needSetCookie);
    }
    const attemptsData = await attemptsRes.json();
    // Combined payload
    const payload = {
      ...(Array.isArray(testsData?.tests) ? { tests: testsData.tests } : {}),
      ...(testsData?.results ? { results: testsData.results } : {}),
      attempts: attemptsData,
    };
    console.log("[Route] Combined GET payload keys:", Object.keys(payload));
    const res = NextResponse.json(payload, { status: 200 });
    return withDeviceCookie(res, deviceId, needSetCookie);
  } catch (error: any) {
    console.error("[Route] Error fetching data:", error);
    const res = NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
    return withDeviceCookie(res, deviceId, needSetCookie);
  }
}
export async function POST(request: Request) {
  console.log("[Route] Received POST /api/student/cbt");
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found");
    const res = NextResponse.json({ error: "No session token" }, { status: 401 });
    return res;
  }
  // --- Bulletproof device id (same logic as GET) ---
  const { deviceId, needSetCookie } = await ensureDeviceId(request);
  console.log("[Route] Using deviceId:", deviceId);
  const maxRetries = 3;
  let attempt = 0;
  let body: any;
  try {
    body = await request.json();
    console.log("[Route] Raw POST body:", body);
  } catch (err: any) {
    console.error("[Route] Error parsing request body:", err);
    const res = NextResponse.json(
      { error: "Invalid request body", details: err.message },
      { status: 400 }
    );
    return withDeviceCookie(res, deviceId, needSetCookie);
  }
  const testId = body.test || body.testPk || body.currentTest;
  if (!testId) {
    console.error("[Route] Missing test ID in request body");
    const res = NextResponse.json(
      { error: "Missing test ID (test/testPk/currentTest)" },
      { status: 400 }
    );
    return withDeviceCookie(res, deviceId, needSetCookie);
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
  if (!answers.length) {
    const res = NextResponse.json(
      { error: "answers must be a non-empty list." },
      { status: 400 }
    );
    return withDeviceCookie(res, deviceId, needSetCookie);
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
      const resUp = await fetchWithTimeout(submitUrl, {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
          "X-Device-ID": deviceId, // <<< forward to Django
        },
        body: JSON.stringify(payload),
        credentials: "include",
        timeout: 20000,
      });
      console.log("[Route] External API response status:", resUp.status);
      if (!resUp.ok) {
        const errorText = await resUp.text();
        console.error("[Route] External API error response:", errorText);
        const res = NextResponse.json(
          { error: `Failed to submit test: ${errorText}` },
          { status: resUp.status }
        );
        return withDeviceCookie(res, deviceId, needSetCookie);
      }
      const data = await resUp.json();
      console.log("[Route] External API response data:", data);
      const res = NextResponse.json(data, { status: 200 });
      return withDeviceCookie(res, deviceId, needSetCookie);
    } catch (err: any) {
      console.error(`[Route] Attempt ${attempt + 1} failed:`, err.message);
      attempt++;
      if (attempt === maxRetries) {
        const res = NextResponse.json(
          { error: "Failed after retries", details: err.message },
          { status: 500 }
        );
        return withDeviceCookie(res, deviceId, needSetCookie);
      }
      // backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }
}
