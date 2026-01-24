// app/api/teacher/upload/route.ts (or your current path)
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

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

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
          error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(
            ", "
          )}`,
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds limit of ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Rebuild FormData (safe + explicit)
    const formDataToSend = new FormData();
    formDataToSend.append("file", file);

    // Important: use djangoFetch so we reuse API key + session token + cookies
    // and DO NOT force Content-Type (FormData boundary must be set by fetch)
    const { response, text, setCookie } = await djangoFetch(
      "/learning/api/upload/",
      {
        method: "POST",
        body: formDataToSend,
      }
    );

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[FileUploadAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      const payload =
        response.status === 401
          ? { error: "Session expired", redirect: "/auth/signin" }
          : { error: "Failed to upload file" };

      const nextRes = NextResponse.json(payload, { status: response.status });
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    if (!contentType.includes("application/json")) {
      console.error("[FileUploadAPI] Non-JSON response received:", contentType);
      const nextRes = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500 }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("[FileUploadAPI] Failed to parse JSON:", parseError);
      const nextRes = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    // Prefer backend URL if provided
    const fileUrl = data?.url || data?.file_url || "";

    const nextRes = NextResponse.json({ url: fileUrl }, { status: 200 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    nextRes.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    nextRes.headers.set("Pragma", "no-cache");
    nextRes.headers.set("Expires", "0");
    return nextRes;
  } catch (error) {
    console.error("[FileUploadAPI] Error:", error);
    const nextRes = NextResponse.json(
      { error: "Failed to upload file", details: (error as Error).message },
      { status: 500 }
    );
    nextRes.headers.set("Cache-Control", "no-store");
    return nextRes;
  }
}
