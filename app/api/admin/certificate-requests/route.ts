import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const path = statusFilter
      ? `/academics/api/certificates/requests/?status=${statusFilter}`
      : "/academics/api/certificates/requests/";

    const { response, text } = await djangoFetch(path);
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch certificate requests", details: error?.message },
      { status: 500 }
    );
  }
}
