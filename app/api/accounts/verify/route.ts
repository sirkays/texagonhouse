// app/api/auth/verify-email/route.ts   (or pages/api/auth/verify-email.ts)
import {NextRequest, NextResponse} from "next/server";

const BASE_URL =
  process.env.TEXAGON_BASE_URL || "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c"; // ← Must be in .env.local!

export async function POST(request: NextRequest) {
  // 1. Critical: API key must come from environment
  if (!API_KEY) {
    console.error("TEXAGON_API_KEY is missing in environment variables");
    return NextResponse.json(
      {detail: "Server configuration error."},
      {status: 500}
    );
  }

  try {
    const body = await request.json();

    // 2. Required fields validation (exactly as per docs)
    if (!body.email || (!body.code && !body.otp)) {
      return NextResponse.json(
        {detail: "email and code (or otp) are required."},
        {status: 400}
      );
    }

    // 3. Build payload — support both "code" and "otp" keys
    const payload: {email: string; code?: string; otp?: string} = {
      email: body.email.trim(),
    };

    if (body.code) payload.code = body.code.trim();
    if (body.otp) payload.otp = body.otp.trim();

    // 4. Forward to Texagon backend
    const response = await fetch(
      `${BASE_URL}/accounts/api/auth/verify-email/`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // 5. Proxy exact response — success (200) or error (400)
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Email verification proxy error:", error);

    // Handle invalid JSON from frontend
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {detail: "Invalid JSON payload."},
        {status: 400}
      );
    }

    return NextResponse.json({detail: "Internal server error."}, {status: 500});
  }
}
