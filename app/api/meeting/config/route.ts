import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { response, text } = await djangoFetch("/live/api/config/", {
      method: "GET",
    });

    if (!response.ok) {
      return NextResponse.json({ enable_recordings: false }, { status: 200 });
    }

    const data = JSON.parse(text || "{}");
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ enable_recordings: false }, { status: 200 });
  }
}
