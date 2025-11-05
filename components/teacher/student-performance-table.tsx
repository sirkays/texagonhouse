// components/teacher/student-performance-table.tsx
import React, {useState} from "react";
import {useRouter} from "next/router"; // For Next.js; use 'react-router-dom' for React Router
import {Eye} from "lucide-react"; // Assuming Lucide icons; adjust for your icon library
// import {User, Test, Performance} from "../../types"; // Adjust path to your types file

interface StudentPerformanceTableProps {
  users: User[];
  tests: Test[];
  performances: Performance[];
}

interface User {
  id: string | number;
  name: string;
}

interface Test {
  id: string | number;
  title: string;
}

interface Performance {
  id: string | number;
  userId: string | number;
  testId: string | number;
  score: number;
}

const StudentPerformanceTable: React.FC<StudentPerformanceTableProps> = ({
  users,
  tests,
  performances,
}) => {
  // State variables for filtering and sorting
  const [studentFilter, setStudentFilter] = useState<string>(""); // Filter by student name
  const [isSaving, setIsSaving] = useState<boolean>(false); // Loading/saving state
  const [sortField, setSortField] = useState<keyof Performance>("score"); // Field to sort by
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Sort order

  const router = useRouter(); // Router for navigation

  // Filter and sort performances
  const filteredPerformances = performances
    .filter((performance) =>
      studentFilter
        ? users
            .find((user) => user.id === performance.userId)
            ?.name.toLowerCase()
            .includes(studentFilter.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  // Handle sorting toggle
  const handleSort = (field: keyof Performance) => {
    if (isSaving) return; // Prevent sorting while saving
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="student-performance-table">
      {/* Filter Input */}
      <input
        type="text"
        value={studentFilter}
        onChange={(e) => setStudentFilter(e.target.value)}
        placeholder="Filter by student name"
        disabled={isSaving}
      />

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("userId")}>
              Student{" "}
              {sortField === "userId" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("score")}>
              Score {sortField === "score" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("testId")}>
              Test {sortField === "testId" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPerformances.map((performance: Performance) => {
            const user = users.find((u) => u.id === performance.userId);
            const test = tests.find((t) => t.id === performance.testId);
            return (
              <tr key={performance.id}>
                <td>{user?.name || "Unknown"}</td>
                <td>{performance.score}</td>
                <td>{test?.title || "Unknown"}</td>
                <td>
                  <button
                    onClick={() =>
                      router.push(`/performance/${performance.id}`)
                    }
                    disabled={isSaving}>
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentPerformanceTable;
