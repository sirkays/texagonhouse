// app/api/teacher/modules/[id]/delete/route.ts (or wherever this lives)
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  noStore();

  const { id: moduleId } = await context.params;
  const endpoint = `/learning/api/teacher/modules/${moduleId}/delete/`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "DELETE",
    });

    // Parse JSON if possible (some deletes return empty or plain text)
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    // Keep your custom error messages
    if (!response.ok) {
      if (response.status === 401) {
        const nextRes = NextResponse.json(
          { error: "Session expired", redirect: "/auth/signin" },
          { status: 401 }
        );
        if (setCookie) nextRes.headers.set("set-cookie", setCookie);
        nextRes.headers.set("Cache-Control", "no-store");
        return nextRes;
      }

      if (response.status === 404) {
        const nextRes = NextResponse.json(
          { error: `Module with ID ${moduleId} not found` },
          { status: 404 }
        );
        if (setCookie) nextRes.headers.set("set-cookie", setCookie);
        nextRes.headers.set("Cache-Control", "no-store");
        return nextRes;
      }

      const nextRes = NextResponse.json(
        {
          error: "Failed to delete module",
          details: typeof text === "string" ? text.slice(0, 100) : data,
        },
        { status: response.status }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    // Success response + no-cache headers like your original
    const nextRes = NextResponse.json(data, { status: 200 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    nextRes.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    nextRes.headers.set("Pragma", "no-cache");
    nextRes.headers.set("Expires", "0");
    return nextRes;
  } catch (error) {
    console.error("[ModuleDeleteAPI] Fetch error:", error);
    const nextRes = NextResponse.json(
      { error: "Failed to delete module", details: (error as Error).message },
      { status: 500 }
    );
    nextRes.headers.set("Cache-Control", "no-store");
    return nextRes;
  }
}
