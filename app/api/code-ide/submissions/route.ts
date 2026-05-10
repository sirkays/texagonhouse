// app/api/student/code/submissions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

// Optional helper: timeout wrapper around djangoFetch
async function djangoFetchWithTimeout(
  path: string,
  init: RequestInit = {},
  timeoutMs = 18000
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await djangoFetch(path, { ...init, signal: controller.signal });
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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !("sessionToken" in session.user) ||
    !session.user.sessionToken
  ) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  // forward optional ?lesson= query to backend
  const { searchParams } = new URL(request.url);
  const lesson = searchParams.get("lesson");

  const qs = new URLSearchParams();
  if (lesson) qs.set("lesson", lesson);

  const path = `/code-ide/api/ide/student/projects/${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;

  try {
    const { response, text, setCookie } = await djangoFetchWithTimeout(
      path,
      { method: "GET" },
      18000
    );

    const parsed = safeJsonParse(text);
    const data = parsed ?? text;

    if (!response.ok) {
      const message =
        (parsed && (parsed.detail || parsed.error)) || "Failed to fetch data";

      return NextResponse.json(
        { error: message, details: data },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data, { status: 200 });

    // Forward Django cookies if present
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);

    return nextRes;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("AbortError") ? 504 : 500;

    console.error("[Route] Error fetching data:", message);

    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status }
    );
  }
}
