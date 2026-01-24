import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

// DELETE: Delete a live session
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ meetingId: string }> }
) {
  noStore();

  const { meetingId } = await context.params;

  // Keep your existing role gate (this is local logic, not duplicated headers)
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  if ((session.user as any)?.role !== "teacher") {
    return NextResponse.json(
      { error: "Unauthorized: Only teachers can delete live sessions" },
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const t = withTimeout(20000);

  try {
    const startFetch = await djangoFetch(
      `/live/api/delete-live-session/${meetingId}/delete/`,
      {
        method: "DELETE",
        signal: t.signal,
      }
    );

    if (!startFetch.response.ok) {
      console.error(
        "[LiveSessionDeleteAPI] Request failed:",
        startFetch.response.status,
        startFetch.text?.slice(0, 120)
      );

      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired" },
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to delete live session", details: startFetch.text || "" },
        {
          status: startFetch.response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    // Backend likely returns 204; always respond 204 from proxy
    const res = new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[LiveSessionDeleteAPI] Request error:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to delete live session",
        details: error?.message || String(error),
      },
      {
        status: isTimeout ? 504 : 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } finally {
    t.clear();
  }
}
