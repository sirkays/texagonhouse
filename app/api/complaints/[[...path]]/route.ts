// app/api/complaints/[[...path]]/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch, djangoFetchRaw } from "@/app/api/_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Params = { params: { path?: string[] } };

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

async function proxy(req: Request, pathSegs?: string[]) {
  noStore();

  // Build path with DRF slashes
  let path = pathSegs?.join("/") || "";
  if (req.method === "GET" && !path) path = "list/";
  if (path && !path.endsWith("/")) path += "/";

  // djangoFetch BASE_URL already points to your backend, so we pass only the relative path.
  const backendPath = `/billing/api/complaints/${path}`;

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const reqCt = req.headers.get("content-type")?.toLowerCase() || "";

  // Decide how to buffer/forward the body (avoid chunked transfer)
  let body: BodyInit | undefined;

  if (hasBody) {
    if (reqCt.startsWith("multipart/form-data")) {
      // forward as FormData (fetch sets boundary)
      const form = await req.formData();
      body = form;
    } else if (reqCt.includes("application/json")) {
      // keep JSON as text; proxy.ts sets Content-Type: application/json (unless FormData)
      body = await req.text();
    } else if (reqCt.includes("text/")) {
      body = await req.text();
    } else if (reqCt) {
      // Binary or other types
      const buf = await req.arrayBuffer();
      body = Buffer.from(buf);
    } else {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) body = Buffer.from(buf);
    }
  }

  // If we have a body and it’s not JSON or multipart, use djangoFetchRaw
  // because djangoFetch defaults Content-Type: application/json unless FormData.
  const isMultipart = reqCt.startsWith("multipart/form-data");
  const isJson = reqCt.includes("application/json");
  const useRaw = hasBody && !isMultipart && !isJson;

  const t = withTimeout(20000);

  try {
    const result = useRaw
      ? await djangoFetchRaw(backendPath, {
          method,
          signal: t.signal,
          body,
          // preserve original Content-Type for non-json bodies
          headers: reqCt
            ? { "Content-Type": req.headers.get("content-type") as string }
            : {},
        })
      : await djangoFetch(backendPath, {
          method,
          signal: t.signal,
          body,
          // proxy.ts handles headers/session/cookies
        });

    const response = result.response;
    const respCT = response.headers.get("content-type") || "";

    // IMPORTANT: djangoFetch/djangoFetchRaw already read the body into result.text
    const raw = result.text;

    if (!response.ok) {
      const res = NextResponse.json(
        { error: `Backend returned ${response.status}`, details: raw },
        { status: response.status }
      );
      return attachSetCookie(res, result.setCookie);
    }

    if (respCT.includes("application/json")) {
      const parsed = safeJsonParse(raw);

      if (parsed === null && raw) {
        const res = NextResponse.json(
          { error: "Invalid JSON from backend", details: raw.slice(0, 300) },
          { status: 502 }
        );
        return attachSetCookie(res, result.setCookie);
      }

      const res = NextResponse.json(parsed, { status: response.status });
      return attachSetCookie(res, result.setCookie);
    }

    const res = new NextResponse(raw, {
      status: response.status,
      headers: { "Content-Type": respCT || "text/plain; charset=utf-8" },
    });
    return attachSetCookie(res, result.setCookie);
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: err?.message || String(err),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
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