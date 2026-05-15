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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const { response, text, setCookie } = await djangoFetch(`/api/assignments/${params.id}/`, { method: "GET" });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch assignment" }, { status: response.status });
    }
    const res = NextResponse.json(safeJson(text), { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(`/api/assignments/${params.id}/`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to update assignment", detail: safeJson(text) }, { status: response.status });
    }
    const res = NextResponse.json(safeJson(text), { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const { response, setCookie } = await djangoFetch(`/api/assignments/${params.id}/`, { method: "DELETE" });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to delete assignment" }, { status: response.status });
    }
    const res = NextResponse.json({ success: true }, { status: 204 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
