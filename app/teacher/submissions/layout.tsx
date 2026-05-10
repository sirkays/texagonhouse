// app/teacher/layout.tsx
"use client";

import React, {useState, createContext} from "react";

export type SubmissionStatus = "submitted" | "graded" | "revised";

export interface Submission {
  id: number;
  title?: string | null;
  student_name?: string;
  lesson_title?: string;
  course_name?: string;
  class_name?: string | null;
  score?: number | null;
  feedback?: string;
  status: SubmissionStatus;
  graded_at?: string;
  file_count?: number;
  file_languages?: string[];
  file_names?: string[];
  comments?: Comment[];
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
    title: "Hello World Project",
    student_name: "Student One",
    lesson_title: "Introduction to Python",
    course_name: "Python Basics",
    status: "submitted",
    file_count: 1,
    file_languages: ["python"],
    file_names: ["main.py"],
  },
  {
    id: 2,
    title: "JS Basics Exercise",
    student_name: "Student Two",
    lesson_title: "JavaScript Basics",
    course_name: "Web Dev",
    class_name: "Web Development",
    status: "graded",
    score: 95,
    feedback: "Excellent work!",
    file_count: 1,
    file_languages: ["javascript"],
    file_names: ["index.js"],
  },
  {
    id: 3,
    title: "Java Fundamentals",
    student_name: "Student Three",
    lesson_title: "Java Fundamentals",
    course_name: "Programming 101",
    class_name: "Programming 101",
    status: "submitted",
    file_count: 1,
    file_languages: ["java"],
    file_names: ["Main.java"],
  },
  {
    id: 4,
    title: "Login Page",
    student_name: "Student Four",
    lesson_title: "HTML/CSS",
    course_name: "Frontend",
    status: "revised",
    file_count: 3,
    file_languages: ["html", "css", "javascript"],
    file_names: ["login.html", "login.css", "login.js"],
  },
];

export default function TeacherLayout({children}: {children: React.ReactNode}) {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);

  return (
    <SubmissionContext.Provider value={{submissions, setSubmissions}}>
      {children}
    </SubmissionContext.Provider>
  );
}
