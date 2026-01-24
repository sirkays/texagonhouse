import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

const NO_STORE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ testId: string }> }
) {
  noStore();

  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/delete/`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "DELETE",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[TestDeleteAPI] Request failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired" },
          {
            status: 401,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Test not found" },
          {
            status: 404,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to delete test" },
        {
          status: response.status,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[TestDeleteAPI] Non-JSON response received:", contentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error("[TestDeleteAPI] Failed to parse JSON:", parseError);
      const res = NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    const processedData = {
      message: data?.message || "Test deleted successfully.",
    };

    const res = NextResponse.json(processedData, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[TestDeleteAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to delete test", details: (error as Error).message },
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      }
    );
  }
}
