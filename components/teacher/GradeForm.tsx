"use client";

import React, {useState} from "react";
import {gradeSubmission} from "@/lib/apis";

interface GradeFormProps {
  submissionId: string;
  onGradeSuccess: () => void;
}

const GradeForm: React.FC<GradeFormProps> = ({
  submissionId,
  onGradeSuccess,
}) => {
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [correctionCode, setCorrectionCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gradeSubmission(submissionId, {
        score,
        feedback,
        correction_code: correctionCode,
      });
      onGradeSuccess();
    } catch (error) {
      console.error("Error grading:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Score:</label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(parseFloat(e.target.value))}
          step="0.01"
        />
      </div>
      <div>
        <label>Feedback:</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      <div>
        <label>Correction Code:</label>
        <textarea
          value={correctionCode}
          onChange={(e) => setCorrectionCode(e.target.value)}
        />
      </div>
      <button type="submit">Submit Grade</button>
    </form>
  );
};

export default GradeForm;
