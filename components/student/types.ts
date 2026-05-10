// types.ts
// Shared types across the IDE component tree.

export type LangKey = "javascript" | "python" | "html" | "css";

export type LangConfig = {
  name: string;
  ext: string;
  judgeId: number | null;
  template: string;
};

export type Lesson = { id: string; title: string };

export type Folder = {
  id: number;
  name: string;
  parent: number | null;
  path: string;
  snippet_count: number;
  file_count: number;
  created_at: string;
  updated_at: string;
};

export type Snippet = {
  id: number;
  lesson: number | null;
  folder: number | null;
  title: string;
  language: LangKey;
  code_text: string;
  meta: any;
  created_at: string;
  updated_at: string;
};

export type UploadedFile = {
  id: number;
  created_at: string;
  updated_at: string;
  student: number;
  lesson: number | null;
  folder: number | null;
  label: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  url: string;
};

export type Comment = {
  id: number;
  author: number;
  author_role: "student" | "teacher";
  author_name: string;
  message: string;
  created_at: string;
};

export type ProjectFile = {
  id: number;
  path: string;
  language: string;
  code_text: string;
  correction_code?: string;
};

export type Submission = {
  id: number;
  title?: string | null;
  lesson: number;
  student: number;
  status: "submitted" | "graded" | "revised";
  score: string | null;
  feedback: string;
  graded_by_id?: number | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
  files: ProjectFile[];
  comments: Comment[];
  // Derived convenience — first file's language (for display/badge)
  language?: string;
};

// ─── Tab model ───────────────────────────────────────────────────────────
//
// A tab represents one open document in the editor. Tabs are NOT bound to
// languages — you can have many tabs of the same language, and each tab
// has its own buffer, dirty state, and backend identity.
//
// `kind` tells us what backend object this tab represents:
//   - "snippet"     → linked to a saved CodeSnippet (snippetId set)
//   - "submission"  → loaded from a CodeSubmission (submissionId set)
//   - "upload"      → loaded from a CodeFile (uploadId set, read-only-ish)
//   - "scratch"     → unsaved; not yet linked to anything
export type TabKind = "snippet" | "submission" | "upload" | "scratch";

export type Tab = {
  id: string;                    // local uuid, never sent to backend
  kind: TabKind;
  language: LangKey;
  title: string;                 // filename (no extension)
  code: string;                  // current buffer
  savedCode: string;             // last saved buffer; dirty = code !== savedCode
  snippetId: number | null;      // CodeSnippet id (set when persisted)
  submissionId: number | null;   // CodeSubmission id (set when loaded from one)
  uploadId: number | null;       // CodeFile id (set when loaded from upload)
  folderId: number | null;       // current folder
  lessonId: string;              // selected lesson for this tab
  submissionTitle: string;       // title used when submitting (separate from filename)
  isImagePreview?: boolean;
  imageUrl?: string;
};

export type Toast = {
  id: number;
  message: string;
  kind: "info" | "success" | "error";
};

export type SidebarPanel = "files" | "submissions" | "search" | "settings";
export type BottomPanel = "console" | "preview" | null;
export type InlinePanel = null | "save" | "submit" | "stdin" | "shortcuts" | "newFolder" | "newFile";

// LANGUAGE configs — exported once, imported everywhere.
export const LANGUAGES: Record<LangKey, LangConfig> = {
  javascript: {
    name: "JavaScript",
    ext: "js",
    judgeId: 63,
    template: `console.log("Hello, World!");`,
  },
  python: {
    name: "Python",
    ext: "py",
    judgeId: 71,
    template: `print("Hello, World!")`,
  },
  html: {
    name: "HTML",
    ext: "html",
    judgeId: null,
    template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My page</title>
  <link rel="stylesheet" href="untitled.css" />
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit me and hit Run.</p>
  <script src="untitled.js"></script>
</body>
</html>`,
  },
  css: {
    name: "CSS",
    ext: "css",
    judgeId: null,
    template: `body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
  color: #1f2328;
}

h1 {
  color: #EF7B55;
}`,
  },
};

export const LANG_COLORS: Record<string, string> = {
  javascript: "#F7DF1E",
  python: "#3776AB",
  html: "#E34F26",
  css: "#264DE4",
};

export const LANG_INITIALS: Record<string, string> = {
  javascript: "JS",
  python: "PY",
  html: "HT",
  css: "CS",
};

// Detect language from a filename's extension.
export function detectLangFromName(name: string): LangKey {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext === "js" || ext === "jsx") return "javascript";
  if (ext === "py") return "python";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "css") return "css";
  return "javascript";
}

// Generate a stable-ish unique id for tabs (not cryptographic)
export function makeTabId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

