import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function handler(req: any) {
  noStore();
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated"},
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

  const localPrefix = "/api/parent/tutoring";
  let backendPath = "/api/tutor/tutoring";
  const path = req.nextUrl.pathname.substring(localPrefix.length) || "/";
  if (path === "/children" || path === "/children/") {
    backendPath = "/accounts/api/parent";
  }
  const fullUrl = `${BASE_URL}${backendPath}${path}${req.nextUrl.search}`;

  const fetchHeaders = {
    Authorization: `Session ${session.user.sessionToken}`,
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
      return NextResponse.json(
        {error: "Invalid request body"},
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }
  }

  try {
    // if (body) console.log("[TutoringAPI] With body:", body);
    const response = await fetch(fullUrl, fetchOptions);
    const contentType = response.headers.get("content-type") || "";

    const rawResponse = await response.text();

    if (!response.ok) {
      console.error(
        "[TutoringAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      let errorMsg = "Failed to process tutoring request";
      if (response.status === 400) {
        errorMsg = rawResponse || "Bad request - Invalid parameters";
      } else if (response.status === 401) {
        errorMsg = "Authentication credentials were not provided";
      } else if (response.status === 403) {
        errorMsg = "Forbidden - Not a parent or insufficient permissions";
      } else if (response.status === 404) {
        errorMsg = "Resource not found - Student, tutor, or booking not found";
      }
      return NextResponse.json(
        {error: errorMsg},
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
      console.error("[TutoringAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        {error: "Invalid response format, expected JSON"},
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
      console.error("[TutoringAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        {error: "Invalid response format"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

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
    console.error("[TutoringAPI] Fetch error:", error);
    return NextResponse.json(
      {error: "Failed to process tutoring request", details: error.message},
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

export {handler as GET, handler as POST};
