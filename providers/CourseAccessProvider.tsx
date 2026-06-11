"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Course = {
  id: number;
  name: string;
  general_activation: boolean;
  general_activation_date: string | null;
  has_access: boolean;
  modules: any[];
};

interface CourseAccessContextType {
  courses: Course[];
  hasAccess: (courseId: number | string | undefined | null) => boolean;
  hasModuleAccess: (moduleId: number | string | undefined | null) => boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CourseAccessContext = createContext<CourseAccessContextType>({
  courses: [],
  hasAccess: () => true, // default to true to fail-safe
  hasModuleAccess: () => true,
  loading: true,
  refresh: async () => {},
});

export const CourseAccessProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/student/courses");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.courses)) {
          setCourses(data.courses);
        }
      }
    } catch (err) {
      console.error("[CourseAccessProvider] Failed to fetch student courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const hasAccess = (courseId: number | string | undefined | null) => {
    if (loading) return true; // fail-safe while loading
    if (courseId === undefined || courseId === null) return false;
    const cid = typeof courseId === "string" ? parseInt(courseId, 10) : courseId;
    if (isNaN(cid)) return false;
    const course = courses.find((c) => c.id === cid);
    return course ? course.has_access : false;
  };

  const hasModuleAccess = (moduleId: number | string | undefined | null) => {
    if (loading) return true; // fail-safe while loading
    if (moduleId === undefined || moduleId === null) return false;
    const mid = typeof moduleId === "string" ? parseInt(moduleId, 10) : moduleId;
    if (isNaN(mid)) return false;
    const course = courses.find((c) => c.modules && c.modules.some((m) => m.id === mid));
    return course ? course.has_access : false;
  };

  return (
    <CourseAccessContext.Provider value={{ courses, hasAccess, hasModuleAccess, loading, refresh: fetchCourses }}>
      {children}
    </CourseAccessContext.Provider>
  );
};

export const useCourseAccess = () => useContext(CourseAccessContext);
