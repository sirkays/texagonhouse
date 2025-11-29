import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://texagonbackend.onrender.com";
const API_KEY = process.env.API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

type Params = { params: { path?: string[] } };

async function proxy(req: Request, pathSegs?: string[]) {
  noStore();

  // Auth
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Build path with DRF slashes
  let path = pathSegs?.join("/") || "";
  if (req.method === "GET" && !path) path = "list/";
  if (path && !path.endsWith("/")) path += "/";

  const backendUrl = `${BASE_URL}/billing/api/complaints/${path}`;

  // Base headers
  const headers: Record<string, string> = {
    Authorization: `Api-Key ${API_KEY}`,
    "X-Session-Token": String(sessionToken),
  };

  // Decide how to buffer/forward the body (avoid chunked transfer)
  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const reqCt = req.headers.get("content-type")?.toLowerCase() || "";

  let body: BodyInit | undefined;

  if (hasBody) {
    if (reqCt.startsWith("multipart/form-data")) {
      // Parse formdata, forward as FormData (fetch sets boundary + content-length)
      const form = await req.formData();
      body = form;
      // DO NOT set Content-Type for multipart; fetch will set the correct boundary.
    } else if (reqCt.includes("application/json")) {
      const text = await req.text();
      body = text;
      headers["Content-Type"] = "application/json";
    } else if (reqCt.includes("text/")) {
      const text = await req.text();
      body = text;
      headers["Content-Type"] = reqCt;
    } else if (reqCt) {
      // Binary or other content types: send as ArrayBuffer and preserve content-type
      const buf = await req.arrayBuffer();
      body = Buffer.from(buf);
      headers["Content-Type"] = reqCt;
    } else {
      // No content-type provided—still consume to a buffer to avoid chunked
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) {
        body = Buffer.from(buf);
      }
    }
  }

  // Build RequestInit (no duplex needed since we're not streaming)
  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
    body,
  };

  const response = await fetch(backendUrl, init);

  // Read backend response
  const raw = await response.text();
  const respCT = response.headers.get("content-type") || "";

  if (!response.ok) {
    return NextResponse.json(
      { error: `Backend returned ${response.status}`, details: raw },
      { status: response.status }
    );
  }

  if (respCT.includes("application/json")) {
    try {
      return NextResponse.json(JSON.parse(raw), { status: response.status });
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from backend", details: raw.slice(0, 300) },
        { status: 502 }
      );
    }
  }

  return new NextResponse(raw, {
    status: response.status,
    headers: { "Content-Type": respCT || "text/plain; charset=utf-8" },
  });
}

export async function GET(req: Request, { params }: Params) {
  return proxy(req, params.path);
}
export async function POST(req: Request, { params }: Params) {
  return proxy(req, params.path);
}
export async function PATCH(req: Request, { params }: Params) {
  return proxy(req, params.path);
}
export async function DELETE(req: Request, { params }: Params) {
  return proxy(req, params.path);
}
