import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withForwardedCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

async function handleRequest(
  request: NextRequest,
  method: "GET" | "PATCH" | "DELETE",
  id: string
) {
  const contentType = request.headers.get("content-type") || "";
  let init: RequestInit = { method };

  // PATCH: optional body (json or multipart)
  if (method === "PATCH") {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      init = { ...init, body: formData };
      // IMPORTANT: don't set Content-Type manually for FormData
    } else {
      const jsonBody = await request.json();
      init = {
        ...init,
        body: JSON.stringify(jsonBody),
        headers: { "Content-Type": "application/json" },
      };
    }
  }

  const { response, text, setCookie } = await djangoFetch(
    `/orgs/api/parents/${id}/`,
    init
  );

  if (!response.ok) {
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // ignore parse errors
    }

    const errMsg =
      data?.detail ||
      data?.error ||
      `Failed to ${method.toLowerCase()} parent`;

    return withForwardedCookie(
      NextResponse.json({ error: errMsg }, { status: response.status }),
      setCookie
    );
  }

  if (method === "DELETE") {
    return withForwardedCookie(new NextResponse(null, { status: 204 }), setCookie);
  }

  // GET/PATCH should return JSON
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return withForwardedCookie(NextResponse.json(data), setCookie);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await handleRequest(request, "GET", id);
  } catch (error) {
    console.error("[Route] Error fetching parent:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await handleRequest(request, "PATCH", id);
  } catch (error) {
    console.error("[Route] Error updating parent:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await handleRequest(request, "DELETE", id);
  } catch (error) {
    console.error("[Route] Error deleting parent:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
