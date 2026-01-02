import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

function normalizeMedia(media: string | null): string | null {
  if (!media) return null;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  return `${BASE_URL}/media/${cleaned}`;
}

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/octet-stream",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function GET(req: Request) {
  noStore();
  const url = new URL(req.url).searchParams.get("url");
  const normalizedUrl = normalizeMedia(url);

  if (!normalizedUrl) {
    console.error("[ProxyVideo] Invalid media URL:", url);
    return NextResponse.json(
      {error: "Invalid media URL"},
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[ProxyVideo] No session token found");
    return NextResponse.json(
      {error: "Not authenticated"},
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
    const response = await fetch(normalizedUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
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
        {
          error: `Failed to fetch media: ${response.status} ${response.statusText}`,
          details: rawResponse,
        },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const stream = response.body;
    if (!stream) {
      console.error("[ProxyVideo] No response body:", normalizedUrl);
      return NextResponse.json(
        {error: "No response body"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD",
      },
    });
  } catch (error) {
    console.error("[ProxyVideo] Fetch error:", normalizedUrl, error);
    return NextResponse.json(
      {error: "Failed to fetch media", details: String(error)},
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

export async function HEAD(req: Request) {
  noStore();
  const url = new URL(req.url).searchParams.get("url");
  const normalizedUrl = normalizeMedia(url);

  if (!normalizedUrl) {
    console.error("[ProxyVideo] Invalid media URL for HEAD:", url);
    return NextResponse.json(
      {error: "Invalid media URL"},
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.error("[ProxyVideo] No session token found for HEAD");
    return NextResponse.json(
      {error: "Not authenticated"},
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
    const response = await fetch(normalizedUrl, {
      method: "HEAD",
      headers: headers(session.user.sessionToken),
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
        {
          error: `HEAD request failed: ${response.status} ${response.statusText}`,
          details: rawResponse,
        },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD",
      },
    });
  } catch (error) {
    console.error("[ProxyVideo] HEAD error:", normalizedUrl, error);
    return NextResponse.json(
      {error: "Failed to perform HEAD request", details: String(error)},
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
