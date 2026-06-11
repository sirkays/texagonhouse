// app/api/org/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: NextRequest) {
  try {
    const { response, text } = await djangoFetch("/orgs/api/org/settings/", {
      method: "GET",
    });
    const data = JSON.parse(text);
    if (!response.ok) {
      return NextResponse.json(
        { detail: data?.detail ?? "Failed to fetch org settings." },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { detail: "Network error — could not fetch org settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { response, text } = await djangoFetch("/orgs/api/org/settings/update/", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const data = JSON.parse(text);
    if (!response.ok) {
      return NextResponse.json(
        { detail: data?.detail ?? "Failed to update org settings." },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { detail: "Network error — could not update org settings." },
      { status: 500 }
    );
  }
}

