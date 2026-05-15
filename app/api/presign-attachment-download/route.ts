import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request) {
  noStore();
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(
      `/api/presign-attachment-download/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "Invalid response" };
    }

    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
