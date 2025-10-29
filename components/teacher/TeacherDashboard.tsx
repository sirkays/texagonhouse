// components/TeacherDashboard.tsx
"use client";

import React from "react";
import SubmissionList from "./SubmissionList";

const TeacherDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Code Submissions
      </h1>
      <SubmissionList />
    </div>
  );
};

export default TeacherDashboard;
