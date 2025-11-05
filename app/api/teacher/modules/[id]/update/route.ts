import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  noStore();
  const moduleId = params.id;
  const endpoint = `/learning/api/teacher/modules/${moduleId}/update/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[ModuleUpdateAPI] Initiating PATCH request for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[ModuleUpdateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[ModuleUpdateAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/auth/signin" },
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
    const body = await req.json();
    console.log("[ModuleUpdateAPI] Request body:", body);

    console.log("[ModuleUpdateAPI] Sending PATCH to", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[ModuleUpdateAPI] Response status:", response.status);
    console.log("[ModuleUpdateAPI] Response headers:", Object.fromEntries(response.headers));
    console.log("[ModuleUpdateAPI] Response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[ModuleUpdateAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[ModuleUpdateAPI] Fetch failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/auth/signin" },
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
          { error: `Module with ID ${moduleId} not found` },
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
        { error: "Failed to update module" },
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
      console.error("[ModuleUpdateAPI] Non-JSON response received:", contentType);
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
      console.error("[ModuleUpdateAPI] Failed to parse JSON:", parseError);
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

    console.log("[ModuleUpdateAPI] Update successful, data:", data);
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
    console.error("[ModuleUpdateAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to update module", details: (error as Error).message },
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