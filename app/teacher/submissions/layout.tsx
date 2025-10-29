// app/teacher/layout.tsx
"use client";

import React, {useState, createContext} from "react";

// interface Submission {
//   id: number;
//   student: {id: number; user: {username: string}};
//   lesson: {id: number; title: string};
//   language: string;
//   code_text: string;
//   status: "submitted" | "graded" | "revised";
//   score?: number;
//   feedback?: string;
//   correction_code?: string;
//   graded_by?: {id: number};
//   graded_at?: string;
//   comments: Comment[];
// }
// types.ts
export type SubmissionStatus = "submitted" | "graded" | "revised";

export interface Submission {
  id: number;
  student: {id: number; user: {username: string}};
  lesson: {id: number; title: string; class_name?: string};
  language: string;
  code_text: string;
  correction_code?: string;
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
  graded_by?: {id: number};
  graded_at?: string;
  comments: Comment[];
}
interface Comment {
  id: number;
  author: {username: string};
  author_role: "student" | "teacher";
  message: string;
  created_at: string;
}

export const SubmissionContext = createContext<{
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
}>({
  submissions: [],
  setSubmissions: () => {},
});

const mockSubmissions: Submission[] = [
  {
    id: 1,
    student: {id: 101, user: {username: "student1"}},
    lesson: {id: 201, title: "Introduction to Python"},
    language: "python",
    code_text: 'print("Hello, World!")',
    status: "submitted",
    comments: [
      {
        id: 1,
        author: {username: "teacher1"},
        author_role: "teacher",
        message: "Looks good!",
        created_at: "2023-10-01",
      },
    ],
  },
  {
    id: 2,
    student: {id: 102, user: {username: "student2"}},
    lesson: {id: 202, title: "JavaScript Basics", class_name: "Web Development"},
    language: "javascript",
    code_text: 'console.log("Hello, World!");',
    status: "graded",
    score: 95,
    feedback: "Excellent work!",
    correction_code: 'console.log("Corrected Hello, World!");',
    comments: [],
  },
  {
    id: 3,
    student: {id: 103, user: {username: "student3"}},
    lesson: {id: 203, title: "Java Fundamentals", class_name: "Programming 101"},
    language: "java",
    code_text: 'System.out.println("Hello, World!");',
    status: "submitted",
    comments: [],
  },
  {
    id: 4,
    student: {id: 104, user: {username: "student4"}},
    lesson: {id: 204, title: "HTML/CSS"},
    language: "html",
    code_text: "<h1>Hello, World!</h1>",
    status: "revised",
    comments: [],
  },
  {
    id: 5,
    student: {id: 105, user: {username: "student5"}},
    lesson: {id: 205, title: "SQL Queries", class_name: "Database Basics"},
    language: "sql",
    code_text: "SELECT * FROM users;",
    status: "submitted",
    comments: [],
  },
  {
    id: 5,
    student: {id: 105, user: {username: "student5"}},
    lesson: {id: 205, title: "SQL Queries", class_name: "Database Basics"},
    language: "sql",
    code_text: "SELECT * FROM users;",
    status: "submitted",
    comments: [],
  },
  // Add more mock submissions to demonstrate pagination
];

export default function TeacherLayout({children}: {children: React.ReactNode}) {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);

  return (
    <SubmissionContext.Provider value={{submissions, setSubmissions}}>
      {children}
    </SubmissionContext.Provider>
  );
}
