import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request) {
  noStore();

  try {
    const body = await req.json();

    const { response, text, setCookie } = await djangoFetch(
      "/learning/api/presign-s3/",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const outHeaders = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    if (setCookie) outHeaders.set("Set-Cookie", setCookie);

    if (!response.ok) {
      let errMsg = "Failed to presign S3 upload";
      try {
        const j = JSON.parse(text || "{}");
        errMsg = j?.detail || j?.error || errMsg;
      } catch {}
      return NextResponse.json(
        { error: errMsg },
        { status: response.status, headers: outHeaders }
      );
    }

    const data = JSON.parse(text || "{}");
    return NextResponse.json(data, { status: 200, headers: outHeaders });
  } catch (error: any) {
    console.error("[PresignS3Proxy] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to presign S3 upload" },
      { status: 500 }
    );
  }
}
