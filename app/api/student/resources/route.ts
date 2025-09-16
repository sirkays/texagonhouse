import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

function normalizeMedia(media) {
  if (!media) return null;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  return `${BASE_URL}/media/${cleaned}`;
}

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req) {
  noStore();
  const endpoint = "/learning/api/academics/resources/";
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course_id");
  const moduleId = searchParams.get("module_id");
  const query = searchParams.get("q");

  console.log("[ResourcesRoute] Initiating fetch for:", endpoint);

  const session = await getServerSession(authOptions);
  console.log("[ResourcesRoute] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[ResourcesRoute] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  const queryParams = new URLSearchParams();
  if (query) queryParams.append("q", query);
  if (moduleId) queryParams.append("module_id", moduleId);

  // Default to first course if no course_id is provided
  if (!courseId) {
    // Fetch available courses to get the first course ID
    try {
      const coursesResponse = await fetch(`${BASE_URL}/learning/api/academics/courses/`, {
        method: "GET",
        headers: headers(session.user.sessionToken),
      });
      if (!coursesResponse.ok) {
        console.error("[ResourcesRoute] Failed to fetch courses:", coursesResponse.status);
        throw new Error("Failed to fetch courses");
      }
      const coursesData = await coursesResponse.json();
      const firstCourseId = coursesData.courses?.[0]?.id;
      if (firstCourseId) {
        queryParams.append("course_id", firstCourseId.toString());
        console.log("[ResourcesRoute] No course_id provided, using first course ID:", firstCourseId);
      } else {
        console.log("[ResourcesRoute] No courses found, proceeding without course_id");
      }
    } catch (error) {
      console.error("[ResourcesRoute] Error fetching courses:", error);
      // Proceed without course_id if courses cannot be fetched
    }
  } else {
    queryParams.append("course_id", courseId);
  }

  const fullUrl = `${BASE_URL}${endpoint}?${queryParams}`;
  console.log("[ResourcesRoute] Query parameters:", queryParams.toString());
  console.log("[ResourcesRoute] Full URL:", fullUrl);

  try {
    console.log("[ResourcesRoute] Fetching from", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[ResourcesRoute] Fetch response status:", response.status);
    console.log("[ResourcesRoute] Fetch response headers:", Object.fromEntries(response.headers));
    console.log("[ResourcesRoute] Fetch response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[ResourcesRoute] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[ResourcesRoute] Fetch failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Resources endpoint not found" },
          { status: 404, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch resources" },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[ResourcesRoute] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[ResourcesRoute] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    const normalizedData = {
      ...data,
      pdfs: data.pdfs.map((pdf) => ({
        ...pdf,
        pdfUrl: normalizeMedia(pdf.pdfUrl),
      })),
      videos: data.videos.map((video) => ({
        ...video,
        videoUrl: normalizeMedia(video.videoUrl),
      })),
      audio: data.audio.map((audio) => ({
        ...audio,
        audioUrl: normalizeMedia(audio.audioUrl),
      })),
      journals: data.journals.map((journal) => ({
        ...journal,
        url: journal.url ? normalizeMedia(journal.url) : null,
      })),
    };

    console.log("[ResourcesRoute] Fetch successful, normalized data:", normalizedData);
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
    console.error("[ResourcesRoute] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}