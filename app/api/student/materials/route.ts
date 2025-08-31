import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";

function normalizeImage(image) {
  if (!image) return null;
  const cleaned = image.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  return `${BASE_URL}/media/${cleaned}`;
}

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req) {
  noStore();
  const endpoint = "/learning/api/materials/mine/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Materials API] Initiating fetch for:", fullUrl);

  const token = await getToken({ req, secret: "aVeryStrongSecretKeyAtLeast32Chars" });
  console.log("[Materials API] Token retrieved:", token ? { id: token.id, role: token.role, sessionToken: token.sessionToken } : "No token");

  if (!token?.sessionToken) {
    console.log("[Materials API] No session token found");
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
    console.log("[Materials API] Fetching from", fullUrl, "with token:", token.sessionToken);
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(token.sessionToken),
    });

    console.log("[Materials API] Fetch response status:", response.status);
    console.log("[Materials API] Fetch response headers:", Object.fromEntries(response.headers));
    console.log("[Materials API] Fetch response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[Materials API] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[Materials API] Fetch failed:", response.status, rawResponse.slice(0, 100));
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
          { error: "Materials endpoint not found" },
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
        { error: "Failed to fetch materials" },
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
      console.error("[Materials API] Non-JSON response received:", contentType);
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
      console.error("[Materials API] Failed to parse JSON:", parseError);
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

    // Normalize thumbnail URLs in videos
    const normalizedData = {
      ...data,
      saved: {
        ...data.saved,
        videos: data.saved.videos.map((video) => ({
          ...video,
          thumbnail: normalizeImage(video.thumbnail) || "/placeholder.svg?height=120&width=200&text=Video+Thumbnail",
          videoUrl: normalizeImage(video.videoUrl) || "/sample-video.mp4",
        })),
      },
    };

    console.log("[Materials API] Fetch successful, normalized data:", normalizedData);
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
    console.error("[Materials API] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials", details: error.message },
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