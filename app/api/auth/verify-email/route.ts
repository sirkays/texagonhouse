import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function POST(request: Request) {
  console.log(`[Verify Route] Received POST request`);

  try {
    const body = await request.json();
    const backendUrl = `${BASE_URL}/accounts/api/auth/verify-email/`;

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // FIX: Read text first to prevent crashes on non-JSON responses
    const responseText = await res.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "[Verify Route] Failed to parse JSON. Raw response:",
        responseText.slice(0, 200)
      );
      return NextResponse.json(
        {error: "Backend Error: Received invalid response from server."},
        {status: res.status || 500}
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to verify email"},
        {status: res.status}
      );
    }

    return NextResponse.json(data, {status: 200});
  } catch (error) {
    console.error("[Verify Route] Internal Server Error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
