// app/api/live/route.ts (or wherever your handlers live)
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

function buildHeaders(setCookie?: string) {
  const h = new Headers();

  h.set("Content-Type", "application/json");
  h.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  h.set("Pragma", "no-cache");
  h.set("Expires", "0");

  if (setCookie) {
    // forward Django session cookie back to browser
    h.set("Set-Cookie", setCookie);
  }

  return h; // ✅ this is HeadersInit
}


function withSetCookieHeaders(setCookie?: string) {
  return setCookie ? { "Set-Cookie": setCookie } : {};
}

function jsonError(
  message: string,
  status: number,
  setCookie?: string,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { error: message, ...(extra ?? {}) },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...withSetCookieHeaders(setCookie),
      },
    }
  );
}

// POST: Create a new live session
export async function POST(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) return jsonError("Not authenticated", 401);
  if (session.user.role !== "teacher") {
    return jsonError("Unauthorized: Only teachers can create live sessions", 403);
  }

  try {
    const body = await req.json();

    const processedBody = {
      course_id: Number.parseInt(body.course_id) || 0,
      title: body.title || "Untitled Session",
      scheduled_at: body.scheduled_at || new Date().toISOString(),
      duration_minutes: Number.parseInt(body.duration_minutes) || 60,
      join_url: body.join_url || "",
      meta: body.meta || {},
    };

    const { response, text, setCookie } = await djangoFetch(
      "/live/api/create-live-session/",
      {
        method: "POST",
        body: JSON.stringify(processedBody),
        headers: {
          // djangoFetch already sets Content-Type application/json
          // keep here only if you want to override/add something
        },
      }
    );

    if (!response.ok) {
      console.error("[LiveSessionCreateAPI] Request failed:", response.status, text.slice(0, 200));
      if (response.status === 401) return jsonError("Session expired", 401, setCookie);
      return jsonError("Failed to create live session", response.status, setCookie);
    }

    // djangoFetch returns text; parse safely
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("[LiveSessionCreateAPI] Non-JSON response received:", text.slice(0, 200));
      return jsonError("Invalid response format, expected JSON", 500, setCookie);
    }

    return NextResponse.json(data, {
      status: 201,
      headers: buildHeaders(setCookie),
    });
  } catch (error: any) {
    console.error("[LiveSessionCreateAPI] Request error:", error);
    return jsonError("Failed to create live session", 500, undefined, {
      details: error?.message ?? String(error),
    });
  }
}

// GET: Retrieve all live sessions for a course
export async function GET() {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) return jsonError("Not authenticated", 401);

  try {
    const { response, text, setCookie } = await djangoFetch("/live/api/get-live-session/", {
      method: "GET",
    });

    if (!response.ok) {
      console.error("[LiveSessionGetAPI] Request failed:", response.status, text.slice(0, 200));
      if (response.status === 401) return jsonError("Session expired", 401, setCookie);
      return jsonError("Failed to retrieve live sessions", response.status, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("[LiveSessionGetAPI] Non-JSON response received:", text.slice(0, 200));
      return jsonError("Invalid response format, expected JSON", 500, setCookie);
    }

    return NextResponse.json(data, {
      status: 200,
      headers: buildHeaders(setCookie),
    });
  } catch (error: any) {
    console.error("[LiveSessionGetAPI] Request error:", error);
    return jsonError("Failed to retrieve live sessions", 500, undefined, {
      details: error?.message ?? String(error),
    });
  }
}

// PATCH: Update live session status
export async function PATCH(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) return jsonError("Not authenticated", 401);
  if (session.user.role !== "teacher") {
    return jsonError("Unauthorized: Only teachers can update live sessions", 403);
  }

  try {
    const { sessionId } = await context.params;
    const body = await req.json();

    const processedBody = { status: body.status || "completed" };

    const { response, text, setCookie } = await djangoFetch(
      `/live/api/update-live-session/${sessionId}/status/`,
      {
        method: "PATCH",
        body: JSON.stringify(processedBody),
      }
    );

    if (!response.ok) {
      console.error("[LiveSessionUpdateAPI] Request failed:", response.status, text.slice(0, 200));
      if (response.status === 401) return jsonError("Session expired", 401, setCookie);
      return jsonError("Failed to update live session", response.status, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("[LiveSessionUpdateAPI] Non-JSON response received:", text.slice(0, 200));
      return jsonError("Invalid response format, expected JSON", 500, setCookie);
    }

    return NextResponse.json(data, {
      status: 200,
      headers:buildHeaders(setCookie),
    });
  } catch (error: any) {
    console.error("[LiveSessionUpdateAPI] Request error:", error);
    return jsonError("Failed to update live session", 500, undefined, {
      details: error?.message ?? String(error),
    });
  }
}

// DELETE: Delete a live session
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ meetingId: string }> }
) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) return jsonError("Not authenticated", 401);
  if (session.user.role !== "teacher") {
    return jsonError("Unauthorized: Only teachers can delete live sessions", 403);
  }

  try {
    const { meetingId } = await context.params;

    const { response, text, setCookie } = await djangoFetch(
      `/live/api/delete-live-session/${meetingId}/delete/`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      console.error("[LiveSessionDeleteAPI] Request failed:", response.status, text.slice(0, 200));
      if (response.status === 401) return jsonError("Session expired", 401, setCookie);
      return jsonError("Failed to delete live session", response.status, setCookie);
    }

    // 204 should not include body
    return new NextResponse(null, {
      status: 204,
      headers: buildHeaders(setCookie),
    });
  } catch (error: any) {
    console.error("[LiveSessionDeleteAPI] Request error:", error);
    return jsonError("Failed to delete live session", 500, undefined, {
      details: error?.message ?? String(error),
    });
  }
}
