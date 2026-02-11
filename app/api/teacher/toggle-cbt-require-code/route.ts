// app/api/teacher/toggle-cbt-require-code/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cbt_id = url.searchParams.get("cbt_id");

    if (!cbt_id) {
      return NextResponse.json(
        { detail: "cbt_id is required" },
        { status: 400 },
      );
    }

    const path = `/assessments/api/teacher/toggle-cbt-require-code/?cbt_id=${encodeURIComponent(cbt_id)}`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    // Try JSON; fallback to raw text
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { detail: text };
    }

    const res = NextResponse.json(data, { status: response.status });

    // forward Django cookies if any
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Server error" },
      { status: 500 },
    );
  }
}
