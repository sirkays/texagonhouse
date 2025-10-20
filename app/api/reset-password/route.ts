// File: app/api/reset-password/route.ts
import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

interface Headers {
  [key: string]: string;
}

const headers = (): Headers => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
});

interface ResetPasswordRequest {
  resetToken: string;
  new_password: string;
  re_new_password: string;
  issue_session_hours?: number;
}

interface ResetPasswordResponseData {
  detail?: string;
  sessionToken?: string;
  expiresAt?: string;
  userId?: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const {
      resetToken,
      new_password,
      re_new_password,
      issue_session_hours,
    }: ResetPasswordRequest = await request.json();

    if (!resetToken) {
      return NextResponse.json(
        {message: "Reset token is required"},
        {status: 400}
      );
    }

    if (!new_password || new_password !== re_new_password) {
      return NextResponse.json(
        {message: "Passwords do not match"},
        {status: 400}
      );
    }

    const body: any = {
      resetToken,
      new_password,
      re_new_password,
    };

    if (issue_session_hours !== undefined) {
      body.issue_session_hours = issue_session_hours;
    }

    const response: Response = await fetch(
      `${BASE_URL}/api/auth/reset-password/`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      }
    );

    console.log(
      "[ResetPasswordRoute] Reset API response status:",
      response.status
    );

    const rawResponse: string = await response.text();
    console.log(
      "[ResetPasswordRoute] Raw response from reset API:",
      rawResponse || "Empty response"
    );

    let data: ResetPasswordResponseData = {};
    if (rawResponse) {
      try {
        data = JSON.parse(rawResponse) as ResetPasswordResponseData;
      } catch (parseError) {
        console.error(
          "[ResetPasswordRoute] Failed to parse reset JSON:",
          parseError
        );
        data = {detail: "Invalid response format"};
      }
    } else {
      console.log(
        "[ResetPasswordRoute] Empty response from reset API, assuming success"
      );
      data = {detail: "Password has been reset successfully."};
    }

    if (!response.ok) {
      console.error(
        "[ResetPasswordRoute] Reset failed:",
        response.status,
        data
      );
      return NextResponse.json(
        {message: data.detail || "Failed to reset password"},
        {status: 400}
      );
    }

    console.log("[ResetPasswordRoute] Reset successful:", data);

    const res = NextResponse.json(
      {
        message: "Password reset successfully",
        detail: data.detail,
        ...(data.sessionToken && {
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt,
          userId: data.userId,
        }),
      },
      {status: 200}
    );

    // If a session token was issued, set the NextAuth cookie (assuming integration with NextAuth)
    if (data.sessionToken) {
      res.cookies.set("next-auth.session-token", data.sessionToken, {
        maxAge: issue_session_hours
          ? issue_session_hours * 60 * 60
          : 24 * 60 * 60,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }

    return res;
  } catch (error) {
    console.error("[ResetPasswordRoute] Error:", error);
    return NextResponse.json(
      {message: "Failed to reset password"},
      {status: 500}
    );
  }
}
