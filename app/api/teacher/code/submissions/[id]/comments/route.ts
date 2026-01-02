// app/code-ide/api/teacher/submissions/[id]/comments/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";
export async function GET(request: Request, {params}: {params: {id: string}}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }
  try {
    const backendUrl = `${BASE_URL}/code-ide/api/teacher/submissions/${params.id}/comments/`;
    const res = await fetch(backendUrl, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to fetch data"},
        {status: res.status}
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
export async function POST(request: Request, {params}: {params: {id: string}}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }
  try {
    const body = await request.json();
    const backendUrl = `${BASE_URL}/code-ide/api/teacher/submissions/${params.id}/comments/`;
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to create comment"},
        {status: res.status}
      );
    }
    return NextResponse.json(data, {status: 201});
  } catch (error) {
    console.error("[Route] Error posting data:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
