// app/api/code-ide/submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

// Helper: add a timeout to djangoFetch (via AbortController)
async function djangoFetchWithTimeout(
  path: string,
  init: RequestInit = {},
  timeoutMs = 20000
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await djangoFetch(path, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params is async in newer Next
) {
  const { id } = await params; // ✅ FIXES: "params should be awaited"

  console.log(`[Route] Received GET request to /api/code-ide/submissions/${id}`);

  const session = await getServerSession(authOptions);
  if (!session?.user || !("sessionToken" in session.user) || !session.user.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    // proxy.ts BASE_URL already points to process.env.BASE_URL
    // so pass the full Django path from root:
    const path = `/code-ide/api/ide/submissions/${id}/`;

    const { response, text, setCookie } = await djangoFetchWithTimeout(
      path,
      { method: "GET" },
      18000
    );

    if (!response.ok) {
      console.error("[Route] External API error response:", text);
      return NextResponse.json(
        { error: `Failed to fetch data: ${text}` },
        { status: response.status }
      );
    }

    const data = safeJsonParse(text) ?? text;

    const nextRes = NextResponse.json(data, { status: 200 });

    // Forward Django cookies if present (optional but helpful)
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);

    return nextRes;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("[Route] Error fetching data:", message);

    // AbortController timeout shows as AbortError sometimes
    const status = message.includes("AbortError") ? 504 : 500;

    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params is async
) {
  const { id } = await params; // ✅ FIXES: "params should be awaited"

  const session = await getServerSession(authOptions);
  if (!session?.user || !("sessionToken" in session.user) || !session.user.sessionToken) {
    console.error("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    console.error("[Route] Error parsing request body:", message);
    return NextResponse.json(
      { error: "Invalid request body", details: message },
      { status: 400 }
    );
  }

  try {
    const path = `/code-ide/api/ide/submissions/${id}/student-update/`;

    const { response, text, setCookie } = await djangoFetchWithTimeout(
      path,
      {
        method: "PATCH",
        // djangoFetch already sets Content-Type: application/json
        body: JSON.stringify(body),
      },
      20000
    );

    if (!response.ok) {
      console.error("[Route] External API error response:", text);
      return NextResponse.json(
        { error: `Failed to update submission: ${text}` },
        { status: response.status }
      );
    }

    const data = safeJsonParse(text) ?? text;

    const nextRes = NextResponse.json(data, { status: 200 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);

    return nextRes;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Route] Error updating submission:", message);

    const status = message.includes("AbortError") ? 504 : 500;

    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status }
    );
  }
}
