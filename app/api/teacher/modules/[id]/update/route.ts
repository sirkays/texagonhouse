import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  noStore();

  const { id } = await context.params;
  const moduleId = id;

  const endpoint = `/learning/api/teacher/modules/${moduleId}/update/`;

  try {
    const body = await req.json();

    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = text;

    if (!response.ok) {
      console.error(
        "[ModuleUpdateAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );

      if (response.status === 401) {
        return attachSetCookie(
          NextResponse.json(
            { error: "Session expired", redirect: "/auth/signin" },
            {
              status: 401,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
              },
            }
          ),
          setCookie
        );
      }

      if (response.status === 404) {
        return attachSetCookie(
          NextResponse.json(
            { error: `Module with ID ${moduleId} not found` },
            {
              status: 404,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
              },
            }
          ),
          setCookie
        );
      }

      return attachSetCookie(
        NextResponse.json(
          { error: "Failed to update module" },
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        ),
        setCookie
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[ModuleUpdateAPI] Non-JSON response received:", contentType);
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format, expected JSON" },
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        ),
        setCookie
      );
    }

    let data: any;
    try {
      data = rawResponse ? JSON.parse(rawResponse) : null;
    } catch (parseError) {
      console.error("[ModuleUpdateAPI] Failed to parse JSON:", parseError);
      return attachSetCookie(
        NextResponse.json(
          { error: "Invalid response format" },
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        ),
        setCookie
      );
    }

    const res = NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[ModuleUpdateAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to update module", details: (error as Error).message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
