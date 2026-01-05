// app/api/teacher/courses/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface Course {
  id: string;
  name: string;
  subject: string;
  classroom: string;
  description: string;
  isActive: boolean;
}

export async function GET(req: Request) {
  noStore();

  const {searchParams} = new URL(req.url);
  const courseType = searchParams.get("course_type"); // "private"

  const endpoint = "/learning/api/teacher/courses/";
  const fullUrl = `${BASE_URL}${endpoint}`;

  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {error: "Failed to fetch teacher courses"},
        {status: response.status}
      );
    }

    const data = JSON.parse(rawResponse);

    const normalizedData: Course[] = data.courses.map((course: any) => ({
      id: course.id.toString(),
      name: course.name || "",
      subject: course.subject || "",
      classroom: course.classroom || "",
      description: course.description || "",
      isActive: course.isActive ?? true,
    }));

    return NextResponse.json(normalizedData, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch teacher courses"},
      {status: 500}
    );
  }
}
