// SearchSidebar.tsx
import React, { useState } from "react";
import { Snippet } from "./types";
import { ThemeTokens } from "./useTheme";
import { LangBadge } from "./LangBadge";

export function SearchSidebar({
  snippets,
  onSelect,
  t,
}: {
  snippets: Snippet[];
  onSelect: (s: Snippet) => void;
  t: ThemeTokens;
}) {
  const [q, setQ] = useState("");

  const results = q
    ? snippets.filter(
        (s) =>
          s.title.toLowerCase().includes(q.toLowerCase()) ||
          s.code_text.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  return (
    <div>
      <div className="sidebar-section">
        <input
          type="text"
          placeholder="Search snippets & content..."
          className="ide-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>
      <div className="sidebar-section" style={{ paddingTop: 0 }}>
        {!q ? (
          <div
            style={{
              fontSize: 11,
              color: t.textDim,
              padding: "8px 4px",
              textAlign: "center",
            }}
          >
            Type to search across all your snippets
          </div>
        ) : results.length === 0 ? (
          <div
            style={{
              fontSize: 11,
              color: t.textDim,
              padding: "8px 4px",
              textAlign: "center",
            }}
          >
            No results
          </div>
        ) : (
          results.map((s) => (
            <button
              key={s.id}
              className="sidebar-item"
              onClick={() => onSelect(s)}
            >
              <LangBadge lang={s.language} />
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 12,
                }}
              >
                {s.title}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}