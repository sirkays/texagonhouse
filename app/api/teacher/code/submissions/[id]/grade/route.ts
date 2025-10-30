// app/api/teacher/code/submissions/[id]/grade/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  console.log(`[Route] Received POST request to code-ide/api/teacher/submissions/${id}/grade/`);
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const backendUrl = `${BASE_URL}/code-ide/api/teacher/submissions/${id}/grade/`;
    console.log("[Route] Posting to", backendUrl);
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);
    if (!res.ok) {
      console.log("[Route] API post failed:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to grade submission" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error posting data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}