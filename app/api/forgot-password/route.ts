// File: app/api/forgot-password/route.ts
import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

interface Headers {
  [key: string]: string;
}

const headers = (): Headers => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
});

interface ForgotPasswordRequest {
  email: string;
  hours_valid?: number;
}

interface ForgotPasswordResponseData {
  detail?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const {email, hours_valid = 1}: ForgotPasswordRequest =
      await request.json();

    if (!email) {
      return NextResponse.json({message: "Email is required"}, {status: 400});
    }

    const response: Response = await fetch(
      `${BASE_URL}/api/auth/confirm-password/`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          email,
          hours_valid,
        }),
      }
    );

    console.log(
      "[ForgotPasswordRoute] Reset request API response status:",
      response.status
    );

    const rawResponse: string = await response.text();
    console.log(
      "[ForgotPasswordRoute] Raw response from reset request API:",
      rawResponse || "Empty response"
    );

    let data: ForgotPasswordResponseData = {};
    if (rawResponse) {
      try {
        data = JSON.parse(rawResponse) as ForgotPasswordResponseData;
      } catch (parseError) {
        console.error(
          "[ForgotPasswordRoute] Failed to parse reset request JSON:",
          parseError
        );
        data = {detail: "Invalid response format"};
      }
    } else {
      console.log(
        "[ForgotPasswordRoute] Empty response from reset request API, assuming success"
      );
      data = {detail: "If an account exists, a reset link has been sent."};
    }

    if (!response.ok) {
      console.error(
        "[ForgotPasswordRoute] Reset request failed:",
        response.status,
        data
      );
      return NextResponse.json(
        {message: data.detail || "Failed to send reset email"},
        {status: 400}
      );
    }

    console.log("[ForgotPasswordRoute] Reset request successful:", data);
    return NextResponse.json(
      {message: "Reset email sent successfully", detail: data.detail},
      {status: 200}
    );
  } catch (error) {
    console.error("[ForgotPasswordRoute] Error:", error);
    return NextResponse.json(
      {message: "Failed to send reset email"},
      {status: 500}
    );
  }
}
