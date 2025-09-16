import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function POST(req: Request, context: { params: Promise<{ testId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/publish/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TestPublishAPI] Initiating POST request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TestPublishAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TestPublishAPI] No session token found");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("[TestPublishAPI] Request body:", body);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[TestPublishAPI] Response status:", response.status);
    const rawResponse = await response.text();
    console.log("[TestPublishAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[TestPublishAPI] Request failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) return NextResponse.json({ error: "Session expired" }, { status: 401 });
      return NextResponse.json({ error: "Failed to publish/unpublish test" }, { status: response.status });
    }

    const data = JSON.parse(rawResponse);
    console.log("[TestPublishAPI] Test published/unpublished successfully:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[TestPublishAPI] Request error:", error);
    return NextResponse.json({ error: "Failed to publish/unpublish test", details: error.message }, { status: 500 });
  }
}