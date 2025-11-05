import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

// POST: Create a new live session
export async function POST(req: Request) {
  noStore();
  const endpoint = "/live/api/create-live-session/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[LiveSessionCreateAPI] Initiating POST request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[LiveSessionCreateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[LiveSessionCreateAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  if (session.user.role !== "teacher") {
    console.log("[LiveSessionCreateAPI] Unauthorized: User is not a teacher");
    return NextResponse.json(
      { error: "Unauthorized: Only teachers can create live sessions" },
      { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    const body = await req.json();
    console.log("[LiveSessionCreateAPI] Request body:", body);

    const processedBody = {
      course_id: parseInt(body.course_id) || 0,
      title: body.title || "Untitled Session",
      scheduled_at: body.scheduled_at || new Date().toISOString(),
      duration_minutes: parseInt(body.duration_minutes) || 60,
      join_url: body.join_url || "",
      meta: body.meta || {},
    };

    console.log("[LiveSessionCreateAPI] Sending request to", fullUrl);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(processedBody),
    });

    console.log("[LiveSessionCreateAPI] Response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error("[LiveSessionCreateAPI] Request failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to create live session" },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[LiveSessionCreateAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    const data = JSON.parse(rawResponse);
    console.log("[LiveSessionCreateAPI] Live session created successfully:", data);
    return NextResponse.json(data, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[LiveSessionCreateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to create live session", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

// GET: Retrieve all live sessions for a course
export async function GET(req: Request, context: { params: Promise<{ courseId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/live/api/get-live-session/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[LiveSessionGetAPI] Initiating GET request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[LiveSessionGetAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[LiveSessionGetAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    console.log("[LiveSessionGetAPI] Sending request to", fullUrl);
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[LiveSessionGetAPI] Response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error("[LiveSessionGetAPI] Request failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to retrieve live sessions" },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[LiveSessionGetAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    const data = JSON.parse(rawResponse);
    console.log("[LiveSessionGetAPI] Live sessions retrieved successfully:", data);
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[LiveSessionGetAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve live sessions", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

// PATCH: Update live session status
export async function PATCH(req: Request, context: { params: Promise<{ sessionId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/live/api/update-live-session/${params.sessionId}/status/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[LiveSessionUpdateAPI] Initiating PATCH request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[LiveSessionUpdateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[LiveSessionUpdateAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  if (session.user.role !== "teacher") {
    console.log("[LiveSessionUpdateAPI] Unauthorized: User is not a teacher");
    return NextResponse.json(
      { error: "Unauthorized: Only teachers can update live sessions" },
      { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    const body = await req.json();
    console.log("[LiveSessionUpdateAPI] Request body:", body);

    const processedBody = {
      status: body.status || "completed",
    };

    console.log("[LiveSessionUpdateAPI] Sending request to", fullUrl);
    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(processedBody),
    });

    console.log("[LiveSessionUpdateAPI] Response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error("[LiveSessionUpdateAPI] Request failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to update live session" },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[LiveSessionUpdateAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    const data = JSON.parse(rawResponse);
    console.log("[LiveSessionUpdateAPI] Live session updated successfully:", data);
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[LiveSessionUpdateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to update live session", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

// DELETE: Delete a live session
export async function DELETE(req: Request, context: { params: Promise<{ meetingId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/live/api/delete-live-session/${params.meetingId}/delete/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[LiveSessionDeleteAPI] Initiating DELETE request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[LiveSessionDeleteAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[LiveSessionDeleteAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  if (session.user.role !== "teacher") {
    console.log("[LiveSessionDeleteAPI] Unauthorized: User is not a teacher");
    return NextResponse.json(
      { error: "Unauthorized: Only teachers can delete live sessions" },
      { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    console.log("[LiveSessionDeleteAPI] Sending request to", fullUrl);
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
    });

    console.log("[LiveSessionDeleteAPI] Response status:", response.status);
    if (!response.ok) {
      console.error("[LiveSessionDeleteAPI] Request failed:", response.status);
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to delete live session" },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    console.log("[LiveSessionDeleteAPI] Live session deleted successfully");
    return NextResponse.json(
      {},
      {
        status: 204,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("[LiveSessionDeleteAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to delete live session", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}