// app/api/code-ide/uploads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/code-ide/api/ide";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function fetchWithTimeout(url: string, options: any = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000); // Increased to 30s
  
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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const url = `${BASE_URL}/files/${params.id}/`;
    console.log(`[File Detail] Fetching ${url}`); // Debug log
    
    const res = await fetchWithTimeout(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
      timeout: 20000, // Increased timeout for file detail fetch
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[File Detail] Backend error ${res.status}:`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch file: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(`[File Detail] Success for file ${params.id}`); // Debug log
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[File Detail Route] Error:", error);
    return NextResponse.json(
      { error: `Failed to fetch file details: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// DELETE handler remains the same...
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const url = `${BASE_URL}/files/${params.id}/delete/`;
    const res = await fetchWithTimeout(url, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
      timeout: 15000,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Delete failed: ${errorText}` },
        { status: res.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[File Delete Route] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}