import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function POST(req: Request, context: { params: Promise<{ testId: string }> }) {
  noStore();
  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/duplicate/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TestDuplicateAPI] Initiating POST request to:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TestDuplicateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TestDuplicateAPI] No session token found");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
    });

    console.log("[TestDuplicateAPI] Response status:", response.status);
    const rawResponse = await response.text();
    console.log("[TestDuplicateAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[TestDuplicateAPI] Request failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) return NextResponse.json({ error: "Session expired" }, { status: 401 });
      return NextResponse.json({ error: "Failed to duplicate test" }, { status: response.status });
    }

    const data = JSON.parse(rawResponse);
    const processedData = {
      ...data,
      test: {
        ...data.test,
        questions: data.test.questions?.map((q: any) => ({
          ...q,
          correctAnswer: q.correctAnswer ?? (q.type === "multiple-choice" ? 0 : q.type === "true-false" ? "true" : ""),
          options: q.options || [],
          explanation: q.explanation || "",
          difficulty: q.difficulty || "Medium",
        })) || [],
      },
    };

    console.log("[TestDuplicateAPI] Test duplicated successfully:", processedData);
    return NextResponse.json(processedData, { status: 201 });
  } catch (error) {
    console.error("[TestDuplicateAPI] Request error:", error);
    return NextResponse.json({ error: "Failed to duplicate test", details: error.message }, { status: 500 });
  }
}