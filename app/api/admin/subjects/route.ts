import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

// GET: List all subjects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") ?? "";
    const page = searchParams.get("page") ?? "1";
    const page_size = searchParams.get("page_size") ?? "20";
    const org_id = searchParams.get("org_id");

    const query = new URLSearchParams();
    if (q.trim()) query.set("q", q.trim());
    query.set("page", page);
    query.set("page_size", page_size);
    if (org_id) query.set("org_id", org_id);

    const path = `/orgs/api/subjects/?${query.toString()}`;

    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

    const data = parseJsonSafely(text) ?? { detail: text };

    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Subjects GET] Error listing subjects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create subject
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { response, text, setCookie } = await djangoFetch(`/orgs/api/subjects/`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = parseJsonSafely(text) ?? { detail: text };

    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Subjects POST] Error creating subject:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
