import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withNoStoreHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    ...(extra ?? {}),
  };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

function safeJsonParse(text: string) {
  try {
    return { ok: true as const, data: JSON.parse(text) };
  } catch {
    return { ok: false as const, data: null };
  }
}

export async function GET(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const lessonId = searchParams.get("lesson");

  const path = id
    ? `/api/notes/${id}/`
    : lessonId
      ? `/api/notes/?lesson=${encodeURIComponent(lessonId)}`
      : `/api/notes/`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (response.status === 401) {
        return attachSetCookie(
          NextResponse.json(
            { error: "Not authenticated" },
            { status: 401, headers: withNoStoreHeaders() }
          ),
          setCookie
        );
      }
      if (response.status === 404) {
        return attachSetCookie(
          NextResponse.json(
            { error: "Note not found" },
            { status: 404, headers: withNoStoreHeaders() }
          ),
          setCookie
        );
      }
      return attachSetCookie(
        NextResponse.json(
          { error: "Failed to fetch notes", details: text },
          { status: response.status, headers: withNoStoreHeaders() }
        ),
        setCookie
      );
    }

    if (!contentType.includes("application/json")) {
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format, expected JSON" },
          { status: 500, headers: withNoStoreHeaders() }
        ),
        setCookie
      );
    }

    const parsed = safeJsonParse(text);
    if (!parsed.ok) {
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format" },
          { status: 500, headers: withNoStoreHeaders() }
        ),
        setCookie
      );
    }

    return attachSetCookie(
      NextResponse.json(parsed.data, { status: 200, headers: withNoStoreHeaders() }),
      setCookie
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch notes", details: error?.message ?? String(error) },
      { status: 500, headers: withNoStoreHeaders() }
    );
  }
}

export async function POST(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: withNoStoreHeaders() }
    );
  }

  try {
    const body = await req.json();

    const { response, text, setCookie } = await djangoFetch(`/api/notes/`, {
      method: "POST",
      body: JSON.stringify({
        ...body,
        student: (session.user as any).id,
      }),
    });
    console.log(response, " response.... ",text)
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const parsedErr = safeJsonParse(text);
      return attachSetCookie(
        NextResponse.json(
          {
            error: "Failed to create note",
            details: parsedErr.ok ? parsedErr.data : text,
          },
          { status: response.status, headers: withNoStoreHeaders() }
        ),
        setCookie
      );
    }

    if (!contentType.includes("application/json")) {
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format, expected JSON" },
          { status: 500, headers: withNoStoreHeaders() }
        ),
        setCookie
      );
    }

    const parsed = safeJsonParse(text);
    if (!parsed.ok) {
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format" },
          { status: 500, headers: withNoStoreHeaders() }
        ),
        setCookie
      );
    }

    return attachSetCookie(
      NextResponse.json(parsed.data, { status: 201, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }),
      setCookie
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create note", details: error?.message ?? String(error) },
      { status: 500, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
    );
  }
}

export async function PATCH(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
    );
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing note id" },
        { status: 400, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
      );
    }

    const { response, text, setCookie } = await djangoFetch(`/api/notes/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        ...updates,
        student: (session.user as any).id,
      }),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const parsedErr = safeJsonParse(text);
      return attachSetCookie(
        NextResponse.json(
          {
            error: "Failed to update note",
            details: parsedErr.ok ? parsedErr.data : text,
          },
          { status: response.status, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
        ),
        setCookie
      );
    }

    if (!contentType.includes("application/json")) {
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format, expected JSON" },
          { status: 500, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
        ),
        setCookie
      );
    }

    const parsed = safeJsonParse(text);
    if (!parsed.ok) {
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format" },
          { status: 500, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
        ),
        setCookie
      );
    }

    return attachSetCookie(
      NextResponse.json(parsed.data, { status: 200, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }),
      setCookie
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update note", details: error?.message ?? String(error) },
      { status: 500, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
    );
  }
}

export async function DELETE(req: Request) {
  noStore();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
      );
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing note id" },
        { status: 400, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
      );
    }

    const { response, text, setCookie } = await djangoFetch(`/api/notes/${id}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const parsedErr = safeJsonParse(text);
      return attachSetCookie(
        NextResponse.json(
          {
            error: "Failed to delete note",
            details: parsedErr.ok ? parsedErr.data : text,
          },
          { status: response.status, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
        ),
        setCookie
      );
    }

    return attachSetCookie(
      NextResponse.json(
        { message: "Note deleted" },
        { status: 200, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
      ),
      setCookie
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete note", details: error?.message ?? String(error) },
      { status: 500, headers: withNoStoreHeaders({ "Cache-Control": "no-store" }) }
    );
  }
}
