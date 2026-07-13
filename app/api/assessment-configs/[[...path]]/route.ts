import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch, djangoFetchRaw } from "@/app/api/_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Params = { params: Promise<{ path?: string[] }> };

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

async function proxy(req: Request, pathSegs?: string[]) {
  noStore();

  let path = pathSegs?.join("/") || "";
  if (path && !path.endsWith("/")) path += "/";

  const backendPath = `/api/assessment-configs/${path}`;

  try {
    let bodyData: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        bodyData = await req.json();
      } else {
        bodyData = await req.text();
      }
    }

    const { response, text, setCookie } = await djangoFetch(backendPath, {
      method: req.method,
      body: bodyData ? JSON.stringify(bodyData) : undefined,
    });

    if (!response.ok) {
      const errData = safeJsonParse(text);
      return attachSetCookie(
        NextResponse.json({ detail: errData?.detail || text }, { status: response.status }),
        setCookie
      );
    }

    const data = safeJsonParse(text);
    return attachSetCookie(NextResponse.json(data ?? {}), setCookie);
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: Params) { const p = await params; return proxy(req, p?.path); }
export async function POST(req: Request, { params }: Params) { const p = await params; return proxy(req, p?.path); }
export async function PATCH(req: Request, { params }: Params) { const p = await params; return proxy(req, p?.path); }
export async function PUT(req: Request, { params }: Params) { const p = await params; return proxy(req, p?.path); }
export async function DELETE(req: Request, { params }: Params) { const p = await params; return proxy(req, p?.path); }
