// texagon_academy\texagonui\app\api\store\shipments\route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  const { response, text } = await djangoFetch(`/store/api/list/shipments/`, {
    method: "GET",
  });

  return new NextResponse(text, { status: response.status });
}
