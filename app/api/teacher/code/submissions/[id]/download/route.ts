// app/api/teacher/code/submissions/[id]/download/route.ts
import { NextResponse } from "next/server";
import { djangoFetchBinary } from "@/app/api/_lib/proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  try {
    const { response, buffer, setCookie } = await djangoFetchBinary(
      `/code-ide/api/teacher/submissions/${id}/download/`,
      { method: "GET" }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to download submission files" },
        { status: response.status }
      );
    }

    const contentDisposition =
      response.headers.get("content-disposition") ||
      `attachment; filename="submission_${id}.zip"`;

    const res = new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": contentDisposition,
      },
    });

    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Route] Error downloading submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
