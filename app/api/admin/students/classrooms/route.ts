// app/api/classrooms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // NOTE: this endpoint is NOT under /orgs
    const path = queryString ? `/api/classrooms/?${queryString}` : `/api/classrooms/`;

    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail || data?.error || data?.message || "Failed to fetch data";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Classrooms GET] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.name || !body?.code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const { response, text, setCookie } = await djangoFetch(`/api/classrooms/`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail || data?.error || data?.message || "Failed to create classroom";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 201 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Classrooms POST] Error creating classroom:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
