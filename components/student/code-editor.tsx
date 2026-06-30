// CodeEditor.tsx
//
// Main IDE component, rewritten on top of useTabs() — the per-language
// state machinery is gone. Each open document is now an independent Tab,
// and the toolbar / status bar / save/submit panels read from the active
// tab instead of a parallel map keyed by language.
//
// Issues addressed in this rewrite:
//  #1 — "Update" button reads from the active tab's `submissionId`. New
//        tab → no submissionId → button says "Submit", not "Update".
//  #2 — "New file" calls openNewTab() which appends a tab; the current
//        tab is not clobbered.
//  #3 — Folder tree in Explorer; folder CRUD wired to backend.
//  #4 — Save sends {title, language, folder} to backend; backend dedupes
//        on (student, title, language, folder) — see views.py.
//  #5 — Submissions panel paginates with Load more / Prev / Next.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Download,
  Copy,
  RotateCcw,
  AlertCircle,
  LogIn,
  Send,
  Save,
  ExternalLink,
  Loader2,
  Maximize2,
  FolderOpen,
  GraduationCap,
  Search,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ChevronRight,
  X,
  Circle,
  Terminal,
  Eye,
  Keyboard,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { githubLight } from "@uiw/codemirror-theme-github";

import {
  Folder,
  Lesson,
  Snippet,
  Submission,
  UploadedFile,
  Comment,
  Tab,
  LangKey,
  LANGUAGES,
  InlinePanel,
  SidebarPanel,
  BottomPanel,
  Toast,
} from "./types";
import { useTheme } from "./useTheme";
import { useTabs } from "./useTabs";
import { IDEStyles } from "./IDEStyles";
import { LangBadge } from "./LangBadge";
import { FilesSidebar } from "./FilesSidebar";
import { SubmissionsSidebar } from "./SubmissionsSidebar";
import { SearchSidebar } from "./SearchSidebar";
import { SettingsSidebar } from "./SettingsSidebar";
import { useCourseAccess } from "@/providers/CourseAccessProvider";

const codeMirrorExtensions = {
  javascript: [javascript()],
  python: [python()],
  html: [html()],
  css: [css()],
} as const;

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export function CodeEditor() {
  // ─── Theme ──────────────────────────────────────────────────────────────
  const { theme, isDark, toggleTheme, t } = useTheme();
  const { hasModuleAccess } = useCourseAccess();

  const isLessonAccessible = (lessonId: string | number | undefined | null) => {
    if (!lessonId) return true;
    const lesson = lessons.find((l) => String(l.id) === String(lessonId));
    if (!lesson) return true;
    return hasModuleAccess(lesson.module);
  };

  // ─── Tabs (replaces all per-language state) ─────────────────────────────
  const {
    tabs,
    activeTab,
    activeId,
    setActiveId,
    updateTab,
    updateActiveTab,
    openNewTab,
    closeTab,
    openSnippet,
    openSubmission,
    openUploadAsTab,
    isDirty,
    hasAnyUnsaved,
    buildPreviewFilesystem,
  } = useTabs();



  // VS Code-style defaults: Python uses 4 spaces (PEP 8), others use 2.
  const INDENT_BY_LANG: Record<LangKey, { size: number; unit: string }> = {
    python: { size: 4, unit: "    " },
    javascript: { size: 2, unit: "  " },
    html: { size: 2, unit: "  " },
    css: { size: 2, unit: "  " },
  };

  // ─── Session ────────────────────────────────────────────────────────────
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Data lists ─────────────────────────────────────────────────────────
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // ─── Layout ─────────────────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<SidebarPanel>("files");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [bottomHeight, setBottomHeight] = useState(220);
  const [bottomPanel, setBottomPanel] = useState<BottomPanel>("console");
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);

  // ─── Editor state ───────────────────────────────────────────────────────
  const [output, setOutput] = useState("");
  const [webConsole, setWebConsole] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [executionError, setExecutionError] = useState("");
  const [syntaxError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const runIdRef = useRef(0);

  // ─── Preview navigation state ──────────────────────────────────────────
  // Stores the virtual filesystem from the last Run so that in-preview
  // <a href="page.html"> navigation can fully resolve each linked page's
  // CSS and JS — exactly like VS Code Live Server.
  const previewFsRef = useRef<Record<string, { content: string; lang: LangKey }>>({});
  const [previewHistory, setPreviewHistory] = useState<string[]>([]);
  const [previewCurrentPage, setPreviewCurrentPage] = useState<string>("");

  const [fontSize, setFontSize] = useState(13);
  const minFontSize = 10;
  const maxFontSize = 24;
  useEffect(() => {
    try {
      const stored = localStorage.getItem("code-ide-font-size");
      if (stored) {
        const n = parseInt(stored, 10);
        if (!isNaN(n) && n >= minFontSize && n <= maxFontSize) setFontSize(n);
      }
    } catch { }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("code-ide-font-size", String(fontSize));
    } catch { }
  }, [fontSize]);
  const incFontSize = () => setFontSize((f) => Math.min(maxFontSize, f + 1));
  const decFontSize = () => setFontSize((f) => Math.max(minFontSize, f - 1));

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // ─── Inline panel (save / submit / stdin / shortcuts / newFolder) ──────
  const [inlinePanel, setInlinePanel] = useState<InlinePanel>(null);
  const closeInlinePanel = () => setInlinePanel(null);

  // Save panel
  const [saveFileName, setSaveFileName] = useState("");
  const [saveFolderId, setSaveFolderId] = useState<string>(""); // '' = root
  const [isSaving, setIsSaving] = useState(false);

  // Submit panel
  const [submitDraftTitle, setSubmitDraftTitle] = useState("");
  const [submitDraftLesson, setSubmitDraftLesson] = useState("");
  const [submitSelectedTabIds, setSubmitSelectedTabIds] = useState<Set<string>>(
    new Set()
  );
  const [isSubmittingEditor, setIsSubmittingEditor] = useState(false);
  const isDraftLessonLocked = submitDraftLesson ? !isLessonAccessible(submitDraftLesson) : false;

  // Stdin panel
  const [pythonInputPrompts, setPythonInputPrompts] = useState<string[]>([]);
  const [pythonInputValues, setPythonInputValues] = useState<string[]>([]);
  const pendingStdinRef = useRef<((stdin: string) => void) | null>(null);

  // New folder panel
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<number | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);

  // New file panel — remembers which folder the new tab should land in
  // (null = root). Opened from the "+" tab button or any folder's "new file"
  // action; the user picks a language before the tab is created.
  const [newFileFolderId, setNewFileFolderId] = useState<number | null>(null);

  // ─── Toasts ─────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const pushToast = (message: string, kind: Toast["kind"] = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const showCustomAlert = (message: string) => {
    const m = message.toLowerCase();
    const kind: Toast["kind"] =
      m.includes("fail") || m.includes("error") || m.includes("invalid")
        ? "error"
        : m.includes("success") ||
          m.includes("submitted") ||
          m.includes("saved") ||
          m.includes("copied") ||
          m.includes("uploaded") ||
          m.includes("deleted") ||
          m.includes("updated") ||
          m.includes("created")
          ? "success"
          : "info";
    pushToast(message, kind);
  };

  const [pendingConfirm, setPendingConfirm] = useState<{
    message: string;
    callback: () => Promise<void>;
  } | null>(null);
  const [confirmRunning, setConfirmRunning] = useState(false);
  const showCustomConfirm = (
    message: string,
    callback: () => Promise<void>
  ) => {
    setPendingConfirm({ message, callback });
  };

  // ─── Loading-state per-item ────────────────────────────────────────────
  const [snippetLoadingId, setSnippetLoadingId] = useState<number | null>(null);
  const [deletingSnippetId, setDeletingSnippetId] = useState<number | null>(
    null
  );
  const [fileLoading, setFileLoading] = useState<number | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track which folder a multi-file upload should land in.
  // null = root.
  const uploadTargetFolderRef = useRef<number | null>(null);

  // ─── Activity bar handlers ─────────────────────────────────────────────
  const handleActivityClick = (panel: SidebarPanel) => {
    if (activePanel === panel && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    } else {
      setActivePanel(panel);
      setSidebarCollapsed(false);
    }
  };

  // ─── Sidebar / bottom resize ────────────────────────────────────────────
  useEffect(() => {
    if (!isResizingSidebar) return;
    const onMove = (e: MouseEvent) => {
      const next = Math.max(220, Math.min(500, e.clientX - 48));
      setSidebarWidth(next);
    };
    const onUp = () => setIsResizingSidebar(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    if (!isResizingBottom) return;
    const onMove = (e: MouseEvent) => {
      const fromBottom = window.innerHeight - e.clientY;
      const next = Math.max(120, Math.min(window.innerHeight - 200, fromBottom));
      setBottomHeight(next);
    };
    const onUp = () => setIsResizingBottom(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizingBottom]);

  // ─── beforeunload guard ────────────────────────────────────────────────
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasAnyUnsaved) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasAnyUnsaved]);

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "Escape" && inlinePanel) {
        const target = e.target as HTMLElement;
        const isField =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.tagName === "SELECT";
        if (!isField) {
          e.preventDefault();
          if (inlinePanel === "stdin") {
            pendingStdinRef.current = null;
            setIsRunning(false);
          }
          setInlinePanel(null);
        }
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeTab && !activeTab.isImagePreview) openSavePanel();
      } else if (mod && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) runCode();
      } else if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarCollapsed((c) => !c);
      } else if (mod && e.key === "/") {
        e.preventDefault();
        setInlinePanel((p) => (p === "shortcuts" ? null : "shortcuts"));
      } else if (mod && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setBottomPanel((p) => (p === null ? "console" : null));
      } else if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        // Open the language picker so the user explicitly chooses
        // JS / Python / HTML / CSS instead of inheriting the active tab.
        handleNewFile(null);
      } else if (mod && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activeId) closeTab(activeId);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRunning, inlinePanel, activeTab, activeId, closeTab]);

  // ─── Helper: navigate the preview to a different HTML page ────────────
  // Used both by runCode (initial render) and by in-iframe <a> click
  // navigation. Each call fully processes the target page through
  // buildWebDoc so its CSS / JS / sub-links all resolve correctly.
  const navigatePreview = (pageName: string, pushHistory = true) => {
    const fs = previewFsRef.current;
    const normalizePath = (p: string) =>
      p.replace(/^\.?\//, "").split(/[?#]/)[0].toLowerCase();
    const key = normalizePath(pageName);
    const entry = fs[key];
    if (!entry || entry.lang !== "html") return;

    if (pushHistory && previewCurrentPage) {
      setPreviewHistory((prev) => [...prev, previewCurrentPage]);
    }
    setPreviewCurrentPage(key);
    const processed = buildWebDoc(entry.content, fs, runIdRef.current);
    setHtmlPreview(processed);
  };

  const handlePreviewBack = () => {
    setPreviewHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const target = next.pop()!;
      navigatePreview(target, false);
      return next;
    });
  };

  const handlePreviewRefresh = () => {
    if (previewCurrentPage) {
      navigatePreview(previewCurrentPage, false);
    }
  };

  // ─── Iframe message bridge ─────────────────────────────────────────────
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || data.source !== "web-iframe") return;
      if (data.runId !== runIdRef.current) return;

      // ── In-preview navigation: student clicked <a href="page.html"> ──
      if (data.type === "navigate") {
        navigatePreview(data.message);
        return;
      }

      const line =
        data.type === "error"
          ? `❌ ${data.message}`
          : data.type === "warn"
            ? `⚠ ${data.message}`
            : data.message;
      setWebConsole((prev) => (prev ? prev + "\n" + line : line));
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [previewCurrentPage]);

  // ─── Auth + initial data ────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(false);
  }, [session, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetchLessons(),
      fetchSnippets().then(setMySnippets).catch(() => setMySnippets([])),
      fetchFolders().then(setFolders).catch(() => setFolders([])),
      fetchSubmissions()
        .then(setMySubmissions)
        .catch(() => setMySubmissions([])),
      fetch("/api/code-ide/uploads")
        .then((res) => (res.ok ? res.json() : []))
        .then(setUploadedFiles)
        .catch(() => setUploadedFiles([])),
    ]).catch(() => { });
  }, [status]);

  // ─── API helpers ────────────────────────────────────────────────────────
  const fetchLessons = async () => {
    try {
      const params = new URLSearchParams({ freezed: "1" });
      const res = await fetch(`/api/student/lessons?${params.toString()}`);
      if (!res.ok) {
        // Surface the status — silent failures are how this kind of bug
        // (empty dropdown with no toast) lives undetected.
        const body = await res.text().catch(() => "");
        // eslint-disable-next-line no-console
        console.warn("[IDE] /api/student/lessons returned", res.status, body);
        showCustomAlert(`Failed to load lessons (${res.status})`);
        setLessons([]);
        return;
      }
      const data = await res.json();
      // Be liberal about response shape. Different deployments wrap the
      // list in different envelopes; cover the common ones.
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.lessons)
              ? data.lessons
              : [];
      // eslint-disable-next-line no-console
      console.debug("[IDE] lessons loaded:", list.length, list.slice(0, 3));
      const mapped = list
        .map((l: any) => ({
          id: l && l.id != null ? String(l.id) : "",
          title:
            l?.title || l?.name || l?.topic || l?.label || `Lesson ${l?.id ?? "?"}`,
          module: l?.module,
        }))
        .filter((l) => l.id);
      setLessons(mapped);
      if (mapped.length === 0) {
        showCustomAlert(
          "No lessons available for your account yet. Ask your teacher to assign one."
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[IDE] fetchLessons threw:", err);
      showCustomAlert("Failed to load lessons");
      setLessons([]);
    }
  };

  const fetchSnippets = async (lessonId?: string): Promise<Snippet[]> => {
    const u = new URL("/api/code-ide/snippets", window.location.origin);
    if (lessonId) u.searchParams.set("lesson", lessonId);
    const r = await fetch(u);
    if (!r.ok) throw new Error("Failed to fetch snippets");
    return r.json();
  };

  const fetchSnippetDetail = async (id: number): Promise<Snippet> => {
    const r = await fetch(`/api/code-ide/snippets/${id}`);
    if (!r.ok) throw new Error("Failed to fetch snippet detail");
    return r.json();
  };

  const fetchFolders = async (): Promise<Folder[]> => {
    const r = await fetch("/api/code-ide/folders");
    if (!r.ok) throw new Error("Failed to fetch folders");
    return r.json();
  };

  const fetchSubmissions = async (): Promise<Submission[]> => {
    const r = await fetch("/api/code-ide/submissions", { cache: "no-store" });
    if (!r.ok) throw new Error("Failed to fetch submissions");
    return r.json();
  };

  const fetchSubmissionDetail = async (id: number): Promise<Submission> => {
    const r = await fetch(`/api/code-ide/submissions/${id}`, {
      cache: "no-store",
    });
    if (!r.ok) throw new Error("Failed to fetch submission detail");
    return r.json();
  };

  // ─── Folder operations ─────────────────────────────────────────────────
  const createFolder = async (parentId: number | null, name: string) => {
    const res = await fetch("/api/code-ide/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent: parentId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || "Folder creation failed");
    }
    const f: Folder = await res.json();
    setFolders((prev) => [...prev, f]);
    return f;
  };

  const renameFolder = async (id: number, name: string) => {
    const res = await fetch(`/api/code-ide/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showCustomAlert(`Rename failed: ${err.detail || err.error || "unknown"}`);
      return;
    }
    const updated: Folder = await res.json();
    setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
    showCustomAlert("Folder renamed");
  };

  const deleteFolder = (id: number) => {
    showCustomConfirm(
      "Delete this folder? Files inside will be moved to root.",
      async () => {
        // Try non-force first; if it fails because of contents, ask again
        const res = await fetch(`/api/code-ide/folders/${id}/delete`, {
          method: "DELETE",
        });
        if (res.status === 204) {
          setFolders((prev) => prev.filter((f) => f.id !== id));
          showCustomAlert("Folder deleted");
          return;
        }
        if (res.status === 400) {
          // Probably "folder not empty" — escalate to force-delete confirm
          setPendingConfirm(null); // close current
          showCustomConfirm(
            "Folder is not empty. Delete folder AND all its contents?",
            async () => {
              const r2 = await fetch(
                `/api/code-ide/folders/${id}/delete?force=1`,
                { method: "DELETE" }
              );
              if (r2.status === 204) {
                setFolders((prev) => prev.filter((f) => f.id !== id));
                // Refresh snippets + uploads since some may have been deleted
                fetchSnippets()
                  .then(setMySnippets)
                  .catch(() => { });
                fetch("/api/code-ide/uploads")
                  .then((r) => (r.ok ? r.json() : []))
                  .then(setUploadedFiles)
                  .catch(() => { });
                showCustomAlert("Folder and contents deleted");
              } else {
                showCustomAlert("Force delete failed");
              }
            }
          );
          return;
        }
        showCustomAlert("Delete failed");
      }
    );
  };

  // ─── Tab actions: save / run / submit ──────────────────────────────────
  const openSavePanel = () => {
    if (!activeTab) return;
    setSaveFileName(activeTab.title || "");
    setSaveFolderId(
      activeTab.folderId != null ? String(activeTab.folderId) : ""
    );
    setInlinePanel("save");
  };

  const saveActiveTab = async () => {
    if (!activeTab) return;
    const name = saveFileName.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      const folderIdNum = saveFolderId ? parseInt(saveFolderId, 10) : null;
      const body: any = {
        title: name,
        language: activeTab.language,
        code_text: activeTab.code,
        folder: folderIdNum,
      };
      let reqBody = { ...body };
      if (activeTab.snippetId) {
        reqBody.id = activeTab.snippetId;
      }

      let res = await fetch("/api/code-ide/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      // If the snippet was not found (stale snippetId), retry saving as a new snippet
      if (res.status === 404 && reqBody.id) {
        delete reqBody.id;
        res = await fetch("/api/code-ide/snippets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || "Save failed");
      }
      const saved: Snippet = await res.json();
      // Update tab to reflect saved state
      updateActiveTab({
        kind: "snippet",
        snippetId: saved.id,
        title: saved.title,
        savedCode: activeTab.code,
        folderId: saved.folder ?? null,
        language: saved.language,
      });
      // Update the snippets list
      setMySnippets((prev) => {
        const exists = prev.some((s) => s.id === saved.id);
        return exists
          ? prev.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...prev];
      });
      showCustomAlert(
        activeTab.snippetId ? "Snippet updated" : "Snippet saved"
      );
      setInlinePanel(null);
    } catch (err) {
      showCustomAlert(`Save failed: ${(err as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openSubmitPanel = () => {
    if (!activeTab) return;
    setSubmitDraftTitle(
      activeTab.submissionTitle || activeTab.title || ""
    );
    setSubmitDraftLesson(activeTab.lessonId || "");
    // Default selection: tabs that have content. Always include the active tab.
    const defaults = new Set<string>();
    for (const t of tabs) {
      const tpl = LANGUAGES[t.language].template.trim();
      if (t.code.trim() && t.code.trim() !== tpl) defaults.add(t.id);
    }
    if (defaults.size === 0 && activeTab) defaults.add(activeTab.id);
    setSubmitSelectedTabIds(defaults);
    setInlinePanel("submit");
  };

  const toggleSubmitTab = (id: string) => {
    setSubmitSelectedTabIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmSubmit = async () => {
    const title = submitDraftTitle.trim();
    const lessonId = submitDraftLesson;

    if (!title) return showCustomAlert("Submission Title is required");
    if (!lessonId) return showCustomAlert("Please select a lesson");
    if (submitSelectedTabIds.size === 0)
      return showCustomAlert("Pick at least one file to submit");

    setIsSubmittingEditor(true);
    try {
      // Build files array with relative paths
      const filesToSubmit: { path: string; language: string; code_text: string }[] = [];
      for (const tabId of Array.from(submitSelectedTabIds)) {
        const tab = tabs.find((t) => t.id === tabId);
        if (!tab) continue;
        const ext = LANGUAGES[tab.language].ext;
        const baseName = `${(tab.title || "untitled").trim() || "untitled"}.${ext}`;
        // If tab has a folder, build full relative path
        let filePath = baseName;
        if (tab.folderId != null) {
          const folder = folders?.find((f: { id: number; path: string }) => f.id === tab.folderId);
          if (folder) {
            filePath = `${folder.path}/${baseName}`;
          }
        }
        filesToSubmit.push({
          path: filePath,
          language: tab.language,
          code_text: tab.code,
        });
      }

      if (filesToSubmit.length === 0) {
        showCustomAlert("No files to submit");
        return;
      }

      const res = await fetch("/api/code-ide/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          lesson: parseInt(lessonId, 10),
          files: filesToSubmit,
        }),
      });
      if (!res.ok) throw new Error(await safeError(res));
      const created = await res.json();

      showCustomAlert(
        filesToSubmit.length === 1
          ? "Submitted"
          : `Submitted ${filesToSubmit.length} files as project`
      );

      // Mark all submitted tabs as saved
      for (const tabId of Array.from(submitSelectedTabIds)) {
        updateTab(tabId, {
          submissionTitle: title,
          lessonId,
          savedCode:
            tabs.find((t) => t.id === tabId)?.code ?? "",
        });
      }

      // Refresh submissions list
      if (created?.id) {
        setMySubmissions((prev: Submission[]) => [created, ...prev]);
      }

      setInlinePanel(null);
    } catch (e) {
      showCustomAlert(`Submission failed: ${(e as Error).message}`);
    } finally {
      setIsSubmittingEditor(false);
    }
  };

  // Helper to extract a readable error from a non-OK response
  const safeError = async (res: Response) => {
    try {
      const j = await res.json();
      return (
        j.error ||
        j.detail ||
        Object.entries(j)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ")
      );
    } catch {
      return await res.text().catch(() => `${res.status}`);
    }
  };

  const handleEditorSubmitClick = () => {
    if (!activeTab) return;
    if (activeTab.lessonId && !isLessonAccessible(activeTab.lessonId)) {
      showCustomAlert("Course access has expired. Please renew your subscription");
      return;
    }
    if (activeTab.submissionId) {
      // Quick "update in place" path
      handleQuickUpdateSubmission();
    } else {
      openSubmitPanel();
    }
  };

  const handleQuickUpdateSubmission = async () => {
    if (!activeTab || !activeTab.submissionId) return;
    if (activeTab.lessonId && !isLessonAccessible(activeTab.lessonId)) {
      showCustomAlert("Course access has expired. Please renew your subscription");
      return;
    }
    if (isSubmittingEditor) return;
    const title = (activeTab.submissionTitle || activeTab.title || "").trim();
    if (!title) return showCustomAlert("Submission Title is required");
    setIsSubmittingEditor(true);
    try {
      const res = await fetch(
        `/api/code-ide/submissions/${activeTab.submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            language: activeTab.language,
            code_text: activeTab.code,
          }),
        }
      );
      if (!res.ok) throw new Error(await safeError(res));
      const updated: Submission = await res.json();
      setMySubmissions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      updateActiveTab({
        savedCode: activeTab.code,
        submissionTitle: title,
      });
      showCustomAlert("Submission updated");
    } catch (e) {
      showCustomAlert(`Update failed: ${(e as Error).message}`);
    } finally {
      setIsSubmittingEditor(false);
    }
  };

  // ─── Run code ──────────────────────────────────────────────────────────
  const runCode = async () => {
    if (!activeTab) return;
    if (activeTab.isImagePreview) {
      setOutput("Image preview mode: No code to execute");
      setBottomPanel("console");
      return;
    }
    setIsRunning(true);
    setOutput("");
    setWebConsole("");
    setExecutionError("");
    try {
      if (error === "Session expired" || error === "Not authenticated") {
        setOutput("Session expired. Please log in again.");
        setBottomPanel("console");
        return;
      }

      const lang = activeTab.language;
      if (lang === "javascript") {
        const logs: string[] = [];
        const original = console.log;
        console.log = (...a) => logs.push(a.map(String).join(" "));
        try {
          new Function(activeTab.code)();
          setOutput(
            logs.join("\n") || "Code executed successfully (no output)"
          );
          pushToast("Code executed successfully", "success");
        } catch (e: any) {
          setOutput(`Error: ${e.message}`);
        } finally {
          console.log = original;
        }
        setBottomPanel("console");
      } else if (lang === "html" || lang === "css") {
        runIdRef.current += 1;
        const runId = runIdRef.current;
        setWebConsole("");
        // Pull HTML source from any open HTML tab. If none, fall back to a
        // wrapper that injects the active CSS or JS into a basic page.
        const htmlTab =
          tabs.find((t) => t.language === "html" && t.id === activeTab.id) ||
          tabs.find((t) => t.language === "html");
        const fs = buildPreviewFilesystem(folders);
        // Persist the filesystem so in-preview navigation can re-resolve
        // each linked page with its own CSS and JS.
        previewFsRef.current = fs;
        setPreviewHistory([]);
        const finalHtml =
          htmlTab?.code ??
          `<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>`;

        // Figure out which "page" name we're rendering so we can track it
        const entryPageName = htmlTab
          ? Object.entries(fs).find(
              ([, v]) => v.content === htmlTab.code && v.lang === "html"
            )?.[0] ?? ""
          : "";
        setPreviewCurrentPage(entryPageName);

        setHtmlPreview(buildWebDoc(finalHtml, fs, runId));
        setOutput("Rendered preview.");
        pushToast("Rendered successfully", "success");
        setBottomPanel("preview");
      } else {
        const cfg = LANGUAGES[lang];
        if (cfg.judgeId || lang === "python") {
          try {
            const prompts =
              lang === "python" ? parsePythonInputs(activeTab.code) : [];
            if (prompts.length > 0) {
              setPythonInputPrompts(prompts);
              setPythonInputValues(Array(prompts.length).fill(""));
              pendingStdinRef.current = async (stdin: string) => {
                try {
                  await executeRemote(activeTab.code, lang, stdin);
                } catch (err: any) {
                  setExecutionError(
                    `Execution service error: ${err?.message || "All providers unavailable. Please try again later."}`
                  );
                  setOutput("");
                } finally {
                  setIsRunning(false);
                  setBottomPanel("console");
                }
              };
              setInlinePanel("stdin");
              return;
            }
            await executeRemote(activeTab.code, lang, "");
          } catch (err: any) {
            setExecutionError(
              `Execution service error: ${err?.message || "All providers unavailable. Please try again later."}`
            );
            setOutput("");
          }
        } else {
          setOutput("Language not supported for execution");
        }
        setBottomPanel("console");
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const parsePythonInputs = (code: string): string[] => {
    const regex = /input\s*\(\s*(?:"([^"]*?)"|'([^']*?)')?\s*\)/g;
    const prompts: string[] = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      prompts.push(match[1] ?? match[2] ?? `Input ${prompts.length + 1}`);
    }
    return prompts;
  };

  const buildWebDoc = (
    htmlSrc: string,
    fs: Record<string, { content: string; lang: LangKey }>,
    runId: number
  ) => {
    let html = htmlSrc ?? "";

    // Build blob URLs only for CSS and JS — NOT for HTML.
    // HTML cross-file navigation is handled via postMessage interception
    // so each linked page gets fully processed with its own CSS/JS.
    const virtualFiles: Record<string, { url: string; ext: "css" | "js" }> = {};
    for (const [name, entry] of Object.entries(fs)) {
      if (entry.lang === "css") {
        const url = URL.createObjectURL(
          new Blob([entry.content], { type: "text/css" })
        );
        virtualFiles[name] = { url, ext: "css" };
      } else if (entry.lang === "javascript") {
        const url = URL.createObjectURL(
          new Blob([entry.content], { type: "text/javascript" })
        );
        virtualFiles[name] = { url, ext: "js" };
      }
    }

    // Normalize a path: strip leading ./, remove query/hash, lowercase
    const normalizePath = (p: string) =>
      p.replace(/^\.?\//, "").split(/[?#]/)[0].toLowerCase();

    // Resolve CSS <link href="...">
    html = html.replace(
      /(<link\b[^>]*\bhref\s*=\s*["'])([^"']+)(["'])/gi,
      (full, pre, href, post) => {
        const file = virtualFiles[normalizePath(href)];
        return file && file.ext === "css" ? `${pre}${file.url}${post}` : full;
      }
    );

    // Resolve JS <script src="...">
    html = html.replace(
      /(<script\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'])/gi,
      (full, pre, src, post) => {
        const file = virtualFiles[normalizePath(src)];
        return file && file.ext === "js" ? `${pre}${file.url}${post}` : full;
      }
    );

    // ── Bridge script: console forwarding + link-click navigation ─────
    // Instead of replacing <a href> with blob URLs (which lose CSS/JS
    // context), we intercept clicks at runtime. When the user clicks a
    // link to another .html/.htm file, we send a postMessage to the
    // parent (code-editor), which fully processes the target page
    // (resolving its CSS/JS) and swaps the iframe content.
    const bridge = `
      <script>
        (function () {
          var RUN_ID = ${runId};
          function send(type, msg) {
            try {
              window.parent.postMessage(
                { source: "web-iframe", type: type, message: String(msg), runId: RUN_ID },
                "*"
              );
            } catch (e) {}
          }

          /* ── Console forwarding ── */
          var _log = console.log, _warn = console.warn, _err = console.error;
          console.log = function () { send("log", Array.prototype.slice.call(arguments).map(String).join(" ")); _log.apply(console, arguments); };
          console.warn = function () { send("warn", Array.prototype.slice.call(arguments).map(String).join(" ")); _warn.apply(console, arguments); };
          console.error = function () { send("error", Array.prototype.slice.call(arguments).map(String).join(" ")); _err.apply(console, arguments); };
          window.onerror = function (message, source, line, col, err) {
            send("error", (err && err.stack) ? err.stack : message + " (" + line + ":" + col + ")");
          };
          window.addEventListener("unhandledrejection", function (event) {
            var r = event.reason;
            send("error", r && r.stack ? r.stack : r);
          });

          /* ── Navigation interception ── */
          /* Catches clicks on <a href="page.html"> and sends the href to  */
          /* the parent so it can fully process the target page.           */
          document.addEventListener("click", function (e) {
            var el = e.target;
            while (el && el.tagName !== "A") el = el.parentElement;
            if (!el) return;
            var href = el.getAttribute("href");
            if (!href) return;
            var clean = href.replace(/^\\.?\\//, "").split(/[?#]/)[0].toLowerCase();
            if (clean.endsWith(".html") || clean.endsWith(".htm")) {
              e.preventDefault();
              send("navigate", href);
            }
          }, true);
        })();
      </script>
    `;
    if (/<head\b[^>]*>/i.test(html)) {
      html = html.replace(/<head\b[^>]*>/i, (m) => m + bridge);
    } else if (/<html\b[^>]*>/i.test(html)) {
      html = html.replace(
        /<html\b[^>]*>/i,
        (m) => m + "<head>" + bridge + "</head>"
      );
    } else {
      html = bridge + html;
    }
    return html;
  };

  // ─── Piston API via server-side proxy (primary — free, no API key) ──────
  // We call our own Next.js route (/api/code-ide/execute) instead of hitting
  // Piston directly from the browser.  Direct browser-to-Piston calls were
  // triggering CORS failures and, on some school/corporate networks, the
  // browser would follow a proxy-login redirect back to this app's /login page.
  const PISTON_LANG_MAP: Record<string, { language: string; version: string }> = {
    python: { language: "python", version: "3.10.0" },
    javascript: { language: "javascript", version: "18.15.0" },
  };

  const executeWithPiston = async (
    codeToRun: string,
    lang: LangKey,
    stdin: string
  ) => {
    const pistonLang = PISTON_LANG_MAP[lang];
    if (!pistonLang) throw new Error(`Piston does not support ${lang}`);

    // Client timeout is 25 s — the server proxy allows Piston 20 s, so the
    // server will always resolve (with an error if needed) before this fires.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("/api/code-ide/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          language: pistonLang.language,
          version: pistonLang.version,
          files: [{ name: `main.${LANGUAGES[lang].ext}`, content: codeToRun }],
          stdin: stdin || "",
          run_timeout: 10000,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        // The proxy returns { error, detail } on failure
        const msg =
          result?.error ||
          result?.detail ||
          `Execution service error (${res.status})`;
        throw new Error(msg);
      }

      // Piston returns { run: { stdout, stderr, code, signal, output }, compile?: ... }
      const run = result?.run;
      if (!run) throw new Error("No run result from execution service");

      if (run.signal === "SIGKILL" || run.code === 137) {
        setOutput(
          "Time Limit Exceeded — your code took too long or used too much memory."
        );
      } else if (run.stderr && run.code !== 0) {
        setOutput(`Error:\n${run.stderr}`);
      } else {
        setOutput(run.stdout || "Code executed successfully (no output)");
        if (run.code === 0) pushToast("Code executed successfully", "success");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Piston execution timed out via proxy.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

  const executeWithPistonDirect = async (
    codeToRun: string,
    lang: LangKey,
    stdin: string
  ) => {
    const pistonLang = PISTON_LANG_MAP[lang];
    if (!pistonLang) throw new Error(`Piston does not support ${lang}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          language: pistonLang.language,
          version: pistonLang.version,
          files: [{ name: `main.${LANGUAGES[lang].ext}`, content: codeToRun }],
          stdin: stdin || "",
          run_timeout: 10000,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = result?.message || `Piston direct API error (${res.status})`;
        throw new Error(msg);
      }

      const run = result?.run;
      if (!run) throw new Error("No run result from Piston direct API");

      if (run.signal === "SIGKILL" || run.code === 137) {
        setOutput(
          "Time Limit Exceeded — your code took too long or used too much memory."
        );
      } else if (run.stderr && run.code !== 0) {
        setOutput(`Error:\n${run.stderr}`);
      } else {
        setOutput(run.stdout || "Code executed successfully (no output)");
        if (run.code === 0) pushToast("Code executed successfully", "success");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Piston direct execution timed out.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };


  // ─── Judge0 API (fallback — RapidAPI key) ──────────────────────────────
  const executeWithJudge0 = async (
    codeToRun: string,
    langId: number,
    stdin: string
  ) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch("/api/code-ide/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          provider: "judge0",
          source_code: codeToRun,
          language_id: langId,
          stdin,
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`Judge0 API ${res.status}: ${errBody || res.statusText}`);
      }
      const result = await res.json();
      if (result.status?.id === 3) {
        setOutput(result.stdout || "Success (no output)");
        pushToast("Code executed successfully", "success");
      } else if (result.status?.id === 6) {
        setOutput(`Compilation Error:\n${result.compile_output || result.stderr}`);
      } else if (result.status?.id === 5) {
        setOutput("Time Limit Exceeded");
      } else if (result.status?.id === 4) {
        setOutput(`Runtime Error:\n${result.stderr}`);
      } else {
        setOutput(result.stderr || result.stdout || "Unknown error");
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  // ─── Combined execution: Piston first, Judge0 fallback ─────────────────
  const executeRemote = async (
    codeToRun: string,
    lang: LangKey,
    stdin: string
  ) => {
    const cfg = LANGUAGES[lang];
    let lastError: Error | null = null;

    // Attempt 1: Piston API via Proxy (free, reliable but server IP can be rate-limited)
    if (PISTON_LANG_MAP[lang]) {
      try {
        await executeWithPiston(codeToRun, lang, stdin);
        return; // success
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn("[IDE] Piston proxy execution failed, trying Piston direct:", err?.message);
        lastError = err;
      }

      // Attempt 1.5: Piston API Direct (bypasses server rate limits, uses client IP)
      try {
        await executeWithPistonDirect(codeToRun, lang, stdin);
        return; // success
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn("[IDE] Piston direct execution also failed, trying Judge0:", err?.message);
        lastError = err;
      }
    }

    // Attempt 2: Judge0 API (RapidAPI key - limited daily quota)
    if (cfg.judgeId) {
      try {
        await executeWithJudge0(codeToRun, cfg.judgeId, stdin);
        return; // success
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn("[IDE] Judge0 execution also failed:", err?.message);
        lastError = err;
      }
    }

    // Both failed
    throw lastError || new Error("No execution provider available for this language.");
  };

  // ─── Tab actions: copy / download / reset ──────────────────────────────
  /**
   * Normalise a code string before it leaves the editor:
   *  - Strip Windows \r characters (\r\n → \n, lone \r → \n)
   *  - Remove trailing whitespace from each line
   *  - Ensure the file ends with exactly one newline
   *
   * This avoids ^M / blank-line artifacts when pasting into VS Code,
   * Notepad++, PyCharm, or any other editor that is strict about
   * line endings.
   */
  const normalizeCodeForExport = (code: string): string => {
    return code
      .replace(/\r\n/g, "\n")   // CRLF → LF
      .replace(/\r/g, "\n")     // lone CR → LF
      .replace(/[ \t]+$/gm, "") // strip trailing whitespace per line
      .replace(/\n+$/, "\n");   // exactly one trailing newline
  };

  const copyCode = () => {
    if (!activeTab) return;
    const clean = normalizeCodeForExport(activeTab.code);
    navigator.clipboard
      .writeText(clean)
      .then(() => showCustomAlert("Code copied to clipboard"))
      .catch(() => showCustomAlert("Failed to copy — try selecting and copying manually"));
  };

  const downloadCode = () => {
    if (!activeTab) return;
    const ext = LANGUAGES[activeTab.language].ext;
    const clean = normalizeCodeForExport(activeTab.code);
    const blob = new Blob([clean], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const filename = `${activeTab.title || "code"}.${ext}`;
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: filename,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCode = () => {
    if (!activeTab) return;
    const tpl = LANGUAGES[activeTab.language].template;
    updateActiveTab({ code: tpl, savedCode: tpl });
  };

  const handleResetClick = () => {
    if (!activeTab) return;
    if (!isDirty(activeTab)) {
      resetCode();
      return;
    }
    showCustomConfirm(
      "You have unsaved changes. Resetting will delete them. Continue?",
      async () => {
        resetCode();
      }
    );
  };

  // ─── Snippet/file ops ──────────────────────────────────────────────────
  const loadSnippet = async (s: Snippet) => {
    setSnippetLoadingId(s.id);
    try {
      const full = await fetchSnippetDetail(s.id);
      openSnippet(full);
    } catch {
      showCustomAlert("Failed to load snippet");
    } finally {
      setSnippetLoadingId(null);
    }
  };

  const deleteSnippet = (id: number) => {
    showCustomConfirm("Delete this snippet?", async () => {
      setDeletingSnippetId(id);
      try {
        const res = await fetch(`/api/code-ide/snippets/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
        setMySnippets((prev) => prev.filter((s) => s.id !== id));
        showCustomAlert("Snippet deleted");
      } catch {
        showCustomAlert("Delete failed");
      } finally {
        setDeletingSnippetId(null);
      }
    });
  };

  const copySnippetUrl = (id: number) => {
    const url = `${window.location.origin}/api/code-ide/snippets/${id}`;
    navigator.clipboard.writeText(url);
    showCustomAlert("Snippet URL copied to clipboard");
  };

  const fetchFileContent = async (file: UploadedFile) => {
    const apiRes = await fetch(`/api/code-ide/uploads/${file.id}/content`, {
      headers: { "Cache-Control": "no-cache" },
    });
    if (!apiRes.ok)
      throw new Error(`Failed to fetch file content: ${apiRes.status}`);
    return await apiRes.text();
  };

  const loadFile = async (file: UploadedFile) => {
    try {
      setFileLoading(file.id);
      const ext = file.original_name.split(".").pop()?.toLowerCase();
      const isImage =
        file.content_type.includes("image/") ||
        ["png", "jpg", "jpeg", "gif", "svg"].includes(ext || "");
      if (isImage) {
        openUploadAsTab(file, null, true);
        return;
      }
      const content = await fetchFileContent(file);
      openUploadAsTab(file, content, false);
    } catch (err) {
      showCustomAlert(`Failed to load file: ${(err as Error).message}`);
    } finally {
      setFileLoading(null);
    }
  };

  const deleteUploadedFile = (id: number) => {
    showCustomConfirm("Delete this file?", async () => {
      setDeletingFileId(id);
      try {
        const res = await fetch(`/api/code-ide/uploads/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const error = await res.json().catch(() => ({ error: "Delete failed" }));
          throw new Error(error.error || "Delete failed");
        }
        setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
        showCustomAlert("File deleted");
      } catch (e) {
        showCustomAlert(`Delete failed: ${(e as Error).message}`);
      } finally {
        setDeletingFileId(null);
      }
    });
  };

  const copyFileUrl = (file: UploadedFile) => {
    const short = `${window.location.origin}/api/code-ide/uploads/resolve?label=${encodeURIComponent(
      file.label || file.original_name
    )}`;
    navigator.clipboard
      .writeText(short)
      .then(() => showCustomAlert("File URL copied to clipboard"))
      .catch(() => showCustomAlert("Failed to copy URL"));
  };

  // ─── Copy file path (for cross-file linking) ──────────────────────────
  // Builds a virtual path like "styles/main.css" that can be pasted into
  // HTML <link href="...">, <script src="...">, CSS url(...), etc.
  // The preview engine (buildWebDoc) resolves these paths at runtime.

  const getFolderPath = (folderId: number | null): string => {
    if (folderId == null) return "";
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return "";
    return folder.path; // e.g. "project/styles"
  };

  const copySnippetPath = (s: Snippet) => {
    const ext = LANGUAGES[s.language]?.ext || "txt";
    const name = (s.title || "untitled").trim() || "untitled";
    const folderPath = getFolderPath(s.folder);
    const fullPath = folderPath ? `${folderPath}/${name}.${ext}` : `${name}.${ext}`;
    navigator.clipboard
      .writeText(fullPath)
      .then(() => showCustomAlert(`Path copied: ${fullPath}`))
      .catch(() => showCustomAlert("Failed to copy path"));
  };

  const copyFilePath = (file: UploadedFile) => {
    const name = file.label || file.original_name || "file";
    const folderPath = getFolderPath(file.folder);
    const fullPath = folderPath ? `${folderPath}/${name}` : name;
    navigator.clipboard
      .writeText(fullPath)
      .then(() => showCustomAlert(`Path copied: ${fullPath}`))
      .catch(() => showCustomAlert("Failed to copy path"));
  };

  // ─── Upload handler (now folder-aware) ─────────────────────────────────
  const handleUploadClick = (folderId: number | null) => {
    uploadTargetFolderRef.current = folderId;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileInputRef.current) return;
    if (file.size > MAX_FILE_SIZE) {
      showCustomAlert("File size exceeds 25MB limit");
      return;
    }
    fileInputRef.current.value = "";
    await uploadFile(
      file,
      activeTab?.lessonId || undefined,
      `Uploaded ${file.name}`,
      uploadTargetFolderRef.current
    );
  };

  const uploadFile = async (
    file: File,
    lesson: string | undefined,
    label: string,
    folderId: number | null
  ) => {
    if (!session?.user?.sessionToken) return;
    const formData = new FormData();
    formData.append("file", file);
    if (lesson) formData.append("lesson", lesson);
    if (label) formData.append("label", label);
    if (folderId != null) formData.append("folder", String(folderId));
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await new Promise<UploadedFile>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            setUploadProgress((event.loaded / event.total) * 100);
          }
        });
        xhr.open("POST", "/api/code-ide/uploads");
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${session.user.sessionToken}`
        );
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });
      setUploadedFiles((prev) => [res, ...prev]);
      showCustomAlert("File uploaded successfully");
      return res;
    } catch (err) {
      showCustomAlert(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const addComment = async (
    submissionId: number,
    message: string
  ): Promise<Comment> => {
    const res = await fetch(
      `/api/code-ide/submissions/${submissionId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }
    );
    if (!res.ok) throw new Error("Comment failed");
    return res.json();
  };

  // ─── Logout ────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      await signOut({ redirect: false });
      window.location.href = "/login";
    } catch {
      await signOut({ redirect: false });
      window.location.href = "/login";
    }
  };

  // ─── New file: open the language picker ────────────────────────────────
  // The picker is shown as an inline panel so the user can choose
  // JavaScript / Python / HTML / CSS for the new tab. The picker remembers
  // which folder triggered it so the resulting tab is pre-stamped with
  // that folder for save.
  const handleNewFile = (folderId: number | null) => {
    setNewFileFolderId(folderId);
    setInlinePanel("newFile");
  };

  // Called from inside the picker once the user has chosen a language.
  // openNewTab returns the freshly-created Tab; we use its id directly so
  // we don't depend on `activeId` being committed in the same render cycle.
  const createNewFileWithLang = (language: LangKey) => {
    const newTab = openNewTab(language);
    if (newTab && newFileFolderId != null) {
      updateTab(newTab.id, { folderId: newFileFolderId });
    }
    setInlinePanel(null);
    setNewFileFolderId(null);
  };

  // ─── New folder action ─────────────────────────────────────────────────
  const handleCreateFolderClick = (parentId: number | null) => {
    setNewFolderParent(parentId);
    setNewFolderName("");
    setInlinePanel("newFolder");
  };

  const submitCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    setCreatingFolder(true);
    try {
      await createFolder(newFolderParent, name);
      showCustomAlert("Folder created");
      setInlinePanel(null);
    } catch (e) {
      showCustomAlert(`Failed: ${(e as Error).message}`);
    } finally {
      setCreatingFolder(false);
    }
  };

  // ─── Computed values ────────────────────────────────────────────────────
  const lineCount = useMemo(() => {
    if (!activeTab) return 0;
    return activeTab.code.split("\n").length;
  }, [activeTab]);

  // ─── Loading states ─────────────────────────────────────────────────────
  if (loading && !fileLoading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${isDark ? "bg-[#0d1117]" : "bg-[#f6f8fa]"
          }`}
      >
        <Spinner size="md" className="text-[#EF7B55]" />
      </div>
    );
  }

  if (error === "Session expired" || error === "Not authenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm sm:text-base">
              Your session has expired or you are not authenticated. Please log
              in again to continue.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleLogout} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Currently selected lesson (from active tab)
  const currentLessonTitle = activeTab?.lessonId
    ? lessons.find((l) => l.id === activeTab.lessonId)?.title || "No lesson"
    : "No lesson";

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <IDEStyles t={t} isDark={isDark} fontSize={fontSize} />

      <div
        className="ide-root"
        style={{
          height: "100%",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: 36,
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            paddingRight: 12,
            background: t.bgAlt,
            borderBottom: `1px solid ${t.borderMuted}`,
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: t.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {"</>"}
            </div>
            <span>Code IDE</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: t.textDim,
              borderLeft: `1px solid ${t.borderMuted}`,
              paddingLeft: 12,
            }}
            className="ide-mobile-hide"
          >
            Write, run, and submit code across multiple languages
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              className="ide-btn ghost icon-only"
              onClick={() => setInlinePanel("shortcuts")}
              title="Keyboard shortcuts (⌘/)"
            >
              <Keyboard className="h-3.5 w-3.5" />
            </button>
            <button
              className="ide-btn ghost icon-only"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Main row */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Activity bar */}
          <div
            style={{
              width: 48,
              background: t.bgAlt,
              borderRight: `1px solid ${t.borderMuted}`,
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <button
              className={`activity-icon ${activePanel === "files" && !sidebarCollapsed ? "active" : ""
                }`}
              onClick={() => handleActivityClick("files")}
              title="Files (⌘B to toggle)"
            >
              <FolderOpen className="h-5 w-5" />
            </button>
            <button
              className={`activity-icon ${activePanel === "submissions" && !sidebarCollapsed
                  ? "active"
                  : ""
                }`}
              onClick={() => handleActivityClick("submissions")}
              title="Submissions"
            >
              <GraduationCap className="h-5 w-5" />
            </button>
            <button
              className={`activity-icon ${activePanel === "search" && !sidebarCollapsed ? "active" : ""
                }`}
              onClick={() => handleActivityClick("search")}
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <div style={{ marginTop: "auto" }}>
              <button
                className={`activity-icon ${activePanel === "settings" && !sidebarCollapsed
                    ? "active"
                    : ""
                  }`}
                onClick={() => handleActivityClick("settings")}
                title="Settings"
              >
                <SettingsIcon className="h-5 w-5" />
              </button>
              <button
                className="activity-icon"
                onClick={() => setSidebarCollapsed((c) => !c)}
                title={
                  sidebarCollapsed
                    ? "Expand sidebar (⌘B)"
                    : "Collapse sidebar (⌘B)"
                }
              >
                {sidebarCollapsed ? (
                  <ChevronsRight className="h-5 w-5" />
                ) : (
                  <ChevronsLeft className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          {!sidebarCollapsed && (
            <>
              <div
                style={{
                  width: sidebarWidth,
                  background: t.bgPanel,
                  borderRight: `1px solid ${t.borderMuted}`,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 6px 0 12px",
                    borderBottom: `1px solid ${t.borderMuted}`,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: t.textMuted,
                    flexShrink: 0,
                  }}
                >
                  <span>
                    {activePanel === "files" && "Explorer"}
                    {activePanel === "submissions" && "Submissions"}
                    {activePanel === "search" && "Search"}
                    {activePanel === "settings" && "Settings"}
                  </span>
                  <button
                    className="ide-btn ghost icon-only"
                    onClick={() => setSidebarCollapsed(true)}
                    title="Collapse sidebar (⌘B)"
                    style={{ marginLeft: "auto", height: 22, width: 22 }}
                  >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div
                  style={{ flex: 1, overflow: "auto", minHeight: 0 }}
                  className="scroll-thin"
                >
                  {activePanel === "files" && (
                    <FilesSidebar
                      folders={folders}
                      snippets={mySnippets}
                      uploads={uploadedFiles}
                      onLoadSnippet={loadSnippet}
                      onLoadFile={loadFile}
                      onDeleteSnippet={deleteSnippet}
                      onDeleteFile={deleteUploadedFile}
                      onCopySnippetUrl={copySnippetUrl}
                      onCopyFileUrl={copyFileUrl}
                      onCopySnippetPath={copySnippetPath}
                      onCopyFilePath={copyFilePath}
                      onUploadClick={handleUploadClick}
                      onNewFile={handleNewFile}
                      onCreateFolder={handleCreateFolderClick}
                      onRenameFolder={renameFolder}
                      onDeleteFolder={deleteFolder}
                      snippetLoadingId={snippetLoadingId}
                      fileLoadingId={fileLoading}
                      deletingSnippetId={deletingSnippetId}
                      deletingFileId={deletingFileId}
                      activeSnippetId={activeTab?.snippetId ?? null}
                      uploading={uploading}
                      uploadProgress={uploadProgress}
                      t={t}
                    />
                  )}
                  {activePanel === "submissions" && (
                    <SubmissionsSidebar
                      submissions={mySubmissions}
                      onLoad={openSubmission}
                      fetchSubmissionDetail={fetchSubmissionDetail}
                      onComment={addComment}
                      showCustomAlert={showCustomAlert}
                      isLessonAccessible={isLessonAccessible}
                      t={t}
                    />
                  )}
                  {activePanel === "search" && (
                    <SearchSidebar
                      snippets={mySnippets}
                      onSelect={loadSnippet}
                      t={t}
                    />
                  )}
                  {activePanel === "settings" && (
                    <SettingsSidebar
                      theme={theme}
                      onToggleTheme={toggleTheme}
                      onLogout={handleLogout}
                      fontSize={fontSize}
                      onIncFontSize={incFontSize}
                      onDecFontSize={decFontSize}
                      minFontSize={minFontSize}
                      maxFontSize={maxFontSize}
                      t={t}
                    />
                  )}
                </div>
              </div>
              <div
                className={`resizer-x ${isResizingSidebar ? "active" : ""}`}
                onMouseDown={() => setIsResizingSidebar(true)}
              />
            </>
          )}

          {/* Center column */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <span className="crumb">{currentLessonTitle}</span>
              <ChevronRight className="h-3 w-3 crumb-sep" />
              <span className="crumb">
                {activeTab?.title || "untitled"}
              </span>
              <ChevronRight className="h-3 w-3 crumb-sep" />
              <span className="crumb last ide-mono">
                {activeTab ? LANGUAGES[activeTab.language].name : ""}
              </span>

              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                <button
                  className="ide-btn ghost icon-only"
                  onClick={handleResetClick}
                  title="Reset to template"
                  disabled={loading || !!activeTab?.isImagePreview}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  className="ide-btn ghost icon-only"
                  onClick={copyCode}
                  title="Copy code"
                  disabled={loading || !!activeTab?.isImagePreview}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  className="ide-btn ghost icon-only"
                  onClick={downloadCode}
                  title="Download"
                  disabled={loading || !!activeTab?.isImagePreview}
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* File tabs — one per open Tab */}
            <div
              style={{
                display: "flex",
                background: t.bgAlt,
                borderBottom: `1px solid ${t.borderMuted}`,
                overflowX: "auto",
                flexShrink: 0,
              }}
              className="scroll-thin"
            >
              {tabs.map((tab) => {
                const ext = LANGUAGES[tab.language].ext;
                const dirty = tab.code !== tab.savedCode;
                const isActive = tab.id === activeId;
                return (
                  <div
                    key={tab.id}
                    className={`file-tab ${isActive ? "active" : ""}`}
                    onClick={() => setActiveId(tab.id)}
                  >
                    <LangBadge lang={tab.language} />
                    <span className="ide-mono">
                      {(tab.title || "untitled").slice(0, 22)}.{ext}
                    </span>
                    {dirty && <span className="dirty-dot" />}
                    <button
                      className="file-tab-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dirty) {
                          showCustomConfirm(
                            `Close ${tab.title}? You have unsaved changes.`,
                            async () => closeTab(tab.id)
                          );
                        } else {
                          closeTab(tab.id);
                        }
                      }}
                      title="Close tab"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {/* New tab button — opens the language picker so the user can
                  pick JS / Python / HTML / CSS for the new tab. */}
              <button
                className="ide-btn ghost"
                style={{
                  height: 36,
                  borderRadius: 0,
                  borderRight: `1px solid ${t.borderMuted}`,
                  width: 36,
                  padding: 0,
                }}
                onClick={() => handleNewFile(null)}
                title="New tab (⌘N)"
              >
                +
              </button>
            </div>

            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                background: t.bgPanel,
                borderBottom: `1px solid ${t.borderMuted}`,
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              {activeTab && activeTab.language !== "css" && (
                <button
                  onClick={runCode}
                  disabled={isRunning || !!error || loading}
                  className="ide-btn primary"
                  title="Run code (⌘↵)"
                >
                  {isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {isRunning ? "Running..." : "Run"}
                </button>
              )}
              <button
                onClick={openSavePanel}
                disabled={loading || !!activeTab?.isImagePreview}
                className="ide-btn"
                title="Save (⌘S)"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
              <button
                onClick={handleEditorSubmitClick}
                disabled={
                  loading ||
                  !!activeTab?.isImagePreview ||
                  isSubmittingEditor
                }
                className="ide-btn"
                title={
                  activeTab?.submissionId
                    ? "Update submission"
                    : "Submit code"
                }
              >
                {isSubmittingEditor ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {/* The label is read from the active tab. New tab → no
                    submissionId → label is "Submit". This fixes issue #1. */}
                {activeTab?.submissionId ? "Update" : "Submit"}
              </button>

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <button
                  className="ide-btn ghost icon-only"
                  onClick={() =>
                    setBottomPanel((p) => (p === "preview" ? null : "preview"))
                  }
                  title="Toggle preview"
                  style={
                    bottomPanel === "preview"
                      ? { background: t.bgActive }
                      : undefined
                  }
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  className="ide-btn ghost icon-only"
                  onClick={() =>
                    setBottomPanel((p) =>
                      p === "console" ? null : "console"
                    )
                  }
                  title="Toggle console (⌘J)"
                  style={
                    bottomPanel === "console"
                      ? { background: t.bgActive }
                      : undefined
                  }
                >
                  <Terminal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Editor area */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: t.bg,
              }}
            >
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                {/* Inline action panel */}
                {inlinePanel && (
                  <InlinePanelContent
                    panel={inlinePanel}
                    onClose={() => {
                      if (inlinePanel === "stdin") {
                        pendingStdinRef.current = null;
                        setIsRunning(false);
                      }
                      closeInlinePanel();
                    }}
                    t={t}
                    activeTab={activeTab}
                    saveFileName={saveFileName}
                    setSaveFileName={setSaveFileName}
                    saveFolderId={saveFolderId}
                    setSaveFolderId={setSaveFolderId}
                    folders={folders}
                    isSaving={isSaving}
                    onSave={saveActiveTab}
                    submitDraftTitle={submitDraftTitle}
                    setSubmitDraftTitle={setSubmitDraftTitle}
                    submitDraftLesson={submitDraftLesson}
                    setSubmitDraftLesson={setSubmitDraftLesson}
                    lessons={lessons}
                    tabs={tabs}
                    submitSelectedTabIds={submitSelectedTabIds}
                    toggleSubmitTab={toggleSubmitTab}
                    isSubmittingEditor={isSubmittingEditor}
                    onConfirmSubmit={confirmSubmit}
                    pythonInputPrompts={pythonInputPrompts}
                    pythonInputValues={pythonInputValues}
                    setPythonInputValues={setPythonInputValues}
                    onStdinSubmit={() => {
                      const stdin = pythonInputValues.join("\n");
                      closeInlinePanel();
                      pendingStdinRef.current?.(stdin);
                    }}
                    newFolderName={newFolderName}
                    setNewFolderName={setNewFolderName}
                    newFolderParent={newFolderParent}
                    creatingFolder={creatingFolder}
                    onSubmitCreateFolder={submitCreateFolder}
                    newFileFolderId={newFileFolderId}
                    onCreateNewFile={createNewFileWithLang}
                    isDraftLessonLocked={isDraftLessonLocked}
                  />
                )}

                {executionError && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: `${t.warning}15`,
                      borderBottom: `1px solid ${t.borderMuted}`,
                      color: t.warning,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {executionError}
                  </div>
                )}

                {syntaxError && !activeTab?.isImagePreview && (
                  <div
                    style={{
                      padding: "6px 12px",
                      background: `${t.danger}15`,
                      borderBottom: `1px solid ${t.borderMuted}`,
                      color: t.danger,
                      fontSize: 11,
                      fontFamily: "JetBrains Mono, monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {syntaxError}
                  </div>
                )}

                {activeTab?.isImagePreview ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                      background: t.bgAlt,
                      overflow: "auto",
                    }}
                  >
                    <img
                      src={activeTab.imageUrl}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                ) : (
                  activeTab && (
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <CodeMirror
                        key={activeTab.id}
                        value={activeTab.code}
                        extensions={[
                          ...(codeMirrorExtensions[activeTab.language] as any),
                          EditorView.lineWrapping,
                          EditorView.updateListener.of((v) => {
                            if (v.selectionSet) {
                              const sel = v.state.selection.main.head;
                              const line = v.state.doc.lineAt(sel);
                              setCursorPos({
                                line: line.number,
                                col: sel - line.from + 1,
                              });
                            }
                          }),
                        ]}
                        theme={isDark ? monokai : githubLight}
                        height="100%"
                        style={{ height: "100%" }}
                        basicSetup={{
                          lineNumbers: true,
                          tabSize: INDENT_BY_LANG[activeTab.language].size,
                          indentOnInput: true,
                          bracketMatching: true,
                          autocompletion: true,
                          highlightActiveLine: true,
                          highlightActiveLineGutter: true,
                          foldGutter: true,
                          searchKeymap: true,
                        }}
                        editable={!loading}
                        onChange={(value) =>
                          // Normalise CRLF → LF so that Windows-clipboard
                          // pastes don't pollute the code buffer with \r\n.
                          updateActiveTab({ code: value.replace(/\r\n/g, "\n").replace(/\r/g, "\n") })
                        }
                      />
                    </div>
                  )
                )}
              </div>

              {/* Bottom panel */}
              {bottomPanel && (
                <>
                  <div
                    className={`resizer-y ${isResizingBottom ? "active" : ""}`}
                    onMouseDown={() => setIsResizingBottom(true)}
                  />
                  <div
                    style={{
                      height: bottomHeight,
                      background: t.bgPanel,
                      borderTop: `1px solid ${t.borderMuted}`,
                      display: "flex",
                      flexDirection: "column",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: 32,
                        borderBottom: `1px solid ${t.borderMuted}`,
                        paddingRight: 8,
                      }}
                    >
                      <BottomTab
                        active={bottomPanel === "console"}
                        onClick={() => setBottomPanel("console")}
                        icon={<Terminal className="h-3 w-3" />}
                        label="Console"
                        t={t}
                      />
                      {(activeTab?.language === "html" ||
                        activeTab?.language === "css") && (
                          <BottomTab
                            active={bottomPanel === "preview"}
                            onClick={() => setBottomPanel("preview")}
                            icon={<Eye className="h-3 w-3" />}
                            label="Preview"
                            t={t}
                          />
                        )}
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          gap: 4,
                        }}
                      >
                        {bottomPanel === "preview" && htmlPreview && (
                          <>
                            <button
                              className="ide-btn ghost icon-only"
                              title="Back"
                              onClick={handlePreviewBack}
                              disabled={previewHistory.length === 0}
                              style={{
                                opacity: previewHistory.length === 0 ? 0.35 : 1,
                              }}
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="ide-btn ghost icon-only"
                              title="Refresh page"
                              onClick={handlePreviewRefresh}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                            {previewCurrentPage && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: t.textMuted,
                                  fontFamily: "JetBrains Mono, monospace",
                                  maxWidth: 160,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={previewCurrentPage}
                              >
                                {previewCurrentPage}
                              </span>
                            )}
                            <button
                              className="ide-btn ghost icon-only"
                              title="Open in new tab"
                              onClick={() => {
                                const blob = new Blob([htmlPreview], {
                                  type: "text/html",
                                });
                                const url = URL.createObjectURL(blob);
                                window.open(url, "_blank");
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="ide-btn ghost icon-only"
                              title="Fullscreen"
                              onClick={() =>
                                iframeRef.current?.requestFullscreen?.()
                              }
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          className="ide-btn ghost icon-only"
                          onClick={() => setBottomPanel(null)}
                          title="Close panel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        background:
                          bottomPanel === "preview" ? "white" : t.bg,
                      }}
                      className="scroll-thin"
                    >
                      {bottomPanel === "preview" ? (
                        htmlPreview ? (
                          <iframe
                            ref={iframeRef}
                            srcDoc={htmlPreview}
                            className="preview-iframe"
                            title="Preview"
                          />
                        ) : (
                          <div
                            style={{
                              padding: 24,
                              color: t.textMuted,
                              fontSize: 12,
                              textAlign: "center",
                            }}
                          >
                            Run HTML/CSS to see preview
                          </div>
                        )
                      ) : (
                        <pre
                          className="console-output scroll-thin"
                          style={{
                            color:
                              activeTab?.language === "html" ||
                                activeTab?.language === "css"
                                ? t.text
                                : t.success,
                          }}
                        >
                          {activeTab?.language === "html" ||
                            activeTab?.language === "css"
                            ? webConsole ||
                            "Console output will appear here..."
                            : output || "Output will appear here..."}
                        </pre>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Status bar */}
            <div className="status-bar">
              <span className="status-item">
                <Circle
                  className="h-2 w-2"
                  style={{
                    fill: hasAnyUnsaved ? t.warning : t.success,
                    color: hasAnyUnsaved ? t.warning : t.success,
                  }}
                />
                {hasAnyUnsaved ? "Unsaved changes" : "All saved"}
              </span>
              {activeTab && (
                <>
                  <span className="status-item ide-mono">
                    {LANGUAGES[activeTab.language].name}
                  </span>
                  <span className="status-item ide-mono">
                    Ln {cursorPos.line}, Col {cursorPos.col}
                  </span>
                  <span className="status-item ide-mono ide-mobile-hide">
                    {lineCount} lines
                  </span>
                </>
              )}
              <span
                className="status-item ide-mobile-hide"
                style={{ marginLeft: "auto" }}
              >
                {currentLessonTitle}
              </span>

              <button
                className="status-item clickable"
                onClick={() => setInlinePanel("shortcuts")}
                title="Keyboard shortcuts"
              >
                <Keyboard className="h-3 w-3" />
                Shortcuts
              </button>
              <button className="status-item clickable" onClick={toggleTheme}>
                {isDark ? (
                  <Sun className="h-3 w-3" />
                ) : (
                  <Moon className="h-3 w-3" />
                )}
                {isDark ? "Dark" : "Light"}
              </button>
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".js,.py,.html,.css,.txt,.json,.xml,.png,.jpg,.jpeg,.svg,.md"
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Toast stack */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 20,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background:
                toast.kind === "error"
                  ? t.danger
                  : toast.kind === "success"
                    ? t.success
                    : t.text,
              color:
                toast.kind === "info" && !isDark
                  ? "white"
                  : toast.kind === "info" && isDark
                    ? t.bg
                    : "white",
              padding: "10px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              maxWidth: 380,
              minWidth: 220,
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "ide-toast-in 180ms ease-out",
            }}
          >
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((tt) => tt.id !== toast.id))
              }
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                opacity: 0.7,
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Inline confirm */}
      {pendingConfirm && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            background: t.bgPanel,
            border: `1px solid ${t.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            borderRadius: 8,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 320,
            maxWidth: 480,
            animation: "ide-toast-in 180ms ease-out",
          }}
        >
          <AlertCircle
            className="h-4 w-4 flex-shrink-0"
            style={{ color: t.warning }}
          />
          <span style={{ flex: 1, fontSize: 13, color: t.text }}>
            {pendingConfirm.message}
          </span>
          <button
            className="ide-btn"
            onClick={() => setPendingConfirm(null)}
            disabled={confirmRunning}
            style={{ height: 26 }}
          >
            Cancel
          </button>
          <button
            className="ide-btn primary"
            onClick={async () => {
              if (!pendingConfirm) return;
              setConfirmRunning(true);
              try {
                await pendingConfirm.callback();
              } finally {
                setConfirmRunning(false);
                setPendingConfirm(null);
              }
            }}
            disabled={confirmRunning}
            style={{ height: 26 }}
          >
            {confirmRunning ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Working
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      )}
    </>
  );
}

// ─── BottomTab ─────────────────────────────────────────────────────────
function BottomTab({
  active,
  onClick,
  icon,
  label,
  t,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  t: any;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: "0 12px",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        fontWeight: 600,
        color: active ? t.text : t.textMuted,
        background: "transparent",
        border: "none",
        borderBottom: active
          ? `1px solid ${t.accent}`
          : "1px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Inline action panel renderer ───────────────────────────────────────
function InlinePanelContent(props: any) {
  const {
    panel,
    onClose,
    t,
    activeTab,
    saveFileName,
    setSaveFileName,
    saveFolderId,
    setSaveFolderId,
    folders,
    isSaving,
    onSave,
    submitDraftTitle,
    setSubmitDraftTitle,
    submitDraftLesson,
    setSubmitDraftLesson,
    lessons,
    tabs,
    submitSelectedTabIds,
    toggleSubmitTab,
    isSubmittingEditor,
    onConfirmSubmit,
    pythonInputPrompts,
    pythonInputValues,
    setPythonInputValues,
    onStdinSubmit,
    newFolderName,
    setNewFolderName,
    newFolderParent,
    creatingFolder,
    onSubmitCreateFolder,
    newFileFolderId,
    onCreateNewFile,
    isDraftLessonLocked,
  } = props;

  return (
    <div
      style={{
        borderBottom: `1px solid ${t.borderMuted}`,
        background: t.bgPanel,
        padding: 12,
        flexShrink: 0,
        animation: "ide-toast-in 180ms ease-out",
        maxHeight: "60vh",
        overflow: "auto",
      }}
      className="scroll-thin"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: `1px solid ${t.borderMuted}`,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            color: t.textMuted,
          }}
        >
          {panel === "save" && "Save snippet"}
          {panel === "submit" && "Submit code"}
          {panel === "stdin" && "Program input"}
          {panel === "shortcuts" && "Keyboard shortcuts"}
          {panel === "newFolder" && "New folder"}
          {panel === "newFile" && "New file"}
        </span>
        <button
          className="ide-btn ghost icon-only"
          onClick={onClose}
          title="Close (Esc)"
          style={{ marginLeft: "auto", height: 22, width: 22 }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {panel === "save" && activeTab && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto 1fr",
            gap: 10,
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: 12, color: t.textMuted }}>Filename</label>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="text"
              className="ide-input"
              value={saveFileName}
              onChange={(e: any) => setSaveFileName(e.target.value)}
              placeholder="my-snippet"
              autoFocus
              onKeyDown={(e: any) => {
                if (e.key === "Enter" && saveFileName.trim()) onSave();
                else if (e.key === "Escape") onClose();
              }}
              style={{ flex: 1 }}
            />
            <span
              className="ide-mono"
              style={{ fontSize: 12, color: t.textMuted }}
            >
              .{LANGUAGES[activeTab.language as LangKey].ext}
            </span>
          </div>
          <label style={{ fontSize: 12, color: t.textMuted }}>Folder</label>
          <select
            className="ide-input"
            value={saveFolderId}
            onChange={(e: any) => setSaveFolderId(e.target.value)}
          >
            <option value="">(root)</option>
            {folders.map((f: Folder) => (
              <option key={f.id} value={f.id}>
                {f.path}
              </option>
            ))}
          </select>
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: 6,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <button
              className="ide-btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="ide-btn primary"
              onClick={onSave}
              disabled={!saveFileName.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {panel === "submit" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto 1fr",
              gap: 10,
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: 12, color: t.textMuted }}>Title</label>
            <input
              type="text"
              className="ide-input"
              value={submitDraftTitle}
              onChange={(e: any) => setSubmitDraftTitle(e.target.value)}
              placeholder="e.g. Week 3 assignment"
              autoFocus
            />
            <label style={{ fontSize: 12, color: t.textMuted }}>Lesson</label>
            <select
              className="ide-input"
              value={submitDraftLesson}
              onChange={(e: any) => setSubmitDraftLesson(e.target.value)}
            >
              {lessons.length === 0 ? (
                <option value="">No lessons available</option>
              ) : (
                <option value="">Select a lesson…</option>
              )}
              {lessons.map((lesson: Lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
            {isDraftLessonLocked && (
              <div style={{ gridColumn: "2 / -1", color: "#EF4444", fontSize: 11, marginTop: 4 }}>
                Course access has expired. Please renew your subscription
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: t.textMuted,
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Choose which open files to submit
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 6,
              }}
            >
              {tabs.map((tab: Tab) => {
                const empty = !tab.code.trim();
                const isSelected = submitSelectedTabIds.has(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => !empty && toggleSubmitTab(tab.id)}
                    disabled={empty}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: `1px solid ${isSelected ? t.accent : t.borderMuted
                        }`,
                      background: isSelected ? t.accentMuted : t.bgAlt,
                      cursor: empty ? "not-allowed" : "pointer",
                      opacity: empty ? 0.5 : 1,
                      color: t.text,
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "all 0.12s",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        border: `1.5px solid ${isSelected ? t.accent : t.textMuted
                          }`,
                        background: isSelected ? t.accent : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <svg
                          width="9"
                          height="7"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4l2.5 2.5L9 1"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <LangBadge lang={tab.language} />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <span
                        className="ide-mono"
                        style={{
                          fontSize: 12,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tab.title || "untitled"}.
                        {LANGUAGES[tab.language].ext}
                      </span>
                      <span style={{ fontSize: 10, color: t.textMuted }}>
                        {empty
                          ? "(empty)"
                          : tab.submissionId
                            ? "will update existing"
                            : "new submission"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 11, color: t.textMuted }}>
              {submitSelectedTabIds.size} selected
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="ide-btn"
                onClick={onClose}
                disabled={isSubmittingEditor}
              >
                Cancel
              </button>
              <button
                className="ide-btn primary"
                onClick={onConfirmSubmit}
                disabled={
                  !submitDraftTitle.trim() ||
                  !submitDraftLesson ||
                  submitSelectedTabIds.size === 0 ||
                  isSubmittingEditor ||
                  isDraftLessonLocked
                }
              >
                {isSubmittingEditor ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Submitting
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit{" "}
                    {submitSelectedTabIds.size > 1
                      ? `${submitSelectedTabIds.size} files`
                      : "1 file"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {panel === "stdin" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, color: t.textMuted }}>
            Your code calls{" "}
            <code className="ide-mono" style={{ color: t.accent }}>
              input()
            </code>
            . Provide values, then run.
          </div>
          {pythonInputPrompts.map((prompt: string, i: number) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: 8,
                alignItems: "center",
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  color: t.textMuted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={prompt}
              >
                {prompt || `Input ${i + 1}`}
              </label>
              <input
                type="text"
                className="ide-input ide-mono"
                placeholder={`Value for input ${i + 1}…`}
                value={pythonInputValues[i] ?? ""}
                onChange={(e: any) => {
                  const updated = [...pythonInputValues];
                  updated[i] = e.target.value;
                  setPythonInputValues(updated);
                }}
                onKeyDown={(e: any) => {
                  if (
                    e.key === "Enter" &&
                    i === pythonInputPrompts.length - 1
                  ) {
                    onStdinSubmit();
                  } else if (e.key === "Escape") {
                    onClose();
                  }
                }}
                autoFocus={i === 0}
              />
            </div>
          ))}
          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "flex-end",
            }}
          >
            <button className="ide-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="ide-btn primary" onClick={onStdinSubmit}>
              <Play className="h-3.5 w-3.5" />
              Run with inputs
            </button>
          </div>
        </div>
      )}

      {panel === "shortcuts" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 8,
          }}
        >
          {[
            ["Run code", "⌘", "↵"],
            ["Save snippet", "⌘", "S"],
            ["Toggle sidebar", "⌘", "B"],
            ["Toggle console", "⌘", "J"],
            ["New tab", "⌘", "N"],
            ["Close tab", "⌘", "W"],
            ["Show shortcuts", "⌘", "/"],
          ].map(([label, k1, k2]) => (
            <div
              key={label as string}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                borderRadius: 4,
                background: t.bgAlt,
                border: `1px solid ${t.borderMuted}`,
                fontSize: 12,
              }}
            >
              <span>{label}</span>
              <span style={{ display: "flex", gap: 4 }}>
                <kbd>{k1}</kbd>
                <kbd>{k2}</kbd>
              </span>
            </div>
          ))}
        </div>
      )}

      {panel === "newFolder" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, color: t.textMuted }}>
            {newFolderParent != null
              ? "Create a subfolder inside the selected folder."
              : "Create a folder at the root."}
          </div>
          <input
            type="text"
            className="ide-input"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e: any) => setNewFolderName(e.target.value)}
            autoFocus
            onKeyDown={(e: any) => {
              if (e.key === "Enter" && newFolderName.trim())
                onSubmitCreateFolder();
              else if (e.key === "Escape") onClose();
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "flex-end",
            }}
          >
            <button
              className="ide-btn"
              onClick={onClose}
              disabled={creatingFolder}
            >
              Cancel
            </button>
            <button
              className="ide-btn primary"
              onClick={onSubmitCreateFolder}
              disabled={!newFolderName.trim() || creatingFolder}
            >
              {creatingFolder ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      )}

      {panel === "newFile" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 11, color: t.textMuted }}>
            Pick a language for the new file.
            {newFileFolderId != null
              ? " It will be saved in the selected folder by default."
              : ""}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 8,
            }}
          >
            {(Object.keys(LANGUAGES) as LangKey[]).map((lang) => {
              const cfg = LANGUAGES[lang];
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onCreateNewFile(lang)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 6,
                    border: `1px solid ${t.borderMuted}`,
                    background: t.bgAlt,
                    color: t.text,
                    textAlign: "left",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      t.accent;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      t.accentMuted;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      t.borderMuted;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      t.bgAlt;
                  }}
                >
                  <LangBadge lang={lang} size={20} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      {cfg.name}
                    </span>
                    <span
                      className="ide-mono"
                      style={{
                        fontSize: 11,
                        color: t.textMuted,
                      }}
                    >
                      untitled.{cfg.ext}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "flex-end",
            }}
          >
            <button className="ide-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

