// app/api/ide/snippets/route.ts
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

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/ide/snippets");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const lesson = searchParams.get("lesson");
    let url = `${BASE_URL}/snippets/`;
    if (lesson) url += `?lesson=${lesson}`;
    console.log("[Route] Fetching snippets from:", url);

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

export async function POST(request: Request) {
  console.log("[Route] Received POST request to /api/ide/snippets");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  let body;

  try {
    body = await request.json();
    console.log("[Route] Raw POST body:", body);
  } catch (err) {
    console.error("[Route] Error parsing request body:", (err as Error).message);
    return NextResponse.json(
      { error: "Invalid request body", details: (err as Error).message },
      { status: 400 }
    );
  }

  // const requiredFields = ["language", "code_text"];
  // for (const field of requiredFields) {
  //   if (!body[field]) {
  //     console.error("[Route] Missing required field:", field);
  //     return NextResponse.json({ error: `Missing ${field}` }, { status: 400 });
  //   }
  // }

  try {
    const url = `${BASE_URL}/snippets/create/`;
    console.log("[Route] Creating snippet at:", url);
    console.log("[Route] Payload for backend:", JSON.stringify(body, null, 2));

    const res = await fetchWithTimeout(url, {
      method: "POST",
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
        { error: `Failed to create snippet: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[Route] External API response data:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[Route] Error creating snippet:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Note: In Next.js 15+, you might need to await params: const { id } = await params;
  const { id } = params;

  try {
    // Construct the backend URL: /snippets/{id}/delete/
    const url = `${BASE_URL}/snippets/${id}/delete/`;
    
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    // 204 means success with no content
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Delete failed: ${errorText}` },
        { status: res.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}