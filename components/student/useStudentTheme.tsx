"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type StudentTheme = "classic-minimalist" | "aero-premium";

interface StudentThemeContextType {
  theme: StudentTheme;
  setTheme: (theme: StudentTheme) => void;
}

const StudentThemeContext = createContext<StudentThemeContextType | undefined>(undefined);

const THEME_CHANGE_EVENT = "student-dashboard-theme-changed";

export function StudentThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<StudentTheme>("aero-premium");
  const [mounted, setMounted] = useState(false);

  const loadTheme = () => {
    try {
      const stored = localStorage.getItem("student-dashboard-theme");
      if (stored === "aero-premium" || stored === "classic-minimalist") {
        setThemeState(stored as StudentTheme);
      } else {
        // Default to Aero Premium for the glossy premium design
        setThemeState("aero-premium");
        localStorage.setItem("student-dashboard-theme", "aero-premium");
      }
    } catch (e) {
      console.warn("localStorage is not available: ", e);
    }
  };

  useEffect(() => {
    loadTheme();
    setMounted(true);

    const handleCustomChange = () => {
      loadTheme();
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleCustomChange);
    window.addEventListener("storage", handleCustomChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleCustomChange);
      window.removeEventListener("storage", handleCustomChange);
    };
  }, []);

  const setTheme = (newTheme: StudentTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("student-dashboard-theme", newTheme);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    } catch (e) {
      console.warn("localStorage is not writeable: ", e);
    }
  };

  // Safe hydration rendering
  return (
    <StudentThemeContext.Provider value={{ theme: mounted ? theme : "aero-premium", setTheme }}>
      {children}
    </StudentThemeContext.Provider>
  );
}

export function useStudentTheme() {
  const context = useContext(StudentThemeContext);
  if (context === undefined) {
    // Elegant fallback context in case it is used outside the provider (e.g. Profile Page)
    const [theme, setThemeState] = useState<StudentTheme>("aero-premium");
    
    const loadTheme = () => {
      try {
        const stored = localStorage.getItem("student-dashboard-theme");
        if (stored === "classic-minimalist" || stored === "aero-premium") {
          setThemeState(stored as StudentTheme);
        }
      } catch {}
    };

    useEffect(() => {
      loadTheme();

      const handleCustomChange = () => {
        loadTheme();
      };

      window.addEventListener(THEME_CHANGE_EVENT, handleCustomChange);
      window.addEventListener("storage", handleCustomChange);

      return () => {
        window.removeEventListener(THEME_CHANGE_EVENT, handleCustomChange);
        window.removeEventListener("storage", handleCustomChange);
      };
    }, []);

    const setTheme = (newTheme: StudentTheme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem("student-dashboard-theme", newTheme);
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
      } catch {}
    };

    return { theme, setTheme };
  }
  return context;
}

