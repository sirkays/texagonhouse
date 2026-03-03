// app/api/konnect/get-allowed-room/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room_id = searchParams.get("room_id");

    if (!room_id) {
      return NextResponse.json(
        { detail: "room_id is required." },
        { status: 400 }
      );
    }

    const { response, text } = await djangoFetch(
      `/konnect/get-allowed-room/?room_id=${encodeURIComponent(room_id)}`,
      { method: "GET" }
    );

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    console.error("[get-allowed-room] error", err);
    return NextResponse.json(
      { detail: "Internal server error", error: String(err) },
      { status: 500 }
    );
  }
}