import { NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BASE_URL}/academics/api/certificates/public/request/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to submit request", details: error?.message },
      { status: 500 }
    );
  }
}
