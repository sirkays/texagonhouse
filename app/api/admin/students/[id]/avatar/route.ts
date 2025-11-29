// app/api/students/[id]/avatar/route.ts
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
  console.log("[Route] Received POST request to /api/students/[id]/avatar");
  const session = await getSession();
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {id} = params;
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file || !id) {
      return NextResponse.json(
        {error: "Student ID and image file are required"},
        {status: 400}
      );
    }

    console.log("[Route] Uploading avatar for student", id);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const res = await fetch(
      `${BASE_URL}/api/admin/students/${id}/set-avatar/`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "X-Session-Token": session.user.sessionToken,
        },
        body: uploadFormData,
      }
    );

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
