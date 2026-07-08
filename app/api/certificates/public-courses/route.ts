import { NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");
    if (!orgId) {
      return NextResponse.json({ error: "org_id is required" }, { status: 400 });
    }
    const res = await fetch(
      `${BASE_URL}/academics/api/certificates/public/courses/?org_id=${orgId}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch courses", details: error?.message },
      { status: 500 }
    );
  }
}
