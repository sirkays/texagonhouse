import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/auth/resend-email-otp/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const headers = new Headers();
    if (setCookie) headers.set("set-cookie", setCookie);

    return new NextResponse(text, {
      status: response.status,
      headers,
    });
  } catch (e: any) {
    return NextResponse.json(
      { detail: "Server error", error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
