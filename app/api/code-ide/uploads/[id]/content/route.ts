// app/api/code-ide/uploads/[id]/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/code-ide/api/ide";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function fetchWithTimeout(url: string, options: any = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${options.timeout || 30000}ms`);
    }
    throw err;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  // Await params to fix Next.js dynamic API warning
  const params = await context.params;
  const id = params.id;

  try {
    // First get file details
    const detailUrl = `${BASE_URL}/files/${id}/`;
    console.log(`[Content Route] Fetching file details: ${detailUrl}`);

    const detailRes = await fetchWithTimeout(detailUrl, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
      timeout: 15000, // 15s for details
    });

    if (!detailRes.ok) {
      const errorText = await detailRes.text();
      console.error(`[Content Route] File details failed ${detailRes.status}:`, errorText);
      return NextResponse.json(
        { error: `File not found: ${errorText}` },
        { status: 404 }
      );
    }

    const fileData = await detailRes.json();
    console.log(`[Content Route] File details fetched, URL: ${fileData.url}`);

    // Now fetch the actual content
    const contentRes = await fetchWithTimeout(fileData.url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
      timeout: 20000, // 20s for content (larger files)
    });

    if (!contentRes.ok) {
      const errorText = await contentRes.text();
      console.error(`[Content Route] Content fetch failed ${contentRes.status}:`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch content: ${errorText}` },
        { status: 500 }
      );
    }

    // Get content as text or buffer
    const contentType = fileData.content_type || 'text/plain';
    const contentBuffer = await contentRes.arrayBuffer();

    console.log(`[Content Route] Content fetched: ${contentBuffer.byteLength} bytes`);

    return new NextResponse(contentBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*', // If needed for CORS
      },
    });

  } catch (error) {
    console.error("[Content Route] Error:", error);
    return NextResponse.json(
      { error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}