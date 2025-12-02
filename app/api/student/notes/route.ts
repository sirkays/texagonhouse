import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req) {
  noStore();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const lessonId = searchParams.get("lesson");
  let endpoint;
  if (id) {
    endpoint = `/api/notes/${id}/`;
  } else if (lessonId) {
    endpoint = `/api/notes/?lesson=${lessonId}`;
  } else {
    endpoint = "/api/notes/";
  }
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Notes API] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Notes API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user
      ? { id: session.user.id, role: session.user.role }
      : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Notes API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  try {
    console.log(
      "[Notes API] Fetching from",
      fullUrl,
      "with token:",
      session.user.sessionToken
    );
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[Notes API] Fetch response status:", response.status);
    console.log(
      "[Notes API] Fetch response headers:",
      Object.fromEntries(response.headers)
    );
    console.log(
      "[Notes API] Fetch response content-type:",
      response.headers.get("content-type")
    );

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(
      "[Notes API] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[Notes API] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Note not found" },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch notes", details: rawResponse },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[Notes API] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[Notes API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log("[Notes API] Fetch successful, data:", data);
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[Notes API] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes", details: error.message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export async function POST(req) {
  noStore();
  const endpoint = "/api/notes/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Notes API] Initiating POST to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Notes API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user
      ? { id: session.user.id, role: session.user.role }
      : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Notes API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const body = await req.json();
    console.log("[Notes API] POST body:", body);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify({
        ...body,
        student: session.user.id, // Add student ID from session
      }),
    });

    console.log("[Notes API] POST response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(
      "[Notes API] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[Notes API] POST failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch {
        errorData = { error: "Invalid response format" };
      }
      return NextResponse.json(
        { error: "Failed to create note", details: errorData },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[Notes API] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[Notes API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log("[Notes API] POST successful, data:", data);
    return NextResponse.json(data, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Notes API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create note", details: error.message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export async function PATCH(req) {
  noStore();
  const body = await req.json();
  const { id, ...updates } = body;
  const endpoint = `/api/notes/${id}/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Notes API] Initiating PATCH to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Notes API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user
      ? { id: session.user.id, role: session.user.role }
      : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Notes API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    console.log("[Notes API] PATCH body:", updates);
    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify({
        ...updates,
        student: session.user.id, // Add student ID from session
      }),
    });

    console.log("[Notes API] PATCH response status:", response.status);
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(
      "[Notes API] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[Notes API] PATCH failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch {
        errorData = { error: "Invalid response format" };
      }
      return NextResponse.json(
        { error: "Failed to update note", details: errorData },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[Notes API] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[Notes API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log("[Notes API] PATCH successful, data:", data);
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Notes API] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update note", details: error.message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export async function DELETE(req) {
  noStore();
  const { id } = await req.json();
  const endpoint = `/api/notes/${id}/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Notes API] Initiating DELETE to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Notes API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user
      ? { id: session.user.id, role: session.user.role }
      : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Notes API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
    });

    console.log("[Notes API] DELETE response status:", response.status);
    const rawResponse = await response.text();
    console.log(
      "[Notes API] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[Notes API] DELETE failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch {
        errorData = { error: "Invalid response format" };
      }
      return NextResponse.json(
        { error: "Failed to delete note", details: errorData },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log("[Notes API] DELETE successful");
    return NextResponse.json(
      { message: "Note deleted" },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[Notes API] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete note", details: error.message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
