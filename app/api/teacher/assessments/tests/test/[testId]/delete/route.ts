import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";

const headers = (sessionToken: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function DELETE(req: Request, context: { params: Promise<{ testId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/delete/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TestDeleteAPI] Initiating DELETE request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TestDeleteAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TestDeleteAPI] No session token found");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
    });

    console.log("[TestDeleteAPI] Response status:", response.status);
    const rawResponse = await response.text();
    console.log("[TestDeleteAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[TestDeleteAPI] Request failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) return NextResponse.json({ error: "Session expired" }, { status: 401 });
      return NextResponse.json({ error: "Failed to delete test" }, { status: response.status });
    }

    const data = JSON.parse(rawResponse);
    console.log("[TestDeleteAPI] Test deleted successfully:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[TestDeleteAPI] Request error:", error);
    return NextResponse.json({ error: "Failed to delete test", details: error.message }, { status: 500 });
  }
}