// app/api/ide/submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/code-ide/api/ide";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function fetchWithTimeout(url: string, options: any) {
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`[Route] Received GET request to /api/ide/submissions/${params.id}`);
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const url = `${BASE_URL}/submissions/${params.id}/`;
    console.log("[Route] Fetching submission from:", url);

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
    console.error("[Route] Error fetching data:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  console.log(`[Route] Received PATCH request to /api/ide/submissions/${params.id}`);
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
    console.log("[Route] Raw PATCH body:", body);
  } catch (err) {
    console.error("[Route] Error parsing request body:", (err as Error).message);
    return NextResponse.json(
      { error: "Invalid request body", details: (err as Error).message },
      { status: 400 }
    );
  }

  try {
    const url = `${BASE_URL}/submissions/${params.id}/teacher-update/`;
    console.log("[Route] Updating submission at:", url);
    console.log("[Route] Payload for backend:", JSON.stringify(body, null, 2));

    const res = await fetchWithTimeout(url, {
      method: "PATCH",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
      timeout: 20000,
    });

    console.log("[Route] External API response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Route] External API error response:", errorText);
      return NextResponse.json(
        { error: `Failed to update submission: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[Route] External API response data:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[Route] Error updating submission:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}