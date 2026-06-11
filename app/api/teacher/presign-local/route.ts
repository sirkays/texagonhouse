/**
 * /api/teacher/presign-local
 *
 * LOCAL MODE proxy: forwards a multipart file upload from the browser
 * to Django's /learning/api/presign-s3/ endpoint (server-side, no CORS).
 *
 * Used when NEXT_PUBLIC_UPLOAD_BUCKET=local so that teacher lesson media
 * is saved to Django's local media/lessons/ directory instead of S3/Cloudinary.
 *
 * Returns: { key: string, filename: string, mode: "local" }
 */
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

const ALLOWED_FILE_TYPES = [
  // Video
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/x-matroska",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp3",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  // Images
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(req: Request) {
  noStore();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed: video, audio, PDF, Word, images.`,
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Forward the file to Django's presign-s3 endpoint (server-side → no CORS)
    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    formDataToSend.append("filename", file.name);

    const { response, text, setCookie } = await djangoFetch(
      "/learning/api/presign-s3/",
      {
        method: "POST",
        body: formDataToSend,
      }
    );

    if (!response.ok) {
      let errMsg = "Upload to local storage failed";
      try {
        const j = JSON.parse(text || "{}");
        errMsg = j?.detail || j?.error || errMsg;
      } catch {}
      const nextRes = NextResponse.json(
        { error: errMsg },
        { status: response.status }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON response from backend" },
        { status: 500 }
      );
    }

    // Return key + filename so the frontend can store the S3 key path
    const nextRes = NextResponse.json(
      {
        key: data.key,
        filename: data.filename,
        mode: data.mode || "local",
      },
      { status: 200 }
    );
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    nextRes.headers.set("Cache-Control", "no-store");
    return nextRes;
  } catch (error) {
    console.error("[presign-local] Error:", error);
    return NextResponse.json(
      { error: "Local upload failed", details: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
