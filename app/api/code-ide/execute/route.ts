// app/api/code-ide/execute/route.ts
//
// Server-side proxy for the Piston (https://emkc.org) code execution API.
//
// Why proxy instead of calling from the browser?
//  - Browser-to-Piston calls can be blocked by corporate/school networks,
//    which return a redirect to a proxy-login page. The browser follows that
//    redirect, which can end up on /login of this very app.
//  - Running the fetch server-side avoids CORS and network-level blocks
//    entirely, because the Next.js server has direct internet access.
//  - Centralises the Piston base URL and timeout so it's easy to change.

import { NextResponse } from "next/server";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";
// Give Piston 20 s to respond (generous for cold-start containers).
// The client-side timeout in the editor is 25 s, so the server always
// resolves first.
const PISTON_TIMEOUT_MS = 20_000;

export async function POST(request: Request) {
  // Parse the incoming body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PISTON_TIMEOUT_MS);

  try {
    const upstream = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Piston returned ${upstream.status}`, detail: text },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    return NextResponse.json(
      {
        error: isAbort
          ? "Code execution timed out. Your code may be running an infinite loop or taking too long."
          : "Execution service unavailable. Please try again.",
        detail: err?.message || String(err),
      },
      { status: isAbort ? 504 : 503 }
    );
  } finally {
    clearTimeout(timer);
  }
}
