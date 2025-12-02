import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
//const BASE_URL = "http://127.0.0.1:9098";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const deleteEndpoint = `/api/materials/`;

function normalizeMedia(media) {
  if (!media) return null;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  return `${BASE_URL}/media/${cleaned}`;
}

// Helpers to normalize server response into the shape your UI expects
function toNumber(n: any) {
  const x = typeof n === "string" ? parseInt(n, 10) : n;
  return Number.isFinite(x) ? x : undefined;
}

function normalizeNote(note: any) {
  return {
    id: toNumber(note.id),
    title: note.title ?? `Lesson ${note.lesson ?? ""}`,
    student: toNumber(note.student ?? note.userId ?? note.user),
    lesson: toNumber(note.lesson),
    content: note.content ?? "",
    is_private: note.is_private ?? note.isPrivate ?? true,
    created_at: note.created_at ?? note.createdAt ?? new Date().toISOString(),
    updated_at: note.updated_at ?? note.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeBookmark(b: any) {
  return {
    id: toNumber(b.id),
    student: toNumber(b.student ?? b.userId),
    lessonId: toNumber(b.lessonId ?? b.lesson_id ?? b.lesson),
    lessonTitle:
      b.lessonTitle ??
      b.title ??
      (b.lessonId ? `Lesson ${b.lessonId}` : "Unknown Lesson"),
    note: b.note ?? b.text ?? "",
    position_seconds: b.position_seconds ?? b.positionSeconds ?? 0,
    created_at: b.created_at ?? b.createdAt ?? new Date().toISOString(),
    updated_at: b.updated_at ?? b.updatedAt ?? new Date().toISOString(),
  };
}

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req) {
  noStore();
  const endpoint = "/learning/api/materials/mine/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[Materials API] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Materials API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Materials API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
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
    console.log("[Materials API] Fetching from", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[Materials API] Fetch response status:", response.status);
    console.log("[Materials API] Fetch response headers:", Object.fromEntries(response.headers));
    console.log("[Materials API] Fetch response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[Materials API] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[Materials API] Fetch failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
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
          { error: "Materials endpoint not found" },
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
        { error: "Failed to fetch materials" },
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
      console.error("[Materials API] Non-JSON response received:", contentType);
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
      console.error("[Materials API] Failed to parse JSON:", parseError);
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

    const normalizedData = {
      ...data,
      saved: {
        ...data.saved,
        videos: data.saved.videos.map((video) => ({
          ...video,
          thumbnail: normalizeMedia(video.thumbnail) || "/placeholder.svg?height=120&width=200&text=Video+Thumbnail",
          videoUrl: normalizeMedia(video.videoUrl) || "/sample-video.mp4",
        })),
        pdfs: data.saved.pdfs.map((pdf) => ({
          ...pdf,
          downloadUrl: normalizeMedia(pdf.downloadUrl) || "/sample.pdf",
        })),
        audio: data.saved.audio.map((audio) => ({
          ...audio,
          audioUrl: normalizeMedia(audio.audioUrl) || "/sample-audio.mp3",
        })),
      },

    // NEW: normalize notes and bookmarks to snake_case & correct types
    notes: (data.notes ?? []).map(normalizeNote),
    bookmarks: (data.bookmarks ?? []).map(normalizeBookmark),
    };

    console.log("[Materials API] Fetch successful, normalized data:", normalizedData);
    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[Materials API] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials", details: error.message },
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



export async function DELETE(req: Request) {
  noStore();
  const { id } = await req.json();
  const fullUrl = `${BASE_URL}${deleteEndpoint}${id}`;
  console.log("[Notes API] Initiating DELETE to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[Notes API] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user
      ? { id: session.user.id, role: session.user.role }
      : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Notes API] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
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
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
    });

    console.log("[Notes API] DELETE response status:", response.status);
    const rawResponse = await response.text();
    console.log(
      "[Notes API] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[Notes API] DELETE failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      let errorData;
      try {
        errorData = JSON.parse(rawResponse);
      } catch {
        errorData = { error: "Invalid response format" };
      }
      return NextResponse.json(
        { error: "Failed to delete note", details: errorData },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log("[Notes API] DELETE successful");
    return NextResponse.json(
      { message: "Note deleted" },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[Notes API] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete note", details: error.message },
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
