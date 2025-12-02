import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

async function handleRequest(
  request: NextRequest,
  method: string,
  id: string,
  sessionToken: string
) {
  const contentType = request.headers.get("content-type") || "";
  let fetchBody: BodyInit | null = null;

  let headers: HeadersInit = {
    Authorization: `Api-Key ${API_KEY}`,
    "X-Session-Token": sessionToken,
  };

  if (method === "DELETE") {
    // DELETE doesn’t need body or extra headers
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    fetchBody = formData;
  } else if (method === "PATCH") {
    const jsonBody = await request.json();
    fetchBody = JSON.stringify(jsonBody);
    headers["Content-Type"] = "application/json";
  }

  const url = `${BASE_URL}/api/subjects/${id}/`;
  const res = await fetch(url, {
    method,
    headers,
    body: fetchBody,
  });

  if (!res.ok) {
    let data: any;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    return NextResponse.json(
      {error: data.detail || `Failed to ${method.toLowerCase()} subject`},
      {status: res.status}
    );
  }

  if (method === "DELETE") {
    return new NextResponse(null, {status: 204});
  }

  const data = await res.json();
  return NextResponse.json(data);
}

// GET: Retrieve Subject by ID
export async function GET(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Subjects Route] GET /api/admin/subjects/[id]");
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    return await handleRequest(
      request,
      "GET",
      params.id,
      session.user.sessionToken
    );
  } catch (error) {
    console.error("[Subjects Route] Error fetching subject:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

// PATCH: Update Subject
export async function PATCH(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Subjects Route] PATCH /api/admin/subjects/[id]");
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    return await handleRequest(
      request,
      "PATCH",
      params.id,
      session.user.sessionToken
    );
  } catch (error) {
    console.error("[Subjects Route] Error updating subject:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

// DELETE: Delete Subject
export async function DELETE(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Subjects Route] DELETE /api/admin/subjects/[id]");
  const session = await getSession();

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    return await handleRequest(
      request,
      "DELETE",
      params.id,
      session.user.sessionToken
    );
  } catch (error) {
    console.error("[Subjects Route] Error deleting subject:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
