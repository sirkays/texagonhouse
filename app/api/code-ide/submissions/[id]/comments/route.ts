// app/api/ide/submissions/[id]/comments/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098/code-ide/api/ide";
const BASE_URL = "https://texagonbackend.onrender.com/code-ide/api/ide";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function fetchWithTimeout(url: string, options: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function POST(request: Request, {params}: {params: {id: string}}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  let body;

  try {
    body = await request.json();
  } catch (err) {
    console.error(
      "[Route] Error parsing request body:",
      (err as Error).message
    );
    return NextResponse.json(
      {error: "Invalid request body", details: (err as Error).message},
      {status: 400}
    );
  }

  if (!body.message) {
    console.error("[Route] Missing required field: message");
    return NextResponse.json({error: "Missing message"}, {status: 400});
  }

  try {
    const url = `${BASE_URL}/submissions/${params.id}/comments/`;

    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify(body),
      timeout: 20000,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Route] External API error response:", errorText);
      return NextResponse.json(
        {error: `Failed to add comment: ${errorText}`},
        {status: res.status}
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {status: 201});
  } catch (err) {
    console.error("[Route] Error adding comment:", (err as Error).message);
    return NextResponse.json(
      {error: "Internal server error", details: (err as Error).message},
      {status: 500}
    );
  }
}
