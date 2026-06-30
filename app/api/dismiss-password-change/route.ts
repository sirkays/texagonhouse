// app/api/dismiss-password-change/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: NextRequest) {
  const { response, text } = await djangoFetch(
    "/accounts/api/dismiss-password-change/",
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );

  return NextResponse.json(
    text ? JSON.parse(text) : { detail: "OK" },
    { status: response.status }
  );
}
