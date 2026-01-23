import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withForwardedCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { response, text, setCookie } = await djangoFetch(
      `/billing/api/parent/${id}/generate-invoice/`,
      { method: "POST" }
    );

    // Django should return JSON
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errMsg =
        data?.detail || data?.error || "Failed to generate invoices";

      return withForwardedCookie(
        NextResponse.json({ error: errMsg }, { status: response.status }),
        setCookie
      );
    }

    return withForwardedCookie(NextResponse.json(data), setCookie);
  } catch (error) {
    console.error("[Route] Error generating invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
