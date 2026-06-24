import { NextRequest, NextResponse } from "next/server";
import { djangoFetchBinary } from "@/app/api/_lib/proxy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const path = queryString
      ? `/orgs/api/admin/students/export/?${queryString}`
      : `/orgs/api/admin/students/export/`;

    const { response, buffer, setCookie } = await djangoFetchBinary(path, {
      method: "GET",
    });

    if (!response.ok) {
      // Try to decode the error body as text for a helpful message
      let errorMsg = "Failed to export data";
      try {
        errorMsg = new TextDecoder().decode(buffer) || errorMsg;
        const parsed = JSON.parse(errorMsg);
        errorMsg = parsed?.detail || parsed?.error || errorMsg;
      } catch {}

      const res = NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    // Stream the binary buffer back as a CSV download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv; charset=utf-8");
    headers.set(
      "Content-Disposition",
      `attachment; filename="students_${new Date().toISOString().split("T")[0]}.csv"`
    );
    if (setCookie) headers.set("set-cookie", setCookie);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Students Export] Error exporting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
