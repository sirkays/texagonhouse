// app/api/konnect/start-room/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const { response, text } = await djangoFetch("/konnect/start-room/", {
      method: "POST",
      body: JSON.stringify(body),
    });

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    console.error("[start-room] error", err);
    return NextResponse.json(
      { detail: "Internal server error", error: String(err) },
      { status: 500 }
    );
  }
}