import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function POST(
  request: NextRequest,
  {params}: {params: {id: string}}
) {
  console.log(
    "[Route] Received POST request to /api/admin/parents/[id]/avatar"
  );
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
    const formData = await request.formData();
    const avatarFile = formData.get("avatar") as File;

    if (!avatarFile) {
      return NextResponse.json(
        {error: "Avatar file is required"},
        {status: 400}
      );
    }

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", avatarFile);

    console.log("[Route] Uploading avatar for parent", id);
    const url = `${BASE_URL}/api/parents/${id}/`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
      body: uploadFormData,
    });

    console.log("[Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API upload failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to upload avatar"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error uploading avatar:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
