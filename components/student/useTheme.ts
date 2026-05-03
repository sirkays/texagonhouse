// useTheme.ts
import { useEffect, useState, useMemo } from "react";

export type ThemeMode = "dark" | "light";

export type ThemeTokens = {
  bg: string;
  bgAlt: string;
  bgPanel: string;
  bgHover: string;
  bgActive: string;
  border: string;
  borderMuted: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentMuted: string;
  success: string;
  danger: string;
  warning: string;
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("code-ide-theme");
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("code-ide-theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";
  const tokens: ThemeTokens = useMemo(
    () => ({
      bg: isDark ? "#0d1117" : "#ffffff",
      bgAlt: isDark ? "#010409" : "#f6f8fa",
      bgPanel: isDark ? "#161b22" : "#ffffff",
      bgHover: isDark ? "#1f242c" : "#f3f4f6",
      bgActive: isDark ? "#22272e" : "#eaeef2",
      border: isDark ? "#30363d" : "#d0d7de",
      borderMuted: isDark ? "#21262d" : "#e6e8ec",
      text: isDark ? "#e6edf3" : "#1f2328",
      textMuted: isDark ? "#7d8590" : "#656d76",
      textDim: isDark ? "#484f58" : "#8c959f",
      accent: "#EF7B55",
      accentMuted: isDark ? "#EF7B5520" : "#EF7B5515",
      success: isDark ? "#3fb950" : "#1a7f37",
      danger: isDark ? "#f85149" : "#cf222e",
      warning: isDark ? "#d29922" : "#9a6700",
    }),
    [isDark]
  );

  return { theme, isDark, toggleTheme, t: tokens };
}