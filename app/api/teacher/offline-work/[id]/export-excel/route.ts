import { NextResponse } from "next/server";
import { djangoFetchBinary } from "@/app/api/_lib/proxy";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { response, buffer, setCookie } = await djangoFetchBinary(
      `/opw/api/works/${params.id}/scores/export-excel/`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const res = NextResponse.json({ error: "Failed to download Excel file" }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": response.headers.get("Content-Disposition") || `attachment; filename="OPW_Scores_${params.id}.xlsx"`,
      },
    });

    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("Failed to proxy export-excel request", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
