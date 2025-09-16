import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";
import formidable from "formidable-serverless";
import fs from "fs/promises";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";
const FILE_FIELD_NAME = "file"; // Change to "media" or other if API requires

const headers = (sessionToken: string | undefined) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  noStore();
  const params = await context.params;
  const moduleId = params.id;
  const endpoint = `/learning/api/teacher/modules/${moduleId}/lessons/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[LessonCreateAPI] Initiating POST request for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[LessonCreateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[LessonCreateAPI] No session token found");
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
    const contentType = req.headers.get("content-type") || "";
    console.log("[LessonCreateAPI] Content-Type received:", contentType);

    let payload: any = {};
    let file: { path: string; name: string | null; type: string | null } | null = null;

    if (contentType.toLowerCase().includes("multipart/form-data")) {
      console.log("[LessonCreateAPI] Processing multipart/form-data");
      const form = formidable({ multiples: false, keepExtensions: true });
      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        req.arrayBuffer()
          .then(async (buffer) => {
            console.log("[LessonCreateAPI] Request body length:", buffer.byteLength);
            const readableStream = new ReadableStream({
              start(controller) {
                controller.enqueue(new Uint8Array(buffer));
                controller.close();
              },
            });
            const nodeStream = require("stream").Readable.fromWeb(readableStream);
            nodeStream.headers = {
              "content-type": contentType,
              "content-length": req.headers.get("content-length") || buffer.byteLength.toString(),
            };
            form.parse(nodeStream, (err, fields, files) => {
              if (err) reject(err);
              console.log("[LessonCreateAPI] Formidable parsed fields:", fields);
              console.log("[LessonCreateAPI] Formidable parsed files:", files);
              resolve([fields, files]);
            });
          })
          .catch(reject);
      });

      // Convert formidable fields to payload
      for (const key in fields) {
        const value = fields[key];
        payload[key] = Array.isArray(value) ? value[0] : value;
      }

      if (!payload.title) {
        console.error("[LessonCreateAPI] No title provided");
        return NextResponse.json(
          { error: "Lesson title is required" },
          { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }

      // Parse meta if provided
      if (payload.meta) {
        try {
          payload.meta = JSON.parse(payload.meta);
        } catch (e) {
          console.error("[LessonCreateAPI] Invalid meta JSON:", payload.meta);
          return NextResponse.json(
            { error: "Invalid meta JSON format" },
            { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
          );
        }
      }

      if (files[FILE_FIELD_NAME]) {
        const uploadedFile = Array.isArray(files[FILE_FIELD_NAME]) ? files[FILE_FIELD_NAME][0] : files[FILE_FIELD_NAME];
        file = {
          path: uploadedFile.path,
          name: uploadedFile.name,
          type: uploadedFile.type,
        };
        console.log("[LessonCreateAPI] File detected:", {
          filename: file.name,
          contentType: file.type,
          size: uploadedFile.size,
        });
        // Only set url if the API requires it as a filename
        const filePath = `/media/${moduleId}/${file.name || "uploaded_file"}`;
        payload.url = `${BASE_URL}${filePath}`;
      } else {
        console.log("[LessonCreateAPI] No file detected in FormData");
      }
    } else if (contentType.toLowerCase().includes("application/json")) {
      console.log("[LessonCreateAPI] Processing application/json");
      try {
        payload = await req.json();
      } catch (e) {
        const bodyText = await req.text();
        console.error("[LessonCreateAPI] Failed to parse JSON:", bodyText.slice(0, 200));
        return NextResponse.json(
          { error: "Invalid JSON format", details: bodyText.slice(0, 200) },
          { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
    } else {
      console.error("[LessonCreateAPI] Unsupported Content-Type:", contentType);
      return NextResponse.json(
        { error: `Unsupported Content-Type: ${contentType}, expected multipart/form-data or application/json` },
        { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    console.log("[LessonCreateAPI] Sending POST to", fullUrl, "with payload:", payload);
    const formData = new FormData();
    for (const key in payload) {
      formData.append(key, typeof payload[key] === "object" ? JSON.stringify(payload[key]) : payload[key]);
    }
    if (file) {
      const fileBuffer = await fs.readFile(file.path);
      const fileBlob = new Blob([fileBuffer], {
        type: file.type || "application/octet-stream",
      });
      formData.append(FILE_FIELD_NAME, fileBlob, file.name || "uploaded_file");
    }

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: formData,
    });

    console.log("[LessonCreateAPI] Response status:", response.status);
    console.log("[LessonCreateAPI] Response headers:", Object.fromEntries(response.headers));

    const responseContentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[LessonCreateAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[LessonCreateAPI] Fetch failed:", response.status, rawResponse.slice(0, 100));
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
        { error: "Failed to create lesson", details: rawResponse.slice(0, 100) },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!responseContentType.includes("application/json")) {
      console.error("[LessonCreateAPI] Non-JSON response received:", responseContentType);
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
      console.error("[LessonCreateAPI] Failed to parse JSON:", parseError);
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

    console.log("[LessonCreateAPI] Creation successful, data:", data);
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
    console.error("[LessonCreateAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to create lesson", details: (error as Error).message },
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