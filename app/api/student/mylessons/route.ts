import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  try {
    const { response, text, setCookie } = await djangoFetch(
      "/learning/api/student/lesson/",
      {
        method: "GET",
      }
    );

    // Try to parse JSON safely
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // Forward Django cookies (sessionid, etc.)
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Student lessons proxy error:", error);

    return NextResponse.json(
      { detail: "Failed to fetch student lessons" },
      { status: 500 }
    );
  }
}
