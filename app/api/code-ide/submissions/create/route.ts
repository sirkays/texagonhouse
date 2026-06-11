// app/api/code-ide/submissions/create/route.ts
//
// Submission creation is the slowest write path in the IDE because:
//   1. getServerSession() can take 5-8 s on a cold Next.js edge
//   2. djangoFetch() internally calls getServerSession() again (+5-8 s)
//   3. The Render-hosted Django backend itself needs 10-18 s
//
// To avoid the redundant double-session overhead we bypass the shared
// djangoFetch() helper here and build the request manually, reusing
// the session we already resolved.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";
const API_KEY =
  process.env.STORE_API_KEY || "WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8";

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  // ── 1. Authenticate (single call) ────────────────────────────────
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    !("sessionToken" in session.user) ||
    !session.user.sessionToken
  ) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }
  const sessionToken = (session.user as any).sessionToken as string;

  // ── 2. Parse request body ────────────────────────────────────────
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

  // ── 3. Forward to Django (no second getServerSession) ────────────
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
    const cookieStore = await cookies();
    const cookieHeader =
      cookieStore.getAll().length > 0
        ? cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ")
        : undefined;

    const headers: Record<string, string> = {
      Authorization: `Api-Key ${API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Session-Token": sessionToken,
    };
    if (cookieHeader) headers["Cookie"] = cookieHeader;

    const response = await fetch(
      `${BASE_URL}/code-ide/api/ide/projects/submit/`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: "no-store",
      }
    );

    const text = await response.text();
    const parsed = safeJsonParse(text);
    const data = parsed ?? text;

    if (!response.ok) {
      console.error("[Route] Submission create failed:", response.status, text);
      return NextResponse.json(
        {
          error:
            data?.detail || data?.error || "Failed to create submission",
          details: data,
        },
        { status: response.status }
      );
    }

    const nextRes = NextResponse.json(data, { status: 201 });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);

    return nextRes;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isTimeout =
      message.includes("abort") || message.includes("AbortError");
    const status = isTimeout ? 504 : 500;

    console.error("[Route] Submission create error:", message);

    return NextResponse.json(
      {
        error: isTimeout
          ? "Request timed out — the server is taking too long. Please try again."
          : "Internal server error",
        details: message,
      },
      { status }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
