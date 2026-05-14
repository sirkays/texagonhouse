// app/api/set-nickname/route.ts

import { djangoFetch } from "@/app/api/_lib/proxy";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/set-nickname/",
      {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text || "Nickname updated." };
    }

    const res = NextResponse.json(data, { status: response.status });

    if (setCookie) {
      res.headers.append("Set-Cookie", setCookie);
    }

    return res;
  } catch (error) {
    console.error("Set Nickname Proxy Error:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
