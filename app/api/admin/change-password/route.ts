// app/api/admin/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function tryJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

function attachCookie(res: NextResponse, cookie?: string) {
  if (cookie) res.headers.set("set-cookie", cookie);
  return res;
}

// GET /api/admin/change-password/users?q=... — list org users
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);

  const path = `/core/api/admin/change-password/users/${qs.toString() ? `?${qs}` : ""}`;
  const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

  const data = tryJson(text) ?? { detail: text };
  return attachCookie(
    NextResponse.json(data, { status: response.status }),
    setCookie
  );
}

// POST /api/admin/change-password — change a user's password
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { response, text, setCookie } = await djangoFetch(
    "/core/api/admin/change-password/",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const data = tryJson(text) ?? { detail: text };
  return attachCookie(
    NextResponse.json(data, { status: response.status }),
    setCookie
  );
}
