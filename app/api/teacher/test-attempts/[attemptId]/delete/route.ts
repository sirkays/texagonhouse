import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const resolvedParams = await params;
    const attemptId = resolvedParams.attemptId;

    const endpoint = `/assessments/api/teacher/test-attempts/${attemptId}/delete/`;

    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete attempt";
      try {
        if (text) {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        }
      } catch (e) {
        // ignore
      }
      
      const nextRes = NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      return nextRes;
    }

    let data = {};
    try {
      if (text) data = JSON.parse(text);
    } catch (e) {}

    const nextRes = NextResponse.json(data, { status: 200 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error: any) {
    console.error("Error deleting attempt in Next.js route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
