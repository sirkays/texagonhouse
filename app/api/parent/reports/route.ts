import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";
const API_KEY = process.env.STORE_API_KEY || "WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8";

async function proxyPublic(path: string, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    Authorization: `Api-Key ${API_KEY}`,
    Accept: "application/json",
  };
  if (init.body && typeof init.body === "string") {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> || {}) },
    cache: "no-store",
  });
  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return NextResponse.json(
    response.ok ? data : { error: data?.error ?? "Failed", detail: data?.detail, details: data },
    { status: response.status }
  );
}

async function getSessionToken(request: NextRequest): Promise<string | undefined> {
  const tokenSession = await getToken({
    req: request,
    secret: process.env.SECRET_KEY,
  });
  return (tokenSession as any)?.sessionToken as string | undefined;
}

// GET /api/parent/reports           → list all reports for parent (my-reports)
// GET /api/parent/reports?token=xxx → fetch specific report by share token (authenticated parent)
export async function GET(request: NextRequest) {
  const shareToken = request.nextUrl.searchParams.get("token");
  const sessionToken = await getSessionToken(request);

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const authHeaders = { "X-Session-Token": sessionToken };

  if (shareToken) {
    // Fetch a specific report by its share token for the authenticated parent
    // Optional: student_id to view a specific child's data within the same report
    const studentId = request.nextUrl.searchParams.get("student_id");
    const qs = studentId ? `?student_id=${encodeURIComponent(studentId)}` : "";
    return proxyPublic(`/academics/api/report/parent/${shareToken}/${qs}`, {
      headers: authHeaders,
    });
  }

  // List all reports for the authenticated parent
  return proxyPublic(`/academics/api/my-reports/`, {
    headers: authHeaders,
  });
}

// POST /api/parent/reports?token=xxx               → verify student credentials (public)
// POST /api/parent/reports?token=xxx&action=parent-setup → create parent account (public)
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const action = request.nextUrl.searchParams.get("action");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const body = await request.json();

  // For public flows, session token is optional
  const sessionToken = await getSessionToken(request);
  const extraHeaders: Record<string, string> = {};
  if (sessionToken) {
    extraHeaders["X-Session-Token"] = sessionToken;
  }

  if (action === "parent-setup") {
    return proxyPublic(`/academics/api/report/public/${token}/parent-setup/`, {
      method: "POST",
      headers: extraHeaders,
      body: JSON.stringify(body),
    });
  }

  // Default: verify student credentials
  return proxyPublic(`/academics/api/report/public/${token}/verify/`, {
    method: "POST",
    headers: extraHeaders,
    body: JSON.stringify(body),
  });
}
