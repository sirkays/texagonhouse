// app/api/fetch-profile/route.ts

import {djangoFetch} from "@/app/api/_lib/proxy";
import {NextResponse} from "next/server";

export async function GET() {
  try {
    const {response, text, setCookie} = await djangoFetch(
      "/accounts/api/fetch-profile/",
      {
        method: "GET",
      },
    );

    let data: any;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {detail: text || "Profile fetched."};
    }

    const res = NextResponse.json(data, {
      status: response.status,
    });

    if (setCookie) {
      res.headers.append("Set-Cookie", setCookie);
    }

    return res;
  } catch (error) {
    console.error("Fetch Profile Proxy Error:", error);

    return NextResponse.json({detail: "Internal Server Error"}, {status: 500});
  }
}
