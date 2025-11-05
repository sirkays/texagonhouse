import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";
//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = process.env.TEXAGON_API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function handler(req, { params }) {
  noStore();
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }

  console.log(params, " params....");

  const pathSegments = params.path || [];
  const path = pathSegments.join("/");
  console.log(path, " path....");
  let backendPath = "/api/tutor/tutoring/" + path; // Align with docs prefix
  if (path === "children" || path === "children/") {
    backendPath = "/api/tutor/tutoring/children/"; // Use docs endpoint
  } else if (path === "reset-child-password") {
    backendPath = "/accounts/api/parent/reset-child-password/"; // Keep for POST
  }
  const fullUrl = `${BASE_URL}${backendPath}${req.nextUrl.search}`;
  console.log("[ParentAPI] Initiating fetch for:", fullUrl);

  const fetchHeaders = {
    "Authorization": `Session ${session.user.sessionToken}`,
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  };

  const fetchOptions = {
    method: req.method,
    headers: fetchHeaders,
  };

  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = await req.json();
      fetchOptions.body = JSON.stringify(body);
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }
  }

  try {
    const response = await fetch(fullUrl, fetchOptions);
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      let errorMsg = "Failed to process request";
      if (response.status === 400) {
        errorMsg = rawResponse || "Bad request - Invalid parameters";
      } else if (response.status === 401) {
        errorMsg = "Authentication credentials were not provided";
      } else if (response.status === 403) {
        errorMsg = "Forbidden - Not a parent or insufficient permissions";
      } else if (response.status === 404) {
        errorMsg = "Resource not found";
      }
      return NextResponse.json({ error: errorMsg }, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Invalid response format, expected JSON" }, {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid response format" }, {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

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
    console.error("[ParentAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
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

export { handler as GET, handler as POST };