//  texagon_academy\texagonui\app\api\teacher\courses\[courseId]\toggle-code-submit
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await ctx.params;

  const { response, text, setCookie } = await djangoFetch(
    `/learning/api/toggle-code-submit/?course_id=${encodeURIComponent(courseId)}`,
    { method: "GET" },
  );

  const contentType = response.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": contentType,
      ...(setCookie ? { "Set-Cookie": setCookie } : {}),
    },
  });
}
