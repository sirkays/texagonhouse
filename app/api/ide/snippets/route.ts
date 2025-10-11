import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online/code-ide";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

// ✅ GET /api/ide/snippets?lesson=34
export async function GET(req: Request) {
  noStore();
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lesson");
  const endpoint = lessonId ? `/snippets/?lesson=${lessonId}` : `/snippets/`;

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: headers(sessionToken),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Error fetching snippets:", res.status, text);
      return NextResponse.json({ error: text || "Fetch failed" }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Snippet list error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

// ✅ POST /api/ide/snippets (create snippet)
export async function POST(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const res = await fetch(`${BASE_URL}/snippets/create/`, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Create snippet failed:", res.status, text);
      return NextResponse.json({ error: text || "Failed to create snippet" }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Snippet create error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}