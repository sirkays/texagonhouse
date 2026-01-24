import { NextRequest, NextResponse } from "next/server";
import { djangoFetchRaw } from "@/app/api/_lib/proxy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const path = queryString
      ? `/orgs/api/admin/students/export/?${queryString}`
      : `/orgs/api/admin/students/export/`;

    const { response, setCookie } = await djangoFetchRaw(path, {
      method: "GET",
    });

    if (!response.ok) {
      // backend usually returns JSON error here
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {}

      const res = NextResponse.json(
        { error: errorData?.detail || "Failed to export data" },
        { status: response.status }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    // ✅ Stream CSV back to client
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "text/csv");
    headers.set("Content-Disposition", "attachment; filename=students.csv");

    if (setCookie) {
      headers.set("set-cookie", setCookie);
    }

    return new NextResponse(response.body, {
      status: response.status,
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
