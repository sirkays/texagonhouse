// app/api/admin/billing/invoices/[invoiceId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Context = {
  params: Promise<{ invoiceId: string }>;
};

export async function GET(_request: NextRequest, context: Context) {
  const { invoiceId } = await context.params;

  if (!invoiceId) {
    return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/billing/invoices/${invoiceId}/`,
      { method: "GET" }
    );

    // Try to parse JSON, but don’t crash if backend returns non-JSON
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { detail: text };
    }

    // Build NextResponse and forward Django cookies if present
    const nextRes = NextResponse.json(
      response.ok ? data : { error: data?.detail || "Failed to fetch invoice" },
      { status: response.status }
    );

    if (setCookie) {
      nextRes.headers.set("set-cookie", setCookie);
    }

    return nextRes;
  } catch (error) {
    console.error("[Invoice Route] Error fetching invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
