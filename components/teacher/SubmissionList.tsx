// components/SubmissionList.tsx
"use client";

import React, {useState, useContext} from "react";
import {SubmissionContext} from "../../app/teacher/submissions/layout";
import SubmissionItem from "./SubmissionItem";

const SubmissionList: React.FC = () => {
  const {submissions} = useContext(SubmissionContext);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2; // Number of submissions per page

  const totalPages = Math.ceil(submissions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubmissions = submissions.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      {paginatedSubmissions.map((submission) => (
        <SubmissionItem key={submission.id} submission={submission} />
      ))}
      <div className="flex justify-center mt-4">
        <button
          className="bg-gray-300 text-black px-4 py-2 mr-2 disabled:opacity-50"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}>
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="bg-gray-300 text-black px-4 py-2 ml-2 disabled:opacity-50"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default SubmissionList;
