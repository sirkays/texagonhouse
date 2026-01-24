// app/api/admin/teachers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function handleRequest(
  request: NextRequest,
  method: "GET" | "PATCH" | "DELETE",
  id: string
) {
  if (!id) {
    return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "";
  let body: BodyInit | undefined = undefined;

  if (method === "PATCH") {
    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      let jsonBody: unknown;
      try {
        jsonBody = await request.json();
      } catch {
        return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
      }
      body = JSON.stringify(jsonBody);
    }
  }

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/admin/teachers/${encodeURIComponent(id)}/`,
    {
      method,
      ...(method === "PATCH" ? { body } : {}),
    }
  );

  if (!response.ok) {
    const data = parseJsonSafely(text);
    const msg =
      data?.detail ||
      data?.error ||
      data?.message ||
      `Failed to ${method.toLowerCase()} teacher`;

    const res = NextResponse.json({ error: msg }, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  }

  if (method === "DELETE") {
    const res = new NextResponse(null, { status: 204 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  }

  const data = parseJsonSafely(text) ?? { detail: text };

  const res = NextResponse.json(data, { status: 200 });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await Promise.resolve(ctx.params);
    return await handleRequest(request, "GET", id);
  } catch (error) {
    console.error("[Teacher GET] Error fetching teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await Promise.resolve(ctx.params);
    return await handleRequest(request, "PATCH", id);
  } catch (error) {
    console.error("[Teacher PATCH] Error updating teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await Promise.resolve(ctx.params);
    return await handleRequest(request, "DELETE", id);
  } catch (error) {
    console.error("[Teacher DELETE] Error deleting teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
