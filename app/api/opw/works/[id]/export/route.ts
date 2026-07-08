// app/api/opw/works/[id]/export/route.ts
// Proxies the CSV export from Django, streaming back as a CSV file
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetchRaw } from "@/app/api/_lib/proxy";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  noStore();
  const { id } = await params;
  try {
    const { response, text, setCookie } = await djangoFetchRaw(
      `/opw/api/works/${id}/scores/export/`,
      { method: "GET" }
    );
    if (!response.ok) {
      return NextResponse.json({ error: "Export failed" }, { status: response.status });
    }
    const res = new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": response.headers.get("content-disposition") || `attachment; filename="opw_export.csv"`,
      },
    });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}
