import { NextResponse, NextRequest } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";
const API_KEY = process.env.STORE_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

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
  return NextResponse.json(response.ok ? data : { error: data?.error ?? "Failed", details: data }, { status: response.status });
}

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = await params;
  return proxyPublic(`/academics/api/report/public/${token}/`);
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = await params;
  const body = await request.json();
  const action = request.nextUrl.searchParams.get("action");

  if (action === "parent-setup") {
    return proxyPublic(`/academics/api/report/public/${token}/parent-setup/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Default: verify student
  return proxyPublic(`/academics/api/report/public/${token}/verify/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
