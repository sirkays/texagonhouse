// app/api/<wherever-this-route-lives>/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

// (kept) You can keep these helpers if your UI uses them elsewhere.
// Note: BASE_URL/API_KEY/headers are no longer needed here.

function normalizeMedia(media: any) {
  if (!media) return null;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  // If you still want this, consider moving BASE_URL into proxy.ts and exporting it,
  // or just return cleaned and let the client build full URLs.
  return `/media/${cleaned}`;
}

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

function jsonNoStore(body: any, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      ...extraHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET(req: Request) {
  noStore();

  // Keep your strict auth behavior (same as before)
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return jsonNoStore({ error: "Not authenticated" }, 401);
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const path = `/learning/api/materials/mine/${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

    const extraHeaders: Record<string, string> = {};
    if (setCookie) extraHeaders["Set-Cookie"] = setCookie;

    if (!response.ok) {
      return jsonNoStore(
        { error: "Failed to fetch materials", details: text },
        response.status,
        extraHeaders
      );
    }

    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // If backend ever returns non-JSON, don’t crash
      data = { raw: text };
    }

    return jsonNoStore(data, 200, extraHeaders);
  } catch (error: any) {
    return jsonNoStore(
      { error: "Failed to fetch materials", details: error?.message },
      500
    );
  }
}

export async function DELETE(req: Request) {
  noStore();

  // Keep your strict auth behavior (same as before)
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return jsonNoStore({ error: "Not authenticated" }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const lesson_id = body.lesson_id ?? null;
  const material_id = body.material_id ?? null;

  if (!lesson_id && !material_id) {
    return jsonNoStore({ error: "Provide lesson_id or material_id" }, 400);
  }

  const path = "/learning/api/materials/delete/";

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "DELETE",
      body: JSON.stringify({ lesson_id, material_id }),
      // optional: you can add headers here; proxy.ts already sets JSON Content-Type
      // headers: { "Content-Type": "application/json" },
    });

    const extraHeaders: Record<string, string> = {};
    if (setCookie) extraHeaders["Set-Cookie"] = setCookie;

    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return jsonNoStore(
        { error: "Failed to delete material", details: data },
        response.status,
        extraHeaders
      );
    }

    return jsonNoStore(data, 200, extraHeaders);
  } catch (error: any) {
    return jsonNoStore(
      { error: "Failed to delete material", details: error?.message },
      500
    );
  }
}
