import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

const NO_STORE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

function safeJsonParse<T = any>(raw: string): { ok: true; data: T } | { ok: false } {
  try {
    if (!raw) return { ok: true, data: null as any };
    return { ok: true, data: JSON.parse(raw) as T };
  } catch {
    return { ok: false };
  }
}

function normalizeBookmark(b: any) {
  if (!b || typeof b !== "object") return b;
  return { ...b, lessonId: b.lesson, lesson: undefined };
}

function normalizeBookmarkList(list: any) {
  if (!Array.isArray(list)) return list;
  return list.map(normalizeBookmark);
}

const endpoint = "/api/bookmarks/";

// -------------------------
// GET
// -------------------------
export async function GET(_req: Request) {
  noStore();

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, { method: "GET" });
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error("[Bookmarks API] Fetch failed:", response.status, (text || "").slice(0, 100));

      if (response.status === 401) {
        const res = NextResponse.json({ error: "Session expired" }, { status: 401, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } });
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 403) {
        const res = NextResponse.json(
          { error: "Forbidden: No student profile" },
          { status: 403, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Bookmarks endpoint not found" },
          { status: 404, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to fetch bookmarks" },
        { status: response.status, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[Bookmarks API] Non-JSON response received:", contentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const parsed = safeJsonParse<any>(text);
    if (!parsed.ok) {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const normalizedData = normalizeBookmarkList(parsed.data);

    const res = NextResponse.json(normalizedData, { status: 200, headers: NO_STORE_HEADERS });
    return attachSetCookie(res, setCookie);
  } catch (error: any) {
    console.error("[Bookmarks API] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks", details: error?.message },
      { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
    );
  }
}

// -------------------------
// POST
// -------------------------
export async function POST(req: Request) {
  noStore();

  let body: any;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message },
      { status: 400, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
    );
  }

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error("[Bookmarks API] POST failed:", response.status, (text || "").slice(0, 100));

      const parsedErr = safeJsonParse<any>(text);
      const errPayload = parsedErr.ok && parsedErr.data ? parsedErr.data : { error: "Invalid response format" };

      const res = NextResponse.json(errPayload, {
        status: response.status,
        headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" },
      });
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[Bookmarks API] Non-JSON response received:", contentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const parsed = safeJsonParse<any>(text);
    if (!parsed.ok) {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const normalizedData = normalizeBookmark(parsed.data);

    const res = NextResponse.json(normalizedData, { status: 201, headers: NO_STORE_HEADERS });
    return attachSetCookie(res, setCookie);
  } catch (error: any) {
    console.error("[Bookmarks API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark", details: error?.message },
      { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
    );
  }
}

// -------------------------
// PATCH
// -------------------------
export async function PATCH(req: Request) {
  noStore();

  let body: any;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message },
      { status: 400, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
    );
  }

  try {
    const { response, text, setCookie } = await djangoFetch(`${endpoint}${body.id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        lesson: body.lesson,
        note: body.note,
        position_seconds: body.position_seconds,
      }),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error("[Bookmarks API] PATCH failed:", response.status, (text || "").slice(0, 100));

      const parsedErr = safeJsonParse<any>(text);
      const errPayload = parsedErr.ok && parsedErr.data ? parsedErr.data : { error: "Invalid response format" };

      const res = NextResponse.json(errPayload, {
        status: response.status,
        headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" },
      });
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[Bookmarks API] Non-JSON response received:", contentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const parsed = safeJsonParse<any>(text);
    if (!parsed.ok) {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const normalizedData = normalizeBookmark(parsed.data);

    const res = NextResponse.json(normalizedData, { status: 200, headers: NO_STORE_HEADERS });
    return attachSetCookie(res, setCookie);
  } catch (error: any) {
    console.error("[Bookmarks API] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark", details: error?.message },
      { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
    );
  }
}

// -------------------------
// DELETE
// -------------------------
export async function DELETE(req: Request) {
  noStore();

  let body: any;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message },
      { status: 400, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
    );
  }

  try {
    const { response, text, setCookie } = await djangoFetch(`${endpoint}${body.id}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      console.error("[Bookmarks API] DELETE failed:", response.status, (text || "").slice(0, 100));

      const parsedErr = safeJsonParse<any>(text);
      const errPayload = parsedErr.ok && parsedErr.data ? parsedErr.data : { error: "Invalid response format" };

      const res = NextResponse.json(errPayload, {
        status: response.status,
        headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" },
      });
      return attachSetCookie(res, setCookie);
    }

    const res = NextResponse.json(
      { message: "Bookmark deleted successfully" },
      { status: 200, headers: NO_STORE_HEADERS }
    );
    return attachSetCookie(res, setCookie);
  } catch (error: any) {
    console.error("[Bookmarks API] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark", details: error?.message },
      { status: 500, headers: { ...NO_STORE_HEADERS, "Cache-Control": "no-store" } }
    );
  }
}
