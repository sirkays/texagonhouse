// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://texagonbackend.epichouse.online";
const API_KEY = process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Carry through the original query string (type, page, page_size, etc.)
  const { searchParams } = new URL(req.url);
  const backendUrl = new URL(`${BASE_URL}/billing/api/transactions-list/`);
  // copy all params across
  searchParams.forEach((value, key) => backendUrl.searchParams.append(key, value));

  const headers: Record<string, string> = {
    Authorization: `Api-Key ${API_KEY}`,
    "Content-Type": "application/json",
    "X-Session-Token": String(sessionToken),
  };

  const response = await fetch(backendUrl.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const raw = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    return NextResponse.json(
      { error: `Backend returned ${response.status}`, details: raw },
      { status: response.status }
    );
  }

  if (contentType.includes("application/json")) {
    try {
      return NextResponse.json(JSON.parse(raw), { status: 200 });
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from backend", details: raw.slice(0, 300) },
        { status: 502 }
      );
    }
  }

  return new NextResponse(raw, {
    status: 200,
    headers: { "Content-Type": contentType || "text/plain; charset=utf-8" },
  });
}
