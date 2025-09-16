import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

// DELETE: Delete a live session
export async function DELETE(req: Request, context: { params: Promise<{ meetingId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/live/api/delete-live-session/${params.meetingId}/delete/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[LiveSessionDeleteAPI] Initiating DELETE request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[LiveSessionDeleteAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[LiveSessionDeleteAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  if (session.user.role !== "teacher") {
    console.log("[LiveSessionDeleteAPI] Unauthorized: User is not a teacher");
    return NextResponse.json(
      { error: "Unauthorized: Only teachers can delete live sessions" },
      { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  try {
    console.log("[LiveSessionDeleteAPI] Sending request to", fullUrl);
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
    });

    console.log("[LiveSessionDeleteAPI] Response status:", response.status);
    if (!response.ok) {
      console.error("[LiveSessionDeleteAPI] Request failed:", response.status);
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
      return NextResponse.json(
        { error: "Failed to delete live session" },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    console.log("[LiveSessionDeleteAPI] Live session deleted successfully");
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[LiveSessionDeleteAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to delete live session", details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}