import React from "react";
import {getSubmissions} from "@/lib/apis";
import Link from "next/link";

interface Submission {
  id: number;
  student: {id: number /* other fields */};
  lesson: {id: number /* other fields */};
  language: string;
  status: "submitted" | "graded" | "revised";
  created_at: string;
}

async function SubmissionsPage() {
  const submissions: Submission[] = await getSubmissions();

  return (
    <div>
      <h1>Code Submissions</h1>
      <ul>
        {submissions.map((sub) => (
          <li key={sub.id}>
            <Link href={`/teacher/submissions/${sub.id}`}>
              Submission {sub.id} - Student {sub.student.id} - Lesson{" "}
              {sub.lesson.id} - Status: {sub.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubmissionsPage;
