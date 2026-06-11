// app/api/student/pdf-proxy/[lessonId]/route.ts
// Proxies a PDF lesson from Django through Next.js so it can be embedded
// in an <iframe> on the same origin — avoiding X-Frame-Options blocks.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";
const API_KEY =
  process.env.STORE_API_KEY || "WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await ctx.params;

  if (!lessonId || Number.isNaN(Number(lessonId))) {
    return NextResponse.json({ detail: "Invalid lessonId" }, { status: 400 });
  }

  try {
    // 1. Get the signed/stream URL from the lesson-media-url endpoint
    const session = await getServerSession(authOptions);
    const sessionToken: string | undefined =
      session?.user && "sessionToken" in session.user
        ? (session.user as any).sessionToken ?? undefined
        : undefined;

    const headers: Record<string, string> = {
      Authorization: `Api-Key ${API_KEY}`,
      Accept: "application/json",
    };
    if (sessionToken) headers["X-Session-Token"] = sessionToken;

    const mediaUrlRes = await fetch(
      `${BASE_URL}/learning/api/lesson-media-url/${lessonId}/`,
      { headers, cache: "no-store" }
    );

    if (!mediaUrlRes.ok) {
      const text = await mediaUrlRes.text();
      let detail = "Could not resolve media URL";
      try {
        detail = JSON.parse(text)?.detail || detail;
      } catch {}
      return NextResponse.json({ detail }, { status: mediaUrlRes.status });
    }

    const { url: mediaUrl } = await mediaUrlRes.json();

    if (!mediaUrl) {
      return NextResponse.json(
        { detail: "No media URL returned for this lesson" },
        { status: 404 }
      );
    }

    // 2. Stream-fetch the actual PDF bytes
    //    If it's the local stream-video endpoint we add auth headers; 
    //    for S3 presigned URLs we fetch directly (they carry auth in query string).
    const isLocal =
      mediaUrl.includes("127.0.0.1") || mediaUrl.includes("localhost");

    const pdfHeaders: Record<string, string> = {
      Authorization: `Api-Key ${API_KEY}`,
    };
    if (isLocal && sessionToken) pdfHeaders["X-Session-Token"] = sessionToken;

    const pdfRes = await fetch(mediaUrl, {
      headers: isLocal ? pdfHeaders : {},
      cache: "no-store",
    });

    if (!pdfRes.ok) {
      return NextResponse.json(
        { detail: "Failed to fetch PDF from storage" },
        { status: pdfRes.status }
      );
    }

    // 3. Stream the PDF back to the browser with proper headers
    const contentType =
      pdfRes.headers.get("content-type") || "application/pdf";
    const contentLength = pdfRes.headers.get("content-length");

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      // Allow the browser to render inline inside an iframe on same origin
      "Content-Disposition": "inline",
      // No caching for authenticated content
      "Cache-Control": "private, no-store",
      // Allow same-origin iframes
      "X-Frame-Options": "SAMEORIGIN",
    };
    if (contentLength) responseHeaders["Content-Length"] = contentLength;

    return new NextResponse(pdfRes.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (e: any) {
    return NextResponse.json(
      { detail: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
