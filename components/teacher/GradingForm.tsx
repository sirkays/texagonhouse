// components/GradingForm.tsx
"use client";

import React, {useState} from "react";
import Editor from "@monaco-editor/react";

interface GradingFormProps {
  submission: any;
  onSubmit: (updatedSubmission: any) => void;
  onCancel: () => void;
}

const GradingForm: React.FC<GradingFormProps> = ({
  submission,
  onSubmit,
  onCancel,
}) => {
  const [score, setScore] = useState(submission.score || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [correctionCode, setCorrectionCode] = useState(
    submission.correction_code || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...submission,
      score: parseFloat(score),
      feedback,
      correction_code: correctionCode,
      status: "graded",
    };
    onSubmit(updated);
    onCancel();
  };

  return (
    <form className="mt-4" onSubmit={handleSubmit}>
      <div className="mb-2">
        <label>Score:</label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-2">
        <label>Feedback:</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-2">
        <label>Correction Code:</label>
        <Editor
          height="400px"
          language={submission.language}
          value={correctionCode}
          onChange={(value) => setCorrectionCode(value || "")}
          options={{
            minimap: {enabled: false},
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 mr-2">
        Submit Grade
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="bg-red-500 text-white px-4 py-2">
        Cancel
      </button>
    </form>
  );
};

export default GradingForm;
