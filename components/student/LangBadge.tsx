// LangBadge.tsx
import React from "react";
import { LANG_COLORS, LANG_INITIALS } from "./types";

export function LangBadge({ lang, size = 14 }: { lang: string; size?: number }) {
  return (
    <span
      className="lang-icon-badge"
      style={{
        backgroundColor: LANG_COLORS[lang] || "#888",
        width: size,
        height: size,
        fontSize: size === 14 ? 8 : Math.floor(size * 0.55),
      }}
    >
      {LANG_INITIALS[lang] || (lang ? lang.slice(0, 2).toUpperCase() : "?")}
    </span>
  );
}