import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req) {
  noStore();
  const endpoint = "/api/bookmarks/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Bookmarks API] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Bookmarks API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Bookmarks API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  try {
    console.log("[Bookmarks API] Fetching from", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[Bookmarks API] Fetch response status:", response.status);
    console.log("[Bookmarks API] Fetch response headers:", Object.fromEntries(response.headers));
    console.log("[Bookmarks API] Fetch response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[Bookmarks API] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[Bookmarks API] Fetch failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Forbidden: No student profile" },
          { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Bookmarks endpoint not found" },
          { status: 404, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch bookmarks" },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[Bookmarks API] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[Bookmarks API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    // Normalize lesson to lessonId
    const normalizedData = data.map((bookmark) => ({
      ...bookmark,
      lessonId: bookmark.lesson,
      lesson: undefined, // Remove lesson to avoid confusion
    }));

    console.log("[Bookmarks API] Fetch successful, data:", normalizedData);
    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[Bookmarks API] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req) {
  noStore();
  const endpoint = "/api/bookmarks/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Bookmarks API] Initiating POST to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Bookmarks API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Bookmarks API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    const body = await req.json();
    console.log("[Bookmarks API] POST body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[Bookmarks API] POST response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    console.log("[Bookmarks API] Fetch response content-type:", contentType);
    const rawResponse = await response.text();
    console.log("[Bookmarks API] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[Bookmarks API] POST failed:", response.status, rawResponse.slice(0, 100));
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch {
        errorData = { error: "Invalid response format" };
      }
      return NextResponse.json(errorData, {
        status: response.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    if (!contentType.includes("application/json")) {
      console.error("[Bookmarks API] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[Bookmarks API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    // Normalize lesson to lessonId
    const normalizedData = {
      ...data,
      lessonId: data.lesson,
      lesson: undefined,
    };

    console.log("[Bookmarks API] POST successful, data:", normalizedData);
    return NextResponse.json(normalizedData, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[Bookmarks API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

export async function PATCH(req) {
  noStore();
  const endpoint = "/api/bookmarks/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Bookmarks API] Initiating PATCH to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Bookmarks API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Bookmarks API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    const body = await req.json();
    console.log("[Bookmarks API] PATCH body:", body);

    // Append bookmark ID to URL
    const response = await fetch(`${fullUrl}${body.id}/`, {
      method: "PATCH",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify({
        lesson: body.lesson,
        note: body.note,
        position_seconds: body.position_seconds,
      }),
    });

    console.log("[Bookmarks API] PATCH response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    console.log("[Bookmarks API] Fetch response content-type:", contentType);
    const rawResponse = await response.text();
    console.log("[Bookmarks API] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[Bookmarks API] PATCH failed:", response.status, rawResponse.slice(0, 100));
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch {
        errorData = { error: "Invalid response format" };
      }
      return NextResponse.json(errorData, {
        status: response.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    if (!contentType.includes("application/json")) {
      console.error("[Bookmarks API] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[Bookmarks API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    // Normalize lesson to lessonId
    const normalizedData = {
      ...data,
      lessonId: data.lesson,
      lesson: undefined,
    };

    console.log("[Bookmarks API] PATCH successful, data:", normalizedData);
    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[Bookmarks API] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(req) {
  noStore();
  const endpoint = "/api/bookmarks/";
  const body = await req.json();
  const fullUrl = `${BASE_URL}${endpoint}${body.id}/`;
  console.log("[Bookmarks API] Initiating DELETE to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Bookmarks API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Bookmarks API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    console.log("[Bookmarks API] DELETE for ID:", body.id);
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
    });

    console.log("[Bookmarks API] DELETE response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    console.log("[Bookmarks API] Fetch response content-type:", contentType);
    const rawResponse = await response.text();
    console.log("[Bookmarks API] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[Bookmarks API] DELETE failed:", response.status, rawResponse.slice(0, 100));
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch {
        errorData = { error: "Invalid response format" };
      }
      return NextResponse.json(errorData, {
        status: response.status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    console.log("[Bookmarks API] DELETE successful");
    return NextResponse.json(
      { message: "Bookmark deleted successfully" },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("[Bookmarks API] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}