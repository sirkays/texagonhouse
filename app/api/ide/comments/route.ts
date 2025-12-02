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

// ✅ POST /api/ide/comments?submissionId=77
export async function POST(req: Request) {
  noStore();
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");
  if (!submissionId)
    return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  try {
    const res = await fetch(`${BASE_URL}/submissions/${submissionId}/comments/`, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Add comment failed:", res.status, text);
      return NextResponse.json({ error: text || "Failed to add comment" }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    console.error("Add comment error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}