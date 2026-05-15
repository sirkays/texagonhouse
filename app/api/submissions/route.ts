import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  noStore();
  try {
    const { response, text, setCookie } = await djangoFetch(`/api/submissions/`, { method: "GET" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch submissions", detail: safeJson(text)?.detail || text },
        { status: response.status }
      );
    }

    const data = safeJson(text);
    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch submissions", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  noStore();
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(`/api/submissions/`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create submission", detail: safeJson(text)?.detail || text },
        { status: response.status }
      );
    }

    const data = safeJson(text);
    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create submission", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}
