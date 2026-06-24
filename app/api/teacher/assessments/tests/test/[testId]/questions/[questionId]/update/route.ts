import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";
import { normalizeMedia } from "@/lib/utils";

const NO_STORE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ testId: string; questionId: string }> }
) {
  noStore();

  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/questions/${params.questionId}/update/`;

  try {
    let processedBody: any;
    const contentType = req.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    if (isMultipart) {
      const formData = await req.formData();
      const nextFormData = new FormData();
      
      nextFormData.append("type", (formData.get("type") || "").toString());
      nextFormData.append("question", (formData.get("question") || "").toString());
      
      const optionsStr = formData.get("options");
      if (optionsStr) {
        nextFormData.append("options", optionsStr);
      }
      
      nextFormData.append("correctAnswer", (formData.get("correctAnswer") ?? "").toString());
      nextFormData.append("points", (formData.get("points") || "1").toString());
      nextFormData.append("explanation", (formData.get("explanation") || "").toString());
      nextFormData.append("difficulty", (formData.get("difficulty") || "Medium").toString());
      
      const imageFile = formData.get("image");
      if (imageFile instanceof File) {
        nextFormData.append("image", imageFile);
      }
      
      const clearImage = formData.get("clear_image");
      if (clearImage) {
        nextFormData.append("clear_image", clearImage);
      }

      processedBody = nextFormData;
    } else {
      const body = await req.json();
      processedBody = JSON.stringify({
        type: body.type || "",
        question: body.question || "",
        options: body.options || [],
        correctAnswer:
          body.correctAnswer ??
          (body.type === "multiple-choice"
            ? 0
            : body.type === "true-false"
            ? false
            : body.type === "short-answer"
            ? ""
            : ""),
        points: body.points || 0,
        explanation: body.explanation || "",
        difficulty: body.difficulty || "Medium",
      });
    }

    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "PUT",
      body: processedBody,
    });

    const responseContentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[QuestionUpdateAPI] Request failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired" },
          {
            status: 401,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Question update endpoint not found" },
          {
            status: 404,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to update question" },
        {
          status: response.status,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!responseContentType.includes("application/json")) {
      console.error("[QuestionUpdateAPI] Non-JSON response received:", responseContentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error("[QuestionUpdateAPI] Failed to parse JSON:", parseError);
      const res = NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    const processedData = {
      question: {
        id: data?.question?.id || "",
        type: data?.question?.type || "",
        question: data?.question?.question || "",
        points: data?.question?.points || 0,
        options: data?.question?.options || [],
        explanation: data?.question?.explanation || "",
        difficulty: data?.question?.difficulty || "Medium",
        correctAnswer:
          data?.question?.correctAnswer ??
          (data?.question?.type === "multiple-choice"
            ? 0
            : data?.question?.type === "true-false"
            ? false
            : data?.question?.type === "short-answer"
            ? ""
            : ""),
        image: data?.question?.image ? normalizeMedia(data.question.image) : null,
      },
      message: data?.message || "Question updated successfully.",
    };

    const res = NextResponse.json(processedData, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[QuestionUpdateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to update question", details: (error as Error).message },
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      }
    );
  }
}
