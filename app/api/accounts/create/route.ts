import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = `${BASE_URL}/accounts/api/account/create/`;

    // Log the payload to ensure frontend is sending correct data types (numbers vs strings)

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // FIX: Read as text first to handle HTML errors (like the 500 Timeout)
    const responseText = await res.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "[Create Route] Failed to parse backend response as JSON. Raw response:",
        responseText.slice(0, 200)
      );
      return NextResponse.json(
        {
          error:
            "Backend Error: The server returned an invalid response (likely a timeout or HTML error page).",
        },
        {status: res.status || 500}
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to create account"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Create Route] Internal Server Error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
