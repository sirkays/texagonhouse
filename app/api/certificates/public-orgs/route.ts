// Public proxy — no session/auth required, just forwards to Django
import { NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/academics/api/certificates/public/orgs/`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch organisations", details: error?.message },
      { status: 500 }
    );
  }
}
