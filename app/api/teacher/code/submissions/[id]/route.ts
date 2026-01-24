// app/api/teacher/code/submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/code-ide/api/teacher/submissions/${id}/`,
      { method: "GET" }
    );

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const res = NextResponse.json(
        { error: data?.detail || "Failed to fetch data" },
        { status: response.status }
      );
      return attachSetCookie(res, setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
