// app/api/teacher/attendance/session/[sessionId]/delete/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function DELETE(
  _req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const { response, text, setCookie } = await djangoFetch(
      `/api/attendance/teacher/session/${sessionId}/delete/`,
      { method: "DELETE" }
    );

    const res = new NextResponse(text, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    res.headers.set("Content-Type", "application/json");
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete session", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}