// app/api/teacher/attendance/mark/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { response, text, setCookie } = await djangoFetch(
      `/api/attendance/teacher/mark/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const res = new NextResponse(text, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    res.headers.set("Content-Type", "application/json");
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to mark attendance", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}