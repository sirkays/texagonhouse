// app/api/media/route.ts (unchanged)
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]/route";

const ALLOWED_HOST = "texagonbackend.epichouse.online";
const ALLOWED_ORIGIN = "http://localhost:3000"; // Adjust for production
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Range, Content-Type, Accept, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  try {
    const {searchParams} = new URL(req.url);
    const rawUrl = searchParams.get("url");
    if (!rawUrl) {
      return NextResponse.json({error: "Missing url param"}, {status: 400});
    }

    let remoteUrl: URL;
    try {
      remoteUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json({error: "Invalid URL"}, {status: 400});
    }

    if (remoteUrl.hostname !== ALLOWED_HOST) {
      return NextResponse.json({error: "Host not allowed"}, {status: 403});
    }

    const upstreamHeaders: Record<string, string> = {
      Authorization: `Api-Key ${API_KEY}`,
    };

    if (session?.user?.sessionToken) {
      upstreamHeaders["X-Session-Token"] = session.user.sessionToken;
    }

    const upstream = await fetch(remoteUrl.toString(), {
      headers: upstreamHeaders,
      method: "GET",
    });

    if (!upstream.ok) {
      console.error(
        `Upstream fetch failed for ${remoteUrl}: ${upstream.status} - ${upstream.statusText}`
      );
      return NextResponse.json(
        {
          error: "Upstream fetch failed",
          status: upstream.status,
          details: upstream.statusText,
        },
        {status: upstream.status}
      );
    }

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    const contentLength = upstream.headers.get("content-length");
    if (contentType) headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);

    headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) headers.set("accept-ranges", acceptRanges);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error("[MEDIA PROXY ERROR]", err);
    return NextResponse.json(
      {error: "Server error", details: err.message},
      {status: 500}
    );
  }
}
