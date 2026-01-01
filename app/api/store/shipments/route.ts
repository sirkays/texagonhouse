// texagon_academy\texagonui\app\api\store\shipments\route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  const { res, text } = await djangoFetch(`/store/api/list/shipments/`, {
    method: "GET",
  });

  return new NextResponse(text, { status: res.status });
}
