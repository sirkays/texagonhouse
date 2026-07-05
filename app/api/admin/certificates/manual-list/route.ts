import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(request: Request) {
  try {
    const { response, text, setCookie } = await djangoFetch(
      "/academics/api/certificates/manual-list/",
      {
        method: "GET",
      }
    );

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const res = NextResponse.json(data, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, {
      status: response.status || 200,
    });
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
