// components/TeacherDashboard.tsx
"use client";

import React from "react";
import SubmissionList from "./SubmissionList";

const TeacherDashboard: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <SubmissionList />
    </div>
  );
};

export default TeacherDashboard;
