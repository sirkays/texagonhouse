import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

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
  Authorization: `Api-Key ${API_KEY}`,
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function POST(req: Request) {
  noStore();
  const endpoint = "/learning/api/upload/";
  const fullUrl = `${BASE_URL}${endpoint}`;

  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/auth/signin"},
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
      return NextResponse.json(
        {error: "No file provided"},
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(
            ", "
          )}`,
        },
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
      return NextResponse.json(
        {
          error: `File size exceeds limit of ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
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

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: formDataToSend,
    });

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error(
        "[FileUploadAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      if (response.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/auth/signin"},
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
        {error: "Failed to upload file"},
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
      console.error("[FileUploadAPI] Failed to parse JSON:", parseError);
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

    // Assuming the backend returns a URL for the uploaded file
    const fileUrl = data.url || `${BASE_URL}/media/${file.name}`;

    return NextResponse.json(
      {url: fileUrl},
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("[FileUploadAPI] Error:", error);
    return NextResponse.json(
      {error: "Failed to upload file", details: (error as Error).message},
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
