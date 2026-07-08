import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { response, text } = await djangoFetch(
      `/academics/api/certificates/requests/${params.id}/approve/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to approve request", details: error?.message },
      { status: 500 }
    );
  }
}
