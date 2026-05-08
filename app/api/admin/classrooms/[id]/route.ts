// app/api/admin/classrooms/[id]/route.ts
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

// GET /api/admin/classrooms/:id — Retrieve a single classroom
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<Params> }
) {
  const { id } = await ctx.params;

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/classrooms/${id}/`,
    { method: "GET" }
  );

  const data = tryJson(text) ?? { detail: text };

  if (!response.ok) {
    return attachSetCookie(
      NextResponse.json(
        { detail: (data as any)?.detail || "Failed to fetch classroom." },
        { status: response.status }
      ),
      setCookie
    );
  }

  return attachSetCookie(NextResponse.json(data), setCookie);
}

// PATCH /api/admin/classrooms/:id — Update a classroom
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<Params> }
) {
  const { id } = await ctx.params;

  const body = await request.json();

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/classrooms/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );

  const data = tryJson(text) ?? { detail: text };

  if (!response.ok) {
    return attachSetCookie(
      NextResponse.json(
        { detail: (data as any)?.detail || "Failed to update classroom." },
        { status: response.status }
      ),
      setCookie
    );
  }

  return attachSetCookie(NextResponse.json(data), setCookie);
}

// DELETE /api/admin/classrooms/:id — Delete a classroom
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<Params> }
) {
  const { id } = await ctx.params;

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/classrooms/${id}/`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    const data = tryJson(text) ?? { detail: text };
    return attachSetCookie(
      NextResponse.json(
        { detail: (data as any)?.detail || "Failed to delete classroom." },
        { status: response.status }
      ),
      setCookie
    );
  }

  // 204 No Content — return empty success
  if (response.status === 204) {
    return attachSetCookie(
      new NextResponse(null, { status: 204 }),
      setCookie
    );
  }

  const data = tryJson(text) ?? { detail: "Deleted." };
  return attachSetCookie(NextResponse.json(data), setCookie);
}
