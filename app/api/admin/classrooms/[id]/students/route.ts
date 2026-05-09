// app/api/admin/classrooms/[id]/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function tryJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

type Params = { id: string };

// GET /api/admin/classrooms/:id/students — list enrolled + available students
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<Params> }
) {
  const { id } = await ctx.params;

  // Forward search query param if present
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/classrooms/${id}/students/${qs}`,
    { method: "GET" }
  );

  const data = tryJson(text) ?? { detail: text };

  if (!response.ok) {
    return attachSetCookie(
      NextResponse.json(
        { detail: (data as any)?.detail || "Failed to fetch students." },
        { status: response.status }
      ),
      setCookie
    );
  }

  return attachSetCookie(NextResponse.json(data), setCookie);
}

// POST /api/admin/classrooms/:id/students — bulk add/remove students
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<Params> }
) {
  const { id } = await ctx.params;

  const body = await request.json();

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/classrooms/${id}/students/bulk-update/`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const data = tryJson(text) ?? { detail: text };

  if (!response.ok) {
    return attachSetCookie(
      NextResponse.json(
        { detail: (data as any)?.detail || "Failed to update students." },
        { status: response.status }
      ),
      setCookie
    );
  }

  return attachSetCookie(NextResponse.json(data), setCookie);
}
