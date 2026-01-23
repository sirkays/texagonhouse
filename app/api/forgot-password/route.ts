// app/api/forgot-password/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface ForgotPasswordRequest {
  email: string;
  hours_valid?: number;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { email, hours_valid = 1 }: ForgotPasswordRequest =
      await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const { response, text, setCookie } = await djangoFetch(
      `/api/auth/confirm-password/`,
      {
        method: "POST",
        body: JSON.stringify({ email, hours_valid }),
      }
    );

    const data = safeJson(text);

    if (!response.ok) {
      console.error(
        "[ForgotPasswordRoute] Reset request failed:",
        response.status,
        data
      );

      const res = NextResponse.json(
        { message: data?.detail || "Failed to send reset email" },
        { status: response.status }
      );

      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(
      {
        message: "Reset email sent successfully",
        detail:
          data?.detail ||
          "If an account exists, a reset link has been sent.",
      },
      { status: 200 }
    );

    // Forward cookies if Django sends any (usually none here, but safe)
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error) {
    console.error("[ForgotPasswordRoute] Error:", error);
    return NextResponse.json(
      { message: "Failed to send reset email" },
      { status: 500 }
    );
  }
}
