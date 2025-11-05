import { NextResponse } from "next/server";
import { fetchWithTimeout, withAuthHeaders, BASE_URL } from "@/lib/codeIdeClient";

export async function POST(request: Request) {
  try {
    const headers = await withAuthHeaders();
    const body = await request.json();

    const res = await fetchWithTimeout(`${BASE_URL}/api/ide/submissions/create/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      timeout: 10000,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}