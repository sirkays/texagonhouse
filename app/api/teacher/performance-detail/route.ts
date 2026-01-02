// app/api/teacher/performance-detail/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

//const BASE_URL = "http://127.0.0.1:9098/assessments";
const BASE_URL = "https://texagonbackend.onrender.com/assessments";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface Student {
  studentName: string;
  studentId: string;
  email: string;
  classGrade: string;
}

interface Test {
  testTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  completionTime: number;
  submittedAt: string | null;
}

interface Answer {
  question: string;
  selected: string;
  correct: string;
  status: string;
}

interface PerformanceDetail {
  student: Student;
  test: Test;
  answers: Answer[];
}

export async function GET(req: Request) {
  noStore();
  const {searchParams} = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      {detail: "id required."},
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
  const endpoint = `/api/student-detail/performance/?id=${id}`;
  const fullUrl = `${BASE_URL}${endpoint}`;

  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      console.error(
        "[TeacherPerformanceDetailAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      if (response.status === 400) {
        return NextResponse.json(
          {detail: "id required."},
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          {detail: "Forbidden."},
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          {detail: "Not found."},
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      return NextResponse.json(
        {error: "Failed to fetch performance detail"},
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherPerformanceDetailAPI] Non-JSON response received:",
        contentType
      );
      return NextResponse.json(
        {error: "Invalid response format, expected JSON"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data: PerformanceDetail;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error(
        "[TeacherPerformanceDetailAPI] Failed to parse JSON:",
        parseError
      );
      return NextResponse.json(
        {error: "Invalid response format"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const normalizedData: PerformanceDetail = {
      student: {
        studentName: data.student.studentName || "",
        studentId: data.student.studentId || "",
        email: data.student.email || "",
        classGrade: data.student.classGrade || "N/A",
      },
      test: {
        testTitle: data.test.testTitle || "",
        score: data.test.score || 0,
        totalMarks: data.test.totalMarks || 0,
        percentage: data.test.percentage || 0,
        status: data.test.status || "",
        completionTime: data.test.completionTime || 0,
        submittedAt: data.test.submittedAt || null,
      },
      answers: data.answers.map((answer) => ({
        question: answer.question || "",
        selected: answer.selected || "",
        correct: answer.correct || "",
        status: answer.status || "",
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[TeacherPerformanceDetailAPI] Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch performance detail",
        details: (error as Error).message,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
