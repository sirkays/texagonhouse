// app/api/student/cbt/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) {
    // Forward Django cookies back to the client
    res.headers.set("set-cookie", setCookie);
  }
  return res;
}

export async function GET(request: Request) {
  const deviceId = request.headers.get("x-device-id") || undefined;

  try {
    // Pass through query params (e.g., page, page_size, status, etc.)
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const qp = queryString ? `?${queryString}` : "";

    // 1) Available tests
    const t1 = withTimeout(120_000);
    const testsFetch = await djangoFetch("/assessments/api/tests/available/", {
      method: "GET",
      headers: {
        ...(deviceId ? { "X-Device-Id": deviceId } : {}),
      },
      signal: t1.signal,
    });
    t1.clear();

    if (!testsFetch.response.ok) {
      console.error("[Route] External API error response (tests):", testsFetch.text);
      const res = NextResponse.json(
        { error: `Failed to fetch tests: ${testsFetch.text}` },
        { status: testsFetch.response.status }
      );
      return attachSetCookie(res, testsFetch.setCookie);
    }

    let testsData: any;
    try {
      testsData = testsFetch.text ? JSON.parse(testsFetch.text) : null;
    } catch {
      testsData = testsFetch.text;
    }

    // 2) Student test attempts (paginated)
    const t2 = withTimeout(120_000);
    const attemptsFetch = await djangoFetch(
      `/assessments/api/student/test-attempts/${qp}`,
      {
        method: "GET",
        headers: {
          ...(deviceId ? { "X-Device-Id": deviceId } : {}),
        },
        signal: t2.signal,
      }
    );
    t2.clear();

    if (!attemptsFetch.response.ok) {
      console.error(
        "[Route] External API error response (attempts):",
        attemptsFetch.text
      );
      const res = NextResponse.json(
        { error: `Failed to fetch attempts: ${attemptsFetch.text}` },
        { status: attemptsFetch.response.status }
      );
      // Prefer forwarding the newest set-cookie we got (attempts), fallback to tests
      return attachSetCookie(res, attemptsFetch.setCookie ?? testsFetch.setCookie);
    }

    let attemptsData: any;
    try {
      attemptsData = attemptsFetch.text ? JSON.parse(attemptsFetch.text) : null;
    } catch {
      attemptsData = attemptsFetch.text;
    }

    // 🔹 Normalize tests
    let tests: any[] = [];
    let results: any = {};

    if (Array.isArray(testsData)) {
      tests = testsData;
    } else if (Array.isArray(testsData?.tests)) {
      tests = testsData.tests;
    } else if (Array.isArray(testsData?.results)) {
      tests = testsData.results;
    }

    if (
      !Array.isArray(testsData) &&
      testsData?.results &&
      !Array.isArray(testsData.results)
    ) {
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
        page_size: Number(
          attemptsData.page_size ?? attemptsData.results.length ?? 20
        ),
        results: attemptsData.results,
      };
    } else {
      attempts = { count: 0, page: 1, page_size: 20, results: [] };
    }

    const payload = { tests, results, attempts };

    const res = NextResponse.json(payload, { status: 200 });
    // Forward Django cookies back (prefer attempts cookie, fallback tests cookie)
    return attachSetCookie(res, attemptsFetch.setCookie ?? testsFetch.setCookie);
  } catch (error: any) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const deviceId = request.headers.get("x-device-id") || undefined;

  const maxRetries = 3;
  let attempt = 0;

  let body: any;
  try {
    body = await request.json();
  } catch (err: any) {
    console.error("[Route] Error parsing request body:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err?.message ?? String(err) },
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
        if (!isNaN(numeric)) cleaned.choice = numeric;
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

  while (attempt < maxRetries) {
    try {
      const t = withTimeout(180_000);

      const submitFetch = await djangoFetch(
        `/assessments/api/tests/${testId}/submit/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // djangoFetch sets it too, but OK to be explicit
            ...(deviceId ? { "X-Device-Id": deviceId } : {}),
          },
          body: JSON.stringify(payload),
          signal: t.signal,
        }
      );

      t.clear();

      if (!submitFetch.response.ok) {
        console.error("[Route] External API error response:", submitFetch.text);
        const res = NextResponse.json(
          { error: `Failed to submit test: ${submitFetch.text}` },
          { status: submitFetch.response.status }
        );
        return attachSetCookie(res, submitFetch.setCookie);
      }

      let data: any;
      try {
        data = submitFetch.text ? JSON.parse(submitFetch.text) : null;
      } catch {
        data = submitFetch.text;
      }

      const res = NextResponse.json(data, { status: 200 });
      return attachSetCookie(res, submitFetch.setCookie);
    } catch (err: any) {
      console.error(`[Route] Attempt ${attempt + 1} failed:`, err?.message ?? err);
      attempt++;

      if (attempt === maxRetries) {
        return NextResponse.json(
          { error: "Failed after retries", details: err?.message ?? String(err) },
          { status: 500 }
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  // Unreachable, but TypeScript likes it:
  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}
