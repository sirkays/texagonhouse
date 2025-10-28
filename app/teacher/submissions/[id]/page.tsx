import React from "react";
import {getSubmission, getComments} from "@/lib/apis";
import CodeViewer from "@/components/teacher/CodeViewer";
import GradeForm from "@/components/teacher/GradeForm";
import CommentList from "@/components/teacher/CommentList";
import CommentForm from "@/components/teacher/CommentForm";

interface Submission {
  id: number;
  code_text: string;
  language: string;
  status: string;
  score?: number;
  feedback?: string;
  correction_code?: string;
}

interface Comment {
  // As above
}

async function SubmissionDetailPage({params}: {params: {id: string}}) {
  const submission: Submission = await getSubmission(params.id);
  const comments: Comment[] = await getComments(params.id);

  const handleGradeSuccess = () => {
    // Revalidate or refresh page; use next revalidatePath if needed
    console.log("Graded successfully");
  };

  const handleCommentAdded = () => {
    // Revalidate
    console.log("Comment added");
  };

  return (
    <div>
      <h1>Submission {submission.id}</h1>

      <h2>Submitted Code</h2>
      <CodeViewer code={submission.code_text} language={submission.language} />

      <h2>Grade</h2>
      {submission.status === "graded" ? (
        <div>
          <p>Score: {submission.score}</p>
          <p>Feedback: {submission.feedback}</p>
          {submission.correction_code && (
            <>
              <h3>Correction Code</h3>
              <CodeViewer
                code={submission.correction_code}
                language={submission.language}
              />
            </>
          )}
        </div>
      ) : (
        <GradeForm
          submissionId={params.id}
          onGradeSuccess={handleGradeSuccess}
        />
      )}

      <h2>Comments</h2>
      <CommentList comments={comments} />
      <CommentForm
        submissionId={params.id}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}

export default SubmissionDetailPage;
