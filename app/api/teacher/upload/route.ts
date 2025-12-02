import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

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
  // Images (optional, for potential thumbnails or related assets)
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const headers = (sessionToken: string | undefined) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function POST(req: Request) {
  noStore();
  const endpoint = "/learning/api/upload/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[FileUploadAPI] Initiating file upload to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[FileUploadAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[FileUploadAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/auth/signin" },
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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("[FileUploadAPI] No file provided");
      return NextResponse.json(
        { error: "No file provided" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log("[FileUploadAPI] File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.log("[FileUploadAPI] Invalid file type:", file.type);
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}` },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      console.log("[FileUploadAPI] File too large:", file.size);
      return NextResponse.json(
        { error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);

    console.log("[FileUploadAPI] Sending file to", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: formDataToSend,
    });

    console.log("[FileUploadAPI] Response status:", response.status);
    console.log("[FileUploadAPI] Response headers:", Object.fromEntries(response.headers));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[FileUploadAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[FileUploadAPI] Fetch failed:", response.status, rawResponse.slice(0, 100));
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
      return NextResponse.json(
        { error: "Failed to upload file" },
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
      console.error("[FileUploadAPI] Non-JSON response received:", contentType);
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
      console.error("[FileUploadAPI] Failed to parse JSON:", parseError);
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

    // Assuming the backend returns a URL for the uploaded file
    const fileUrl = data.url || `${BASE_URL}/media/${file.name}`;
    console.log("[FileUploadAPI] File upload successful, URL:", fileUrl);

    return NextResponse.json(
      { url: fileUrl },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("[FileUploadAPI] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: (error as Error).message },
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