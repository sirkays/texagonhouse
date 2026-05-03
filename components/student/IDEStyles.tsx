// IDEStyles.tsx
//
// All the styled-jsx for the IDE shell, in one place. Pulled out of the
// main component so CodeEditor.tsx stays readable.

import React from "react";
import { ThemeTokens } from "./useTheme";

export function IDEStyles({
  t,
  isDark,
  fontSize,
}: {
  t: ThemeTokens;
  isDark: boolean;
  fontSize: number;
}) {
  return (
    <style jsx global>{`
      .ide-root {
        --ide-bg: ${t.bg};
        --ide-bg-alt: ${t.bgAlt};
        --ide-bg-panel: ${t.bgPanel};
        --ide-bg-hover: ${t.bgHover};
        --ide-bg-active: ${t.bgActive};
        --ide-border: ${t.border};
        --ide-border-muted: ${t.borderMuted};
        --ide-text: ${t.text};
        --ide-text-muted: ${t.textMuted};
        --ide-text-dim: ${t.textDim};
        --ide-accent: ${t.accent};
        --ide-accent-muted: ${t.accentMuted};
        --ide-success: ${t.success};
        --ide-danger: ${t.danger};
        --ide-warning: ${t.warning};

        font-family: "Geist", "Inter", -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
        font-feature-settings: "ss01", "cv11";
        background: var(--ide-bg);
        color: var(--ide-text);
      }

      .ide-mono {
        font-family: "JetBrains Mono", "Fira Code", "SF Mono", Menlo,
          Consolas, monospace;
        font-feature-settings: "calt", "liga";
      }

      .ide-root .cm-editor {
        background: ${isDark ? "#0d1117" : "#ffffff"} !important;
        font-family: "JetBrains Mono", "Fira Code", "SF Mono", Menlo,
          Consolas, monospace !important;
        font-size: ${fontSize}px !important;
        font-feature-settings: "calt", "liga";
      }
      .ide-root .cm-content,
      .ide-root .cm-line {
        font-size: ${fontSize}px !important;
      }
      .ide-root .cm-editor.cm-focused {
        outline: none !important;
      }
      .ide-root .cm-gutters {
        background: ${isDark ? "#0d1117" : "#ffffff"} !important;
        border-right: 1px solid ${t.borderMuted} !important;
        color: ${t.textDim} !important;
      }
      .ide-root .cm-activeLineGutter {
        background: ${isDark ? "#161b22" : "#f6f8fa"} !important;
        color: ${t.text} !important;
      }
      .ide-root .cm-activeLine {
        background: ${isDark ? "#161b2240" : "#f6f8fa80"} !important;
      }

      .resizer-x {
        width: 4px;
        cursor: col-resize;
        background: transparent;
        transition: background 0.15s;
      }
      .resizer-x:hover,
      .resizer-x.active {
        background: ${t.accent}40;
      }
      .resizer-y {
        height: 4px;
        cursor: row-resize;
        background: transparent;
        transition: background 0.15s;
      }
      .resizer-y:hover,
      .resizer-y.active {
        background: ${t.accent}40;
      }

      .activity-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${t.textMuted};
        cursor: pointer;
        transition: color 0.15s;
        position: relative;
        border: none;
        background: transparent;
      }
      .activity-icon:hover {
        color: ${t.text};
      }
      .activity-icon.active {
        color: ${t.text};
      }
      .activity-icon.active::before {
        content: "";
        position: absolute;
        left: 0;
        top: 8px;
        bottom: 8px;
        width: 2px;
        background: ${t.accent};
      }

      .file-tab {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px 0 12px;
        height: 36px;
        font-size: 12px;
        color: ${t.textMuted};
        background: transparent;
        border: none;
        border-right: 1px solid ${t.borderMuted};
        cursor: pointer;
        position: relative;
        font-family: inherit;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .file-tab:hover {
        color: ${t.text};
      }
      .file-tab.active {
        color: ${t.text};
        background: ${t.bg};
      }
      .file-tab.active::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: ${t.accent};
      }
      .file-tab .dirty-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${t.textMuted};
      }
      .file-tab-close {
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        background: transparent;
        border: none;
        color: ${t.textMuted};
        cursor: pointer;
        margin-left: 4px;
        opacity: 0;
        transition: opacity 0.12s, background 0.12s;
      }
      .file-tab:hover .file-tab-close,
      .file-tab.active .file-tab-close {
        opacity: 1;
      }
      .file-tab-close:hover {
        background: ${t.bgHover};
        color: ${t.text};
      }
      .file-tab-close.dirty {
        opacity: 1;
      }

      .lang-icon-badge {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: ${t.textMuted};
        padding: 6px 12px;
        background: ${t.bgPanel};
        border-bottom: 1px solid ${t.borderMuted};
        min-height: 28px;
      }
      .breadcrumb .crumb-sep {
        color: ${t.textDim};
      }
      .breadcrumb .crumb {
        color: ${t.textMuted};
      }
      .breadcrumb .crumb.last {
        color: ${t.text};
      }

      .status-bar {
        display: flex;
        align-items: center;
        height: 24px;
        padding: 0 12px;
        background: ${t.bgAlt};
        border-top: 1px solid ${t.borderMuted};
        font-size: 11px;
        color: ${t.textMuted};
        gap: 16px;
      }
      .status-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0 6px;
        height: 24px;
        background: transparent;
        border: none;
        color: ${t.textMuted};
        cursor: default;
        font-family: inherit;
        font-size: 11px;
      }
      .status-item.clickable {
        cursor: pointer;
      }
      .status-item.clickable:hover {
        background: ${t.bgHover};
        color: ${t.text};
      }

      .ide-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 28px;
        padding: 0 10px;
        font-size: 12px;
        font-weight: 500;
        border-radius: 4px;
        background: transparent;
        color: ${t.text};
        border: 1px solid ${t.border};
        cursor: pointer;
        transition: all 0.12s;
        font-family: inherit;
      }
      .ide-btn:hover:not(:disabled) {
        background: ${t.bgHover};
        border-color: ${t.textMuted};
      }
      .ide-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ide-btn.primary {
        background: ${t.accent};
        color: white;
        border-color: ${t.accent};
      }
      .ide-btn.primary:hover:not(:disabled) {
        background: #d96944;
        border-color: #d96944;
      }
      .ide-btn.icon-only {
        width: 28px;
        padding: 0;
      }
      .ide-btn.ghost {
        border-color: transparent;
      }
      .ide-btn.ghost:hover:not(:disabled) {
        background: ${t.bgHover};
      }

      .sidebar-section {
        padding: 12px;
      }
      .sidebar-heading {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: ${t.textDim};
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sidebar-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        font-size: 12px;
        color: ${t.text};
        cursor: pointer;
        border-radius: 3px;
        transition: background 0.1s;
        width: 100%;
        text-align: left;
        background: transparent;
        border: none;
        font-family: inherit;
      }
      .sidebar-item:hover {
        background: ${t.bgHover};
      }
      .sidebar-item.active {
        background: ${t.bgActive};
      }
      .sidebar-item .actions {
        margin-left: auto;
        opacity: 0;
        transition: opacity 0.1s;
        display: flex;
        gap: 2px;
      }
      .sidebar-item:hover .actions {
        opacity: 1;
      }
      .sidebar-item-action {
        padding: 2px;
        border-radius: 3px;
        color: ${t.textMuted};
        background: transparent;
        border: none;
        cursor: pointer;
      }
      .sidebar-item-action:hover {
        background: ${isDark ? "#30363d" : "#d0d7de"};
        color: ${t.text};
      }
      .sidebar-item-action:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .sidebar-item.folder-row {
        font-weight: 500;
      }

      .preview-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: white;
      }

      .console-output {
        font-family: "JetBrains Mono", "Fira Code", "SF Mono", Menlo,
          Consolas, monospace;
        font-size: 12px;
        line-height: 1.6;
        padding: 12px;
        color: ${t.text};
        white-space: pre-wrap;
        word-break: break-word;
        height: 100%;
        overflow: auto;
      }

      .ide-input {
        background: ${t.bgPanel};
        border: 1px solid ${t.border};
        color: ${t.text};
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 4px;
        height: 30px;
        width: 100%;
        font-family: inherit;
      }
      .ide-input:focus {
        outline: none;
        border-color: ${t.accent};
        box-shadow: 0 0 0 2px ${t.accent}25;
      }

      .scroll-thin::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .scroll-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      .scroll-thin::-webkit-scrollbar-thumb {
        background: ${isDark ? "#30363d" : "#d0d7de"};
        border-radius: 4px;
      }
      .scroll-thin::-webkit-scrollbar-thumb:hover {
        background: ${isDark ? "#484f58" : "#afb8c1"};
      }

      @media (max-width: 900px) {
        .ide-mobile-hide {
          display: none !important;
        }
      }

      kbd {
        display: inline-block;
        padding: 1px 6px;
        font-family: "JetBrains Mono", monospace;
        font-size: 11px;
        line-height: 1.4;
        color: ${t.text};
        background: ${t.bgPanel};
        border: 1px solid ${t.border};
        border-bottom-width: 2px;
        border-radius: 3px;
      }

      @keyframes ide-toast-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
  );
}