// components/SubmissionItem.tsx
"use client";

import React from "react";
import Link from "next/link";

interface SubmissionItemProps {
  submission: any; // Use Submission type
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({submission}) => {
  return (
    <div className="border p-4 mb-4 rounded">
      <h2 className="text-xl font-semibold">
        Submission by {submission.student.user.username} for Lesson:{" "}
        {submission.lesson.title}
      </h2>
      <p>Status: {submission.status}</p>
      <p>Language: {submission.language}</p>
      {submission.score && <p>Score: {submission.score}</p>}
      {submission.feedback && <p>Feedback: {submission.feedback}</p>}

      <Link href={`/teacher/submissions/${submission.id}/code`}>
        <button className="bg-blue-500 text-white px-4 py-2 mr-2">
          View Submitted Code
        </button>
      </Link>
      <Link href={`/teacher/submissions/${submission.id}/grade`}>
        <button className="bg-green-500 text-white px-4 py-2 mr-2">
          Grade Submission
        </button>
      </Link>
    </div>
  );
};

export default SubmissionItem;
