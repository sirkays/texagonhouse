import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const invoicesPage = searchParams.get("invoices_page") ?? "1";
    const invoicesPageSize = searchParams.get("invoices_page_size") ?? "10";
    const invoicesSearch = searchParams.get("invoices_search") ?? "";

    const query = new URLSearchParams({
      invoices_page: invoicesPage,
      invoices_page_size: invoicesPageSize,
    });

    if (invoicesSearch.trim()) {
      query.set("invoices_search", invoicesSearch.trim());
    }

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/billing/dashboard?${query.toString()}`,
      { method: "GET" }
    );

    // Try JSON first; fall back to text
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { detail: text };
    }

    if (!response.ok) {
      const msg =
        data?.detail ||
        data?.error ||
        "Failed to fetch billing dashboard";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Billing Dashboard Route] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
