import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const BASE_URL = "https://texagonbackend.esm.name.ng";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req) {
  console.log("[Materials API] Initiating fetch for /learning/api/materials/mine/");

  const token = await getToken({ req, secret: "aVeryStrongSecretKeyAtLeast32Chars" });
  console.log("[Materials API] Token retrieved:", token ? { id: token.id, role: token.role, sessionToken: token.sessionToken } : "No token");

  if (!token?.sessionToken) {
    console.log("[Materials API] No session token found");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    console.log("[Materials API] Fetching from /learning/api/materials/mine/ with token:", token.sessionToken);
    const response = await fetch(`${BASE_URL}/learning/api/materials/mine/`, {
      method: "GET",
      headers: headers(token.sessionToken),
    });

    console.log("[Materials API] Fetch response status:", response.status);
    console.log("[Materials API] Fetch response headers:", Object.fromEntries(response.headers));

    const rawResponse = await response.text();
    console.log("[Materials API] Raw response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[Materials API] Failed to parse JSON:", parseError);
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    if (!response.ok) {
      console.error("[Materials API] Fetch failed:", response.status, data);
      return NextResponse.json(
        { error: data.detail || "Failed to fetch materials" },
        { status: response.status }
      );
    }

    console.log("[Materials API] Fetch successful, data:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Materials API] Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}