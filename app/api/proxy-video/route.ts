
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

function normalizeMedia(media: string | null): string | null {
  if (!media) return null;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  return `${BASE_URL}/media/${cleaned}`;
}

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "video/mp4",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req: Request) {
  noStore();
  const url = new URL(req.url).searchParams.get("url");
  const normalizedUrl = normalizeMedia(url);

  if (!normalizedUrl) {
    console.error("[ProxyVideo] Invalid video URL:", url);
    return NextResponse.json(
      { error: "Invalid video URL" },
      { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  const session = await getServerSession(authOptions);
  console.log("[ProxyVideo] Session:", { sessionToken: session?.user?.sessionToken });

  if (!session?.user?.sessionToken) {
    console.error("[ProxyVideo] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    console.log("[ProxyVideo] Fetching:", normalizedUrl, "with token:", session.user.sessionToken);
    const response = await fetch(normalizedUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[ProxyVideo] Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: normalizedUrl,
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const rawResponse = await response.text();
      console.error("[ProxyVideo] Fetch failed:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: rawResponse.slice(0, 200),
        url: normalizedUrl,
      });
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.status} ${response.statusText}`, details: rawResponse },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    if (!contentType.includes("video/")) {
      const rawResponse = await response.text();
      console.error("[ProxyVideo] Non-video response:", { contentType, body: rawResponse.slice(0, 200), url: normalizedUrl });
      return NextResponse.json(
        { error: `Invalid response format, expected video, got ${contentType}` },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    const stream = response.body;
    if (!stream) {
      console.error("[ProxyVideo] No response body:", normalizedUrl);
      return NextResponse.json(
        { error: "No response body" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD",
      },
    });
  } catch (error) {
    console.error("[ProxyVideo] Fetch error:", normalizedUrl, error);
    return NextResponse.json(
      { error: "Failed to fetch video", details: String(error) },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

export async function HEAD(req: Request) {
  noStore();
  const url = new URL(req.url).searchParams.get("url");
  const normalizedUrl = normalizeMedia(url);

  if (!normalizedUrl) {
    console.error("[ProxyVideo] Invalid video URL for HEAD:", url);
    return NextResponse.json(
      { error: "Invalid video URL" },
      { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.error("[ProxyVideo] No session token found for HEAD");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    console.log("[ProxyVideo] HEAD request:", normalizedUrl, "with token:", session.user.sessionToken);
    const response = await fetch(normalizedUrl, {
      method: "HEAD",
      headers: headers(session.user.sessionToken),
    });

    console.log("[ProxyVideo] HEAD response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: normalizedUrl,
    });

    if (!response.ok) {
      const rawResponse = await response.text();
      console.error("[ProxyVideo] HEAD failed:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: rawResponse.slice(0, 200),
        url: normalizedUrl,
      });
      return NextResponse.json(
        { error: `HEAD request failed: ${response.status} ${response.statusText}`, details: rawResponse },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "video/mp4",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD",
      },
    });
  } catch (error) {
    console.error("[ProxyVideo] HEAD error:", normalizedUrl, error);
    return NextResponse.json(
      { error: "Failed to perform HEAD request", details: String(error) },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}
