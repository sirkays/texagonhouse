import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
//const BASE_URL = "http://127.0.0.1:9098";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
const deleteEndpoint = `/api/materials/`;

function normalizeMedia(media:any) {
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

const headers = (sessionToken: any) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});


export async function GET(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const endpoint = "/learning/api/materials/mine/";
  const fullUrl = `${BASE_URL}${endpoint}${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: headers(session.user.sessionToken),
  });

  const raw = await response.text();

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch materials", details: raw },
      { status: response.status }
    );
  }

  const data = raw ? JSON.parse(raw) : {};
  return NextResponse.json(data, { status: 200 });
}


export async function DELETE(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const lesson_id = body.lesson_id ?? null;
  const material_id = body.material_id ?? null;

  if (!lesson_id && !material_id) {
    return NextResponse.json(
      { error: "Provide lesson_id or material_id" },
      { status: 400 }
    );
  }

  const endpoint = "/learning/api/materials/delete/";
  const fullUrl = `${BASE_URL}${endpoint}`;

  try {
    // We send JSON body (backend supports it), safest.
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify({
        lesson_id,
        material_id,
      }),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete material", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete material", details: error?.message },
      { status: 500 }
    );
  }
}



