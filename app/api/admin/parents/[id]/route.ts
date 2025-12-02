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
    // No body or additional headers for DELETE
  } else if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    fetchBody = formData;
  } else if (method === "PATCH") {
    const jsonBody = await request.json();
    fetchBody = JSON.stringify(jsonBody);
    headers["Content-Type"] = "application/json";
  }

  const url = `${BASE_URL}/api/parents/${id}/`;
  const res = await fetch(url, {
    method,
    headers,
    body: fetchBody,
  });

  if (!res.ok) {
    const data = await res.json();
    return NextResponse.json(
      {error: data.detail || `Failed to ${method.toLowerCase()} parent`},
      {status: res.status}
    );
  }

  if (method === "DELETE") {
    return new NextResponse(null, {status: 204});
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function GET(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received GET request to /api/admin/parents/[id]");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const {id} = params;

  try {
    console.log("[Route] Fetching parent", id);
    return await handleRequest(request, "GET", id, session.user.sessionToken);
  } catch (error) {
    console.error("[Route] Error fetching parent:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function PATCH(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received PATCH request to /api/admin/parents/[id]");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const {id} = params;

  try {
    console.log("[Route] Updating parent", id);
    return await handleRequest(request, "PATCH", id, session.user.sessionToken);
  } catch (error) {
    console.error("[Route] Error updating parent:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

export async function DELETE(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log("[Route] Received DELETE request to /api/admin/parents/[id]");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  const {id} = params;

  try {
    console.log("[Route] Deleting parent", id);
    return await handleRequest(
      request,
      "DELETE",
      id,
      session.user.sessionToken
    );
  } catch (error) {
    console.error("[Route] Error deleting parent:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
