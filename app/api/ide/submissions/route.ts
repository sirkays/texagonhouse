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

// ✅ POST /api/ide/submissions (create submission)
export async function POST(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const res = await fetch(`${BASE_URL}/submissions/create/`, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Submit code failed:", res.status, text);
      return NextResponse.json({ error: text || "Submission failed" }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Submission error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

// ✅ GET /api/ide/submissions?id=77
export async function GET(req: Request) {
  noStore();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Submission ID required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BASE_URL}/submissions/${id}/`, {
      headers: headers(sessionToken),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Get submission failed:", res.status, text);
      return NextResponse.json({ error: text || "Fetch failed" }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Get submission error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}