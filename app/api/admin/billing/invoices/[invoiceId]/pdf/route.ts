import { NextRequest, NextResponse } from "next/server";
import { djangoFetchRaw } from "@/app/api/_lib/proxy";

type Context = {
  params: Promise<{ invoiceId: string }>;
};

export async function GET(_req: NextRequest, context: Context) {
  const { invoiceId } = await context.params;

  if (!invoiceId) {
    return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
  }

  try {
    const { response, setCookie } = await djangoFetchRaw(
      `/orgs/api/admin/billing/invoices/${invoiceId}/pdf`,
      { method: "GET" }
    );

    // Read binary once (not previously consumed)
    const arrayBuffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("content-type") || "application/pdf"
    );

    const cd = response.headers.get("content-disposition");
    if (cd) headers.set("Content-Disposition", cd);

    if (setCookie) headers.set("set-cookie", setCookie);

    return new NextResponse(arrayBuffer, { status: response.status, headers });
  } catch (error) {
    console.error("[Invoice PDF Route] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
