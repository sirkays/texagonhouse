import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";
import formidable from "formidable-serverless";
import fs from "fs/promises";
//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const FILE_FIELD_NAME = "file";
const COVER_IMAGE_FIELD_NAME = "cover_image";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export async function PATCH(
  req: NextRequest,
  context: {params: Promise<{id: string; lessonId: string}>}
) {
  noStore();
  const params = await context.params;
  const moduleId = params.id;
  const lessonId = params.lessonId;
  const endpoint = `/learning/api/teacher/modules/${moduleId}/lessons/${lessonId}/`;

  const fullUrl = `${BASE_URL}${endpoint}`;

  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/auth/signin"},
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  let file: {path: string; name: string | null; type: string | null} | null =
    null;
  let coverImageFile: {
    path: string;
    name: string | null;
    type: string | null;
  } | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      console.error("[LessonUpdateAPI] Unsupported Content-Type:", contentType);
      return NextResponse.json(
        {
          error: `Unsupported Content-Type: ${contentType}, expected multipart/form-data`,
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

    const form = formidable({multiples: false, keepExtensions: true});
    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      req
        .arrayBuffer()
        .then(async (buffer) => {
          const readableStream = new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(buffer));
              controller.close();
            },
          });
          const nodeStream = require("stream").Readable.fromWeb(readableStream);
          nodeStream.headers = {
            "content-type": contentType,
            "content-length":
              req.headers.get("content-length") || buffer.byteLength.toString(),
          };
          form.parse(nodeStream, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
          });
        })
        .catch(reject);
    });

    // Convert formidable fields to payload
    const payload: any = {};
    for (const key in fields) {
      const value = fields[key];
      payload[key] = Array.isArray(value) ? value[0] : value;
    }

    // Validate required fields
    if (!payload.title || !payload.type || !payload.duration) {
      console.error("[LessonUpdateAPI] Missing required fields:", {
        title: !!payload.title,
        type: !!payload.type,
        duration: !!payload.duration,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, type, and duration are required",
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

    // Validate duration
    if (payload.duration === "0" || isNaN(parseInt(payload.duration))) {
      console.error("[LessonUpdateAPI] Invalid duration:", payload.duration);
      return NextResponse.json(
        {error: "Duration must be a valid non-zero number"},
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Parse meta if provided
    if (payload.meta) {
      try {
        payload.meta = JSON.parse(payload.meta);
      } catch (e) {
        console.error("[LessonUpdateAPI] Invalid meta JSON:", payload.meta);
        return NextResponse.json(
          {error: "Invalid meta JSON format"},
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
    }

    // Handle main file
    if (files[FILE_FIELD_NAME]) {
      const uploadedFile = Array.isArray(files[FILE_FIELD_NAME])
        ? files[FILE_FIELD_NAME][0]
        : files[FILE_FIELD_NAME];
      file = {
        path: uploadedFile.path,
        name: uploadedFile.name,
        type: uploadedFile.type,
      };
      delete payload.remove_file; // Clear remove_file if new file is uploaded
    }

    // Handle cover image
    if (files[COVER_IMAGE_FIELD_NAME]) {
      const uploadedCover = Array.isArray(files[COVER_IMAGE_FIELD_NAME])
        ? files[COVER_IMAGE_FIELD_NAME][0]
        : files[COVER_IMAGE_FIELD_NAME];
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(uploadedCover.type || "")) {
        console.error(
          "[LessonUpdateAPI] Invalid cover image type:",
          uploadedCover.type
        );
        await fs.unlink(uploadedCover.path).catch(console.error);
        return NextResponse.json(
          {
            error:
              "Invalid cover image type. Only JPEG, PNG, or GIF are allowed.",
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
      coverImageFile = {
        path: uploadedCover.path,
        name: uploadedCover.name,
        type: uploadedCover.type,
      };
      delete payload.remove_cover; // Clear remove_cover if new cover image is uploaded
    } else if (payload.remove_cover === "true") {
      console.log("[LessonUpdateAPI] Remove cover flag set");
    }

    // Create FormData for upstream API
    const formData = new FormData();
    for (const key in payload) {
      formData.append(
        key,
        typeof payload[key] === "object"
          ? JSON.stringify(payload[key])
          : payload[key]
      );
    }

    if (file) {
      const fileBuffer = await fs.readFile(file.path);
      const fileBlob = new Blob([fileBuffer], {
        type: file.type || "application/octet-stream",
      });
      formData.append(FILE_FIELD_NAME, fileBlob, file.name || "uploaded_file");
    }

    if (coverImageFile) {
      const coverBuffer = await fs.readFile(coverImageFile.path);
      const coverBlob = new Blob([coverBuffer], {
        type: coverImageFile.type || "image/jpeg",
      });
      formData.append(
        COVER_IMAGE_FIELD_NAME,
        coverBlob,
        coverImageFile.name || "cover_image.jpg"
      );
    }

    // Log FormData contents
    for (const [key, value] of formData.entries()) {
      console.log(
        `[LessonUpdateAPI] ${key}:`,
        typeof value === "string" ? value : `[File: ${value.name}]`
      );
    }

    // Send request to upstream API
    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: headers(session.user.sessionToken),
      body: formData,
    });

    const responseContentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    // Clean up temp files
    if (file) await fs.unlink(file.path).catch(console.error);
    if (coverImageFile)
      await fs.unlink(coverImageFile.path).catch(console.error);

    if (!response.ok) {
      console.error(
        "[LessonUpdateAPI] Upstream fetch failed:",
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
      if (response.status === 404) {
        return NextResponse.json(
          {error: `Lesson with ID ${lessonId} not found in module ${moduleId}`},
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch (e) {
        console.error(
          "[LessonUpdateAPI] Failed to parse error response:",
          rawResponse.slice(0, 100)
        );
      }
      return NextResponse.json(
        {
          error: "Failed to update lesson",
          details: errorData || rawResponse.slice(0, 100),
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

    if (!responseContentType.includes("application/json")) {
      console.error(
        "[LessonUpdateAPI] Non-JSON response received:",
        responseContentType
      );
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
      console.error(
        "[LessonUpdateAPI] Failed to parse JSON response:",
        parseError
      );
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

    // Normalize cover_image path
    let normalizedCoverImage = data.lesson.cover_image;
    if (
      data.lesson.cover_image &&
      !data.lesson.cover_image.startsWith("/media/covers/")
    ) {
      console.warn(
        "[LessonUpdateAPI] Normalizing cover_image path from:",
        data.lesson.cover_image
      );
      normalizedCoverImage = data.lesson.cover_image.replace(
        "/media/",
        "/media/covers/"
      );
      data.lesson.cover_image = normalizedCoverImage;
    }

    // Verify cover_image in response
    if (coverImageFile && !data.lesson.cover_image) {
      console.warn(
        "[LessonUpdateAPI] Cover image uploaded but not returned in response:",
        data.lesson
      );
    } else if (payload.remove_cover === "true" && data.lesson.cover_image) {
      console.warn(
        "[LessonUpdateAPI] Remove cover requested but cover_image still present:",
        data.lesson.cover_image
      );
    }

    // Follow-up GET to verify upstream state
    const moduleEndpoint = `/learning/api/teacher/modules/${moduleId}/`;
    const moduleFullUrl = `${BASE_URL}${moduleEndpoint}?t=${Date.now()}`;
    const getResponse = await fetch(moduleFullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });
    const getRawResponse = await getResponse.text();

    let getData;
    try {
      getData = JSON.parse(getRawResponse);
    } catch (e) {
      console.error(
        "[LessonUpdateAPI] Failed to parse GET response:",
        getRawResponse.slice(0, 100)
      );
    }

    if (getData?.module?.lessons) {
      const updatedLesson = getData.module.lessons.find(
        (lesson: any) => lesson.id === parseInt(lessonId)
      );
      if (
        updatedLesson &&
        coverImageFile &&
        updatedLesson.cover_image !== normalizedCoverImage
      ) {
        console.warn(
          "[LessonUpdateAPI] Mismatch in GET response cover_image:",
          updatedLesson.cover_image,
          "expected:",
          normalizedCoverImage
        );
      }
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[LessonUpdateAPI] Fetch error:", error);
    if (file) await fs.unlink(file.path).catch(console.error);
    if (coverImageFile)
      await fs.unlink(coverImageFile.path).catch(console.error);
    return NextResponse.json(
      {error: "Failed to update lesson", details: (error as Error).message},
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
