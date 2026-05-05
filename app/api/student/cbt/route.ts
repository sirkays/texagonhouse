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

function safeJsonParse(text: any) {
  try {
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return text;
  }
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
      const status = testsFetch.response.status;

      const msg =
        [500, 502, 503, 504].includes(status)
          ? { error: "Connection error", details: "Unable to reach the server. Please try again." }
          : { error: `Failed to fetch tests: ${testsFetch.text}` };

      const res = NextResponse.json(msg, { status });
      return attachSetCookie(res, testsFetch.setCookie);
    }


    const testsData = safeJsonParse(testsFetch.text);

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
      const status = attemptsFetch.response.status;

      const msg =
        [500, 502, 503, 504].includes(status)
          ? { error: "Connection error", details: "Unable to reach the server. Please try again." }
          : { error: `Failed to fetch attempts: ${attemptsFetch.text}` };

      const res = NextResponse.json(msg, { status });
      return attachSetCookie(res, attemptsFetch.setCookie ?? testsFetch.setCookie);
    }


    const attemptsData = safeJsonParse(attemptsFetch.text);

    // 🔹 Normalize tests
    let tests: any[] = [];
    let results: any = {};

    if (Array.isArray(testsData)) {
      tests = testsData;
    } else if (Array.isArray((testsData as any)?.tests)) {
      tests = (testsData as any).tests;
    } else if (Array.isArray((testsData as any)?.results)) {
      tests = (testsData as any).results;
    }

    if (
      !Array.isArray(testsData) &&
      (testsData as any)?.results &&
      !Array.isArray((testsData as any).results)
    ) {
      results = (testsData as any).results;
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
    } else if (Array.isArray((attemptsData as any)?.results)) {
      attempts = {
        count: Number(
          (attemptsData as any).count ??
          (attemptsData as any).results.length ??
          0
        ),
        page: Number((attemptsData as any).page ?? 1),
        page_size: Number(
          (attemptsData as any).page_size ??
          (attemptsData as any).results.length ??
          20
        ),
        results: (attemptsData as any).results,
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
      {
        error: "Connection error",
        details: "Unable to reach the server. Please check your internet connection and try again.",
      },
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

  /**
   * ✅ ONLINE START MODE
   * Frontend sends: { action: "start", currentTest: <id> }
   * This proxies to Django: POST /assessments/api/tests/<id>/start/
   */
  if (body?.action === "start") {
    const startTestId = body.test || body.testPk || body.currentTest;
    if (!startTestId) {
      return NextResponse.json(
        { error: "Missing test ID for start (test/testPk/currentTest)" },
        { status: 400 }
      );
    }

    try {
      console.log("starter pack...")
      const t = withTimeout(180_000);

      const startFetch = await djangoFetch(
        `/assessments/api/tests/${startTestId}/start/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(deviceId ? { "X-Device-Id": deviceId } : {}),
          },
          body: JSON.stringify({}),
          signal: t.signal,
        }
      );

      t.clear();

      if (!startFetch.response.ok) {
        const status = startFetch.response.status;

        const msg =
          [500, 502, 503, 504].includes(status)
            ? {
              error: "Connection error",
              details:
                "Unable to reach the server. Please check your internet connection and try again.",
            }
            : {
              error: `Failed to start test: ${startFetch.text}`,
            };

        console.error("[Route] External API error response (start):", startFetch.text);

        const res = NextResponse.json(msg, { status });
        return attachSetCookie(res, startFetch.setCookie);
      }

      const data = safeJsonParse(startFetch.text);
      const res = NextResponse.json(data, { status: 200 });
      return attachSetCookie(res, startFetch.setCookie);
    } catch (err: any) {
      console.error("[Route] Start test failed:", err?.message ?? err);
      return NextResponse.json(
        {
          error: "Connection error",
          details: "Unable to reach the server. Please check your internet connection and try again.",
        },
        { status: 500 }
      );
    }

  }

/**
 * ✅ SUBMIT MODE
 * Frontend sends answers payload to /api/student/cbt
 * This proxies to Django: POST /assessments/api/tests/<id>/submit/
 */
const testId = body.test || body.testPk || body.currentTest;

if (!testId) {
  console.error("[Route] Missing test ID in request body");

  return NextResponse.json(
    {
      code: "INVALID_PAYLOAD",
      detail: "Missing test ID (test/testPk/currentTest).",
    },
    { status: 400 }
  );
}

const answers = (body.answers || [])
  .map((a: any) => {
    const questionId = a.question;

    if (!questionId) return null;

    const cleaned: any = {
      question: Number(questionId),
    };

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
        cleaned.choice = a.choice;
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

  /**
   * These fields are important.
   * Do not drop them before sending to Django.
   */
  client_submission_id: body.client_submission_id,
  attempt_id: body.attempt_id,
  expires_at_ms: body.expires_at_ms,
  mode: body.mode,
  auto_submitted: body.auto_submitted || false,
  forced_submit_reason: body.forced_submit_reason || null,
};

try {
  const t = withTimeout(180_000);

  const submitFetch = await djangoFetch(
    `/assessments/api/tests/${testId}/submit/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(deviceId ? { "X-Device-Id": deviceId } : {}),
        ...(request.headers.get("x-idempotency-key")
          ? {
              "X-Idempotency-Key": request.headers.get("x-idempotency-key")!,
            }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: t.signal,
    }
  );

  t.clear();

  const data = safeJsonParse(submitFetch.text);

  /**
   * ✅ Critical:
   * Return Django's exact JSON and exact status.
   * Do not wrap 400 responses in { error: "Failed..." }.
   */
  const res = NextResponse.json(data ?? {}, {
    status: submitFetch.response.status,
  });

  return attachSetCookie(res, submitFetch.setCookie);
} catch (err: any) {
  console.error("[Route] Submit test failed:", err?.message ?? err);

  return NextResponse.json(
    {
      code: "CONNECTION_ERROR",
      detail:
        "Unable to reach the server. Please check your internet connection and try again.",
    },
    { status: 503 }
  );
}
}
