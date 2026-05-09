import { NextRequest, NextResponse } from "next/server";
import { djangoFetchBinary } from "@/app/api/_lib/proxy";

const REPORT_ENDPOINTS: Record<string, string> = {
  "student-performance": "/orgs/api/admin/reports/student-performance/",
  revenue: "/orgs/api/admin/reports/revenue/",
  "course-completion": "/orgs/api/admin/reports/course-completion/",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";

    const backendPath = REPORT_ENDPOINTS[type];
    if (!backendPath) {
      return NextResponse.json(
        { error: `Unknown report type: "${type}". Valid types: ${Object.keys(REPORT_ENDPOINTS).join(", ")}` },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    const fullPath = `${backendPath}${params.toString() ? `?${params.toString()}` : ""}`;

    const { response, buffer, setCookie } = await djangoFetchBinary(fullPath, {
      method: "GET",
    });

    if (!response.ok) {
      // Try to parse error message
      const text = Buffer.from(buffer).toString("utf-8");
      let msg = "Failed to generate report";
      try {
        const data = JSON.parse(text);
        msg = data?.detail || data?.error || msg;
      } catch {}
      return NextResponse.json({ error: msg }, { status: response.status });
    }

    // Stream the CSV back to the browser
    const contentDisposition =
      response.headers.get("content-disposition") ||
      `attachment; filename="${type}-report.csv"`;

    const res = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": contentDisposition,
      },
    });

    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Admin Reports] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
