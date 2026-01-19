// app/api/student/code/submissions/create/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

// Timeout wrapper (same pattern as other routes)
async function djangoFetchWithTimeout(
  path: string,
  init: RequestInit = {},
  timeoutMs = 10000
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !("sessionToken" in session.user) ||
    !session.user.sessionToken
  ) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return NextResponse.json(
      { error: "Invalid request body", details: message },
      { status: 400 }
    );
  }

  try {
    const path = `/code-ide/api/ide/submissions/create/`;

    const { response, text, setCookie } = await djangoFetchWithTimeout(
      path,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      10000
    );

    const parsed = safeJsonParse(text);
    const data = parsed ?? text;

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Failed to create submission", details: data },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data, { status: 201 });

    // Forward Django cookies if any
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);

    return nextRes;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("AbortError") ? 504 : 500;

    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status }
    );
  }
}
