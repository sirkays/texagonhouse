import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface Category {
  id: string;
  name: string;
}

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

export async function GET(_req: Request) {
  noStore();

  const endpoint = `/learning/api/teacher/module-categories/`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[TeacherModuleCategoriesAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          {
            status: 401,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Module categories endpoint not found" },
          {
            status: 404,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to fetch module categories" },
        {
          status: response.status,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherModuleCategoriesAPI] Non-JSON response received:",
        contentType
      );
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: { categories: any[] };
    try {
      data = text ? JSON.parse(text) : { categories: [] };
    } catch (parseError) {
      console.error(
        "[TeacherModuleCategoriesAPI] Failed to parse JSON:",
        parseError
      );
      const res = NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!Array.isArray(data.categories)) {
      console.error(
        "[TeacherModuleCategoriesAPI] Response does not contain a categories array:",
        data
      );
      const res = NextResponse.json(
        { error: "Invalid response format, expected categories array" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    const normalizedData: Category[] = data.categories.map((category) => ({
      id: String(category?.id ?? ""),
      name: category?.name || "",
    }));

    const res = NextResponse.json(normalizedData, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[TeacherModuleCategoriesAPI] Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch module categories",
        details: (error as Error).message,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      }
    );
  }
}
