import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online"; // ✅ Correct base URL
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET(request: Request) {
  console.log("[Admin Overview] Received GET request to /api/admin/overview");

  const session = await getServerSession(authOptions);
  console.log("[Admin Overview] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Admin Overview] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const endpoint = `${BASE_URL}/api/admin/dashboard/summary/`; // ✅ Correct endpoint
    console.log("[Admin Overview] Fetching data from:", endpoint);

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${session.user.sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Admin Overview] API response status:", res.status);

    // ✅ Read body safely (only once)
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[Admin Overview] Backend returned non-JSON:", text);
      data = {detail: text};
    }

    if (!res.ok) {
      console.error("[Admin Overview] Backend error:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to fetch admin overview"},
        {status: res.status}
      );
    }

    console.log("[Admin Overview] API response data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Admin Overview] Error fetching data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
