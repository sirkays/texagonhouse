import { NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";

export async function GET(
  _request: Request,
  { params }: { params: { accessId: string } }
) {
  try {
    const { accessId } = params;
    const res = await fetch(
      `${BASE_URL}/academics/api/certificates/public/status/${accessId}/`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch status", details: error?.message },
      { status: 500 }
    );
  }
}
