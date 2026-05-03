// SettingsSidebar.tsx
import React from "react";
import { LogIn, Moon, Sun, Plus, Minus } from "lucide-react";
import { ThemeMode, ThemeTokens } from "./useTheme";

export function SettingsSidebar({
  theme,
  onToggleTheme,
  onLogout,
  fontSize,
  onIncFontSize,
  onDecFontSize,
  minFontSize,
  maxFontSize,
  t,
}: {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  fontSize: number;
  onIncFontSize: () => void;
  onDecFontSize: () => void;
  minFontSize: number;
  maxFontSize: number;
  t: ThemeTokens;
}) {
  return (
    <div>
      <div className="sidebar-section">
        <SectionHeader t={t}>Theme</SectionHeader>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className={`ide-btn ${theme === "dark" ? "primary" : ""}`}
            style={{ flex: 1 }}
            onClick={() => theme !== "dark" && onToggleTheme()}
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </button>
          <button
            className={`ide-btn ${theme === "light" ? "primary" : ""}`}
            style={{ flex: 1 }}
            onClick={() => theme !== "light" && onToggleTheme()}
          >
            <Sun className="h-3.5 w-3.5" />
            Light
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <SectionHeader t={t}>Editor font size</SectionHeader>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "center",
          }}
        >
          <button
            className="ide-btn icon-only"
            onClick={onDecFontSize}
            disabled={fontSize <= minFontSize}
            title="Smaller"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span
            className="ide-mono"
            style={{
              fontSize: 13,
              minWidth: 36,
              textAlign: "center",
            }}
          >
            {fontSize}px
          </span>
          <button
            className="ide-btn icon-only"
            onClick={onIncFontSize}
            disabled={fontSize >= maxFontSize}
            title="Larger"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <button
          className="ide-btn"
          style={{ width: "100%" }}
          onClick={onLogout}
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function SectionHeader({
  children,
  t,
}: {
  children: React.ReactNode;
  t: ThemeTokens;
}) {
  return (
    <div
      style={{
        fontSize: 11,
        color: t.textMuted,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {children}
    </div>
  );
}