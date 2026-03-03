// app/api/konnect/rooms/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  try {
    const { response, text } = await djangoFetch("/konnect/rooms/");

    const data = JSON.parse(text);

    if (!response.ok) {
      return NextResponse.json(
        { detail: data?.detail ?? "Failed to fetch rooms." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { detail: "Network error — could not fetch rooms." },
      { status: 500 }
    );
  }
}