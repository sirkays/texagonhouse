// components/SubmissionItem.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";

interface SubmissionItemProps {
  submission: any;
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({ submission }) => {
  return (
    <div className="border border-[#EF7B55]/20 bg-white p-5 mb-5 rounded-xl shadow-sm hover:shadow transition-shadow">
      <h2 className="text-lg font-semibold text-slate-800">
        {submission.student.user.username} — {submission.lesson.title}
      </h2>

      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        <p>Status: <span className="font-medium text-slate-700">{submission.status}</span></p>
        <p>Language: <span className="font-medium text-slate-700">{submission.language}</span></p>
        {submission.score && <p>Score: <span className="font-medium text-[#EF7B55]">{parseFloat(submission.score) / 10}</span></p>}
        {submission.feedback && <p>Feedback: <span className="font-medium text-slate-700">{submission.feedback}</span></p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <Link href={`/teacher/submissions/${submission.id}/code`} className="flex-1">
          <Button className="w-full bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white font-medium text-sm py-2.5">
            View Code
          </Button>
        </Link>

        <Link href={`/teacher/submissions/${submission.id}/grade`} className="flex-1">
          <Button variant="outline" className="w-full border-[#EF7B55]/30 text-[#EF7B55] hover:bg-[#EF7B55]/10 font-medium text-sm py-2.5">
            Grade
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SubmissionItem;