// app/api/confirm-email-change/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {response, text, setCookie} = await djangoFetch(
    "/accounts/api/confirm-email-change/",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  const proxyResponse = new NextResponse(text, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  if (setCookie) {
    proxyResponse.headers.set("Set-Cookie", setCookie);
  }

  return proxyResponse;
}