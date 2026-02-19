import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  Play,
  Download,
  Copy,
  RotateCcw,
  AlertCircle,
  LogIn,
  MessageSquare,
  Send,
  Link,
  Trash2,
  FilePlus,
  Upload,
  Save,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
// import {java} from "@codemirror/lang-java";
// import {cpp} from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { monokai } from "@uiw/codemirror-theme-monokai";
const codeMirrorExtensions = {
  javascript: [javascript()],
  python: [python()],
  // java: [java()],
  // cpp: [cpp()],
  html: [html()],
  css: [css()],
} as const;
type Snippet = {
  id: number;
  lesson: number | null;
  title: string;
  language: string;
  code_text: string;
  meta: any;
  created_at: string;
  updated_at: string;
};
type UploadedFile = {
  id: number;
  created_at: string;
  updated_at: string;
  student: number;
  lesson: number | null;
  label: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  url: string;
};
type Submission = {
  id: number;
  title?: string | null;
  lesson: number;
  student: number;
  language: string;
  code_text: string;
  status: "submitted" | "graded" | "revised";
  score: string | null;
  feedback: string;
  correction_code: string;
  graded_by_name: number | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
  comments: Comment[];
};
type Comment = {
  id: number;
  author: number;
  author_role: "student" | "teacher";
  author_name: string;
  message: string;
  created_at: string;
};

type MiniSubmission = {
  id: number;
  title?: string | null;
  language: string;
  code_text: string;
  status: "submitted" | "graded" | "revised";
  created_at: string;
  updated_at: string;
};

type SnipCtx = { id: number; title: string; lessonId: string };

export function CodeEditor() {


  const languages = {
    javascript: {
      name: "JavaScript",
      judgeId: 63,
      template: `console.log("Hello, World!");`,
    },
    python: { name: "Python", judgeId: 71, template: `print("Hello, World!")` },
    // java: {
    // name: "Java",
    // judgeId: 62,
    // template: `System.out.println("Hello");`,
    // },
    // cpp: {name: "C++", judgeId: 54, template: `std::cout << "Hello";`},
    html: { name: "HTML", judgeId: null, template: `<h1>Hello</h1>` },
    css: { name: "CSS", judgeId: null, template: `body { color: red; }` },
  } as const;

  const isProgrammaticLoadRef = useRef(false);
  const isDirty = (lang: LangKey) => !!dirtyByLang[lang];

  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const pendingReloadRef = useRef<null | (() => void)>(null);


  const [showPythonInputModal, setShowPythonInputModal] = useState(false);
  const [pythonInputPrompts, setPythonInputPrompts] = useState<string[]>([]);
  const [pythonInputValues, setPythonInputValues] = useState<string[]>([]);
  const pendingStdinRef = useRef<((stdin: string) => void) | null>(null);

  const parsePythonInputs = (code: string): string[] => {
    const regex = /input\s*\(\s*(?:"([^"]*?)"|'([^']*?)')?\s*\)/g;
    const prompts: string[] = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      prompts.push(match[1] ?? match[2] ?? `Input ${prompts.length + 1}`);
    }
    return prompts;
  };

  // last saved title per language (separate from submissionTitle)
  const [saveTitleByLang, setSaveTitleByLang] = useState<Partial<Record<LangKey, string>>>({});
  const [dirtyByLang, setDirtyByLang] = useState<Partial<Record<LangKey, boolean>>>({});

  const markDirty = (lang: LangKey) => {
    setDirtyByLang((prev) => ({ ...prev, [lang]: true }));
  };

  const markSaved = (lang: LangKey) => {
    setDirtyByLang((prev) => ({ ...prev, [lang]: false }));
  };

  const hasAnyUnsaved = () => Object.values(dirtyByLang).some(Boolean);

  // optional: last saved code per language (used in part 2)
  const [lastSavedCodeByLang, setLastSavedCodeByLang] =
    useState<Partial<Record<LangKey, string>>>({});

  // Session and authentication
  const { data: session, status } = useSession();
  const [jsCode, setJsCode] = useState<string>(languages.javascript.template);
  const [webConsole, setWebConsole] = useState<string>("");
  const runIdRef = useRef(0);

  const [snippetLoadingId, setSnippetLoadingId] = useState<number | null>(null);
  const [deletingSnippetId, setDeletingSnippetId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // State variables
  const [submissionTitle, setSubmissionTitle] = useState("");
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(
    null
  );
  const [isSubmittingEditor, setIsSubmittingEditor] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [htmlCode, setHtmlCode] = useState("<h1>Hello</h1>");
  const [cssCode, setCssCode] = useState("body { color: red; }");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState("");
  const [executionError, setExecutionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileLoading, setFileLoading] = useState<number | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [codeBuffers, setCodeBuffers] = useState<Record<string, string>>({
    javascript: languages.javascript.template,
    python: languages.python.template,
    // java: languages.java.template,
    // cpp: languages.cpp.template,
  });
  const [isRotating, setIsRotating] = useState(false);
  const [isImagePreview, setIsImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeSnippetId, setActiveSnippetId] = useState<number | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileTitle, setNewFileTitle] = useState("");
  const [newFileLesson, setNewFileLesson] = useState("");
  const [prepopulatedSaveData, setPrepopulatedSaveData] = useState<{
    title: string;
    lesson: string;
  } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<
    string | null
  >(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => Promise<void>) | null
  >(null);
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  type LangKey = keyof typeof languages;

  type EditCtx = {
    id: number;
    title: string | null;
    lessonId: string; // keep as string for Select
  };

  const [editCtxByLang, setEditCtxByLang] = useState<Partial<Record<LangKey, EditCtx>>>({});
  const [titleByLang, setTitleByLang] = useState<Partial<Record<LangKey, string>>>({});
  const [lessonByLang, setLessonByLang] = useState<Partial<Record<LangKey, string>>>({});

  // Helper: current language context
  const currentEditCtx = editCtxByLang[selectedLanguage as LangKey];
  const currentEditingId = currentEditCtx?.id ?? null;


  const [snippetCtxByLang, setSnippetCtxByLang] =
    useState<Partial<Record<LangKey, SnipCtx>>>({});

  const currentSnippetId = snippetCtxByLang[selectedLanguage as LangKey]?.id ?? null;

  const setLessonForActiveLang = (value: string) => {
    setSelectedLesson(value);
    setLessonByLang((prev) => ({
      ...prev,
      [selectedLanguage as LangKey]: value,
    }));
  };

  const getCodeForLang = (lang: LangKey) => {
    if (lang === "html") return htmlCode;
    if (lang === "css") return cssCode;
    return lang === "javascript" ? jsCode : codeBuffers[lang] ?? languages[lang].template;
  };

  const requestReload = (action: () => void) => {
    if (hasAnyUnsaved()) {
      pendingReloadRef.current = action;
      setShowReloadWarning(true);
    } else {
      action();
    }
  };
  const setTitleForActiveLang = (value: string) => {
    setSubmissionTitle(value);
    setTitleByLang((prev) => ({
      ...prev,
      [selectedLanguage as LangKey]: value,
    }));
  };
  const shortLabel = (s: string, max = 18) => {
    const t = (s || "").trim();
    if (!t) return "";
    return t.length > max ? t.slice(0, max).trimEnd() + "..." : t;
  };

  const openSaveModal = () => {
    const lang = selectedLanguage as LangKey;

    const prefillTitle =
      saveTitleByLang[lang] ??
      snippetCtxByLang[lang]?.title ??
      "";

    setSaveFileName(prefillTitle);
    setShowSaveModal(true);
  };

  const handleResetClick = () => {
    const lang = selectedLanguage as LangKey;

    if (!isDirty(lang)) {
      resetCode();
      return;
    }

    showCustomConfirm(
      "You have unsaved changes. Resetting will delete them. Continue?",
      async () => {
        // mark as clean AFTER reset
        resetCode();
        markSaved(lang);
      }
    );
  };

  // Helper functions
  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const showCustomConfirm = (
    message: string,
    callback: () => Promise<void>
  ) => {
    setConfirmMessage(message);
    setOnConfirmCallback(() => callback);
    setShowConfirm(true);
  };
  const fetchSnippets = async (lessonId?: string) => {
    const u = new URL("/api/code-ide/snippets", window.location.origin);
    if (lessonId) u.searchParams.set("lesson", lessonId);
    const r = await fetch(u);
    if (!r.ok) throw new Error("Failed to fetch snippets");
    return r.json() as Promise<Snippet[]>;
  };
  const fetchSnippetDetail = async (id: number) => {
    const r = await fetch(`/api/code-ide/snippets/${id}`);
    if (!r.ok) throw new Error("Failed to fetch snippet detail");
    return r.json() as Promise<Snippet>;
  };

  const fetchLessons = async () => {
    try {
      const params = new URLSearchParams({
        freezed: "1",
      });

      const res = await fetch(`/api/student/lessons?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch lessons");

      const data = await res.json();
      const lessonList = Array.isArray(data) ? data : data.results || [];

      setLessons(
        lessonList.map((l: any) => ({
          id: String(l.id),
          title: l.title || l.name || l.topic || l.label || `Lesson ${l.id}`,
        }))
      );
    } catch (err) {
      showCustomAlert("Failed to load lessons");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isReloadKey =
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "r"));

      if (!isReloadKey) return;

      if (hasAnyUnsaved()) {
        e.preventDefault();
        requestReload(() => window.location.reload());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dirtyByLang]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasAnyUnsaved()) return;
      e.preventDefault();
      e.returnValue = ""; // triggers native confirm dialog
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirtyByLang]);


  const saveAsFile = async () => {
    if (!session?.user?.sessionToken || isImagePreview || !saveFileName.trim()) return;

    setIsSaving(true);
    try {
      const lang = selectedLanguage as LangKey;

      const body: any = {
        title: saveFileName.trim(),
        language: lang,
        code_text: lang === "html" ? htmlCode : lang === "css" ? cssCode : code,
        lesson: selectedLesson ? parseInt(selectedLesson) : null,
      };

      const existingId = snippetCtxByLang[lang]?.id ?? null;
      if (existingId) body.id = existingId;

      const res = await fetch("/api/code-ide/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Save failed");
      }

      const savedSnippet: Snippet = await res.json();

      setSaveTitleByLang((prev) => ({
        ...prev,
        [lang]: savedSnippet.title,
      }));

      // update list
      setMySnippets((prev) => {
        const exists = prev.some((s) => s.id === savedSnippet.id);
        return exists
          ? prev.map((s) => (s.id === savedSnippet.id ? savedSnippet : s))
          : [savedSnippet, ...prev];
      });

      // ✅ store snippet id per language so tabs never overwrite each other
      setSnippetCtxByLang((prev) => ({
        ...prev,
        [lang]: {
          id: savedSnippet.id,
          title: savedSnippet.title,
          lessonId: savedSnippet.lesson ? String(savedSnippet.lesson) : "",
        },
      }));
      setLastSavedCodeByLang((prev) => ({ ...prev, [lang]: getCodeForLang(lang) }));
      markSaved(lang);

      showCustomAlert(existingId ? "Snippet updated successfully!" : "Snippet saved successfully!");

      setShowSaveModal(false);
      setPrepopulatedSaveData(null);
    } catch (error) {
      showCustomAlert(`Save failed: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSnippet = (id: number) => {
    showCustomConfirm("Are you sure you want to delete this snippet?", async () => {
      setDeletingSnippetId(id);
      try {
        const res = await fetch(`/api/code-ide/snippets/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Delete failed");
        setMySnippets((prev) => prev.filter((s) => s.id !== id));
      } catch {
        showCustomAlert("Delete failed: Endpoint not available");
      } finally {
        setDeletingSnippetId(null);
      }
    });
  };


  const fetchFileContent = async (file: UploadedFile) => {
    try {
      const apiRes = await fetch(`/api/code-ide/uploads/${file.id}/content`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        throw new Error(`Failed to fetch file content: ${apiRes.status}`);
      }
      const content = await apiRes.text();
      return content;
    } catch (error) {
      throw new Error(
        "File content unavailable. The file may be private or the server may be experiencing issues."
      );
    }
  };
  const uploadFile = async (file: File, lesson?: string, label?: string) => {
    if (!session?.user?.sessionToken) return;
    if (file.size > MAX_FILE_SIZE) {
      showCustomAlert("File size exceeds 25MB limit");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    if (lesson) formData.append("lesson", lesson);
    if (label) formData.append("label", label);
    setUploading(true);
    setUploadProgress(0);
    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(percent);
        }
      });
      const res = await new Promise<UploadedFile>((resolve, reject) => {
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
      setActiveTab("files");
      setUploadSuccessMessage("File uploaded successfully!");
      setTimeout(() => setUploadSuccessMessage(null), 3000);
      return res;
    } catch (error) {
      showCustomAlert(`Upload failed: ${(error as Error).message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const updateSubmission = async () => {
    const lang = selectedLanguage as LangKey;
    const ctx = editCtxByLang[lang];

    if (!ctx?.id) throw new Error("No submission selected to update");

    const lessonId = lessonByLang[lang] ?? selectedLesson;
    if (!lessonId) throw new Error("No lesson selected");

    const title = (titleByLang[lang] ?? submissionTitle).trim() || null;

    const body = {
      title,
      language: lang,
      code_text:
        lang === "html" ? htmlCode : lang === "css" ? cssCode : code,
    };

    const res = await fetch(`/api/code-ide/submissions/${ctx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Update failed");
    }

    const updated: Submission = await res.json();

    // update list
    setMySubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    // refresh edit context (title/lesson may change)
    setEditCtxByLang((prev) => ({
      ...prev,
      [lang]: {
        id: updated.id,
        title: updated.title ?? null,
        lessonId: String(updated.lesson),
      },
    }));
    setTitleByLang((prev) => ({ ...prev, [lang]: updated.title ?? "" }));
    setLessonByLang((prev) => ({ ...prev, [lang]: String(updated.lesson) }));

    return updated;
  };

  const loadSubmissionIntoEditor = (sub: Submission) => {
    const lang = sub.language as LangKey;

    // ✅ store editing context per language
    setEditCtxByLang((prev) => ({
      ...prev,
      [lang]: {
        id: sub.id,
        title: sub.title ?? null,
        lessonId: String(sub.lesson),
      },
    }));

    // keep per-language title + lesson in sync
    setTitleByLang((prev) => ({ ...prev, [lang]: sub.title ?? "" }));
    setLessonByLang((prev) => ({ ...prev, [lang]: String(sub.lesson) }));

    // switch UI to the right language tab
    setSelectedLanguage(lang);

    // restore form fields for that language
    setSubmissionTitle(sub.title ?? "");
    setSelectedLesson(String(sub.lesson));

    // load code into correct buffer
    if (lang === "html") {
      setHtmlCode(sub.code_text || "");
    } else if (lang === "css") {
      setCssCode(sub.code_text || "");
    } else {
      setCode(sub.code_text || "");

      // ✅ IMPORTANT: if it's JS, keep jsCode in sync
      if (lang === "javascript") {
        setJsCode(sub.code_text || "");
      }

      // ✅ keep buffers in sync so tab switching restores correctly
      setCodeBuffers((prev) => ({
        ...prev,
        [lang]: sub.code_text || languages[lang].template,
      }));
    }
    isProgrammaticLoadRef.current = true;
    try {
      // setSelectedLanguage, setCode, setHtmlCode...
    } finally {
      // let CodeMirror settle before allowing dirty again
      setTimeout(() => {
        isProgrammaticLoadRef.current = false;
      }, 0);
    }

    setSaveTitleByLang((prev) => ({
      ...prev,
      [lang]: sub.title ?? "",
    }));

    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
    setSyntaxError(null);
    setIsImagePreview(false);
    setImagePreviewUrl("");
    setActiveTab("editor");
  };



  const deleteUploadedFile = (id: number) => {
    showCustomConfirm(
      "Are you sure you want to delete this file?",
      async () => {
        setDeletingFileId(id);
        try {
          const res = await fetch(`/api/code-ide/uploads/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const error = await res
              .json()
              .catch(() => ({ error: "Delete failed" }));
            throw new Error(error.error || "Delete failed");
          }
          setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
        } catch (error) {
          showCustomAlert(`Delete failed: ${(error as Error).message}`);
        } finally {
          setDeletingFileId(null);
        }
      }
    );

  };
  const loadFile = async (file: UploadedFile) => {
    try {
      setFileLoading(file.id);
      setLoading(true);
      const contentType = file.content_type;
      const extension = file.original_name.split(".").pop()?.toLowerCase();
      const isImage =
        contentType.includes("image/") ||
        ["png", "jpg", "jpeg"].includes(extension || "");
      if (isImage) {
        setIsImagePreview(true);
        setImagePreviewUrl(file.url);
        setSelectedLanguage("html");
        setHtmlCode(
          `<img src="${file.url}" alt="${file.original_name}" style="max-width: 100%; height: auto;" />`
        );
        if (file.lesson) setSelectedLesson(String(file.lesson));
        setActiveTab("editor");
        return;
      }
      setIsImagePreview(false);
      const content = await fetchFileContent(file);
      const languageMap: { [key: string]: string } = {
        "text/x-python": "python",
        "application/javascript": "javascript",
        "text/javascript": "javascript",
        "text/html": "html",
        "text/css": "css",
        // "text/x-java": "java",
        // "text/x-c++": "cpp",
        "text/plain":
          extension === "py"
            ? "python"
            : extension === "js"
              ? "javascript"
              : extension === "html"
                ? "html"
                : extension === "css"
                  ? "css"
                  : "javascript",
      };
      let language = languageMap[contentType] || "javascript";
      if (contentType === "text/plain" && extension && languageMap[extension]) {
        language = languageMap[extension];
      }
      if (language === "html") {
        setHtmlCode(content);
      } else if (language === "css") {
        setCssCode(content);
      } else {
        setCode(content);
      }
      setSelectedLanguage(language);
      if (file.lesson) setSelectedLesson(String(file.lesson));
      setActiveTab("editor");
    } catch (error) {
      showCustomAlert(
        `Failed to load file content: ${(error as Error).message}`
      );
    } finally {
      setFileLoading(null);
      setLoading(false);
    }
  };
  const copyFileUrl = (file: UploadedFile) => {
    navigator.clipboard
      .writeText(file.url)
      .then(() => {
        showCustomAlert("File URL copied to clipboard");
      })
      .catch(() => {
        showCustomAlert("Failed to copy URL");
      });
  };
  const fetchSubmissions = async (lessonId?: string) => {
    const u = new URL("/api/code-ide/submissions", window.location.origin);
    if (lessonId) u.searchParams.set("lesson", lessonId);
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) throw new Error("Failed to fetch submissions");
    return r.json() as Promise<Submission[]>;
  };
  const fetchSubmissionDetail = async (id: number) => {
    const r = await fetch(`/api/code-ide/submissions/${id}`, {
      cache: "no-store",
    });
    if (!r.ok) throw new Error("Failed to fetch submission detail");
    return r.json() as Promise<Submission>;
  };
  const addComment = async (submissionId: number, message: string) => {
    const res = await fetch(
      `/api/code-ide/submissions/${submissionId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }
    );
    if (!res.ok) throw new Error("Comment failed");
    return res.json() as Promise<Comment>;
  };
  const createSubmission = async () => {
    if (!selectedLesson) throw new Error("No lesson selected");
    const body = {
      title: submissionTitle.trim() || null,
      lesson: parseInt(selectedLesson),
      language: selectedLanguage,
      code_text:
        selectedLanguage === "html"
          ? htmlCode
          : selectedLanguage === "css"
            ? cssCode
            : code,
    };
    const res = await fetch("/api/code-ide/submissions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Submission failed");
    }
    const created: Submission = await res.json();
    setMySubmissions((prev) => [created, ...prev]);
    setSubmissionTitle("");
    return created;
  };
  const gradeSubmission = async (
    id: number,
    updates: {
      score?: string;
      feedback?: string;
      correction_code?: string;
      status?: "graded" | "revised";
    }
  ) => {
    const res = await fetch(`/api/code-ide/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Grading failed");
    const updated: Submission = await res.json();
    setMySubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };
  const handleLogout = async () => {
    await fetch("/api/auth/logout-route", { method: "POST" }).catch(() => { });
    document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
    document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
    window.location.href = "/login";
  };
  const copyCode = () => {
    const text =
      selectedLanguage === "html"
        ? htmlCode
        : selectedLanguage === "css"
          ? cssCode
          : code;
    navigator.clipboard.writeText(text);
  };
  const downloadCode = () => {
    const ext = {
      javascript: "js",
      python: "py",
      // java: "java",
      // cpp: "cpp",
      html: "html",
      css: "css",
    } as const;
    const content =
      selectedLanguage === "html"
        ? htmlCode
        : selectedLanguage === "css"
          ? cssCode
          : code;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `code.${ext[selectedLanguage as keyof typeof ext]}`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCode = () => {
    const lang = selectedLanguage as LangKey;

    setCode(languages[lang].template);
    if (lang === "html") setHtmlCode(languages.html.template);
    if (lang === "css") setCssCode(languages.css.template);

    // clear snippet association for this language
    setSnippetCtxByLang((prev) => {
      const copy = { ...prev };
      delete copy[lang];
      return copy;
    });

    // clear saved-title cache for this language (so Save As opens blank)
    setSaveTitleByLang((prev) => {
      const copy = { ...prev };
      delete copy[lang];
      return copy;
    });

    // mark clean
    setDirtyByLang((prev) => ({ ...prev, [lang]: false }));

    setSaveFileName("");
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
    setSyntaxError(null);
    setIsImagePreview(false);
    setImagePreviewUrl("");
    setActiveTab("editor");
    setEditingSubmissionId(null);
    setSubmissionTitle("");
  };

  const handleLanguageChange = (lang: string) => {
    const languageKey = lang as LangKey;

    // Save outgoing code buffer for JS/Python (non html/css)
    if (selectedLanguage !== "html" && selectedLanguage !== "css") {
      // ✅ if leaving JS tab, also persist jsCode
      if (selectedLanguage === "javascript") {
        setJsCode(code);
      }

      setCodeBuffers((prev) => ({
        ...prev,
        [selectedLanguage]: code,
      }));
    }


    setSelectedLanguage(languageKey);

    // Restore code per new language
    if (languageKey === "html") {
      // htmlCode already stateful
    } else if (languageKey === "css") {
      // cssCode already stateful
    } else {
      if (languageKey === "javascript") setCode(jsCode);
      else setCode(codeBuffers[languageKey] || languages[languageKey].template);
    }


    // ✅ Restore per-language lesson + title so Update targets correct submission
    const restoredLesson = lessonByLang[languageKey] ?? "";
    const restoredTitle =
      titleByLang[languageKey] ??
      (editCtxByLang[languageKey]?.title ?? "") ??
      "";

    setSelectedLesson(restoredLesson);
    setSubmissionTitle(restoredTitle);

    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
    setSyntaxError(null);
    setIsImagePreview(false);
    setImagePreviewUrl("");
    setActiveTab("editor");
  };

  const handleCodeChange = (value: string) => {
    if (isImagePreview) return;
    if (selectedLanguage === "html") {
      setHtmlCode(value);
    } else if (selectedLanguage === "css") {
      setCssCode(value);
    } else {
      setCode(value);
      if (selectedLanguage === "javascript") setJsCode(value);
    }

    setSyntaxError(null);
    if (selectedLanguage === "javascript") {
      try {
        new Function(value);
      } catch (e: any) {
        setSyntaxError(`Syntax Error: ${e.message}`);
      }
    } else if (selectedLanguage === "css") {
      const cssErrors = validateCSS(value);
      if (cssErrors) {
        setSyntaxError(cssErrors);
      }
    } else if (selectedLanguage === "html") {
      const htmlErrors = validateHTML(value);
      if (htmlErrors) {
        setSyntaxError(htmlErrors);
      }
    }
    if (selectedLanguage === "html" || selectedLanguage === "css") {
      setHtmlPreview(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${cssCode}</style>
          </head>
          <body>
            ${htmlCode}
          </body>
        </html>
      `);
    }
    if (!isProgrammaticLoadRef.current) {
      markDirty(selectedLanguage as LangKey);
    }

  };

  const validateCSS = (css: string): string | null => {
    try {
      if (css.includes("{")) {
        const rules = css.split("}").map((rule) => rule.trim());
        for (const rule of rules) {
          if (rule && !rule.includes("{")) {
            return "Missing opening brace";
          }
          if (rule && !rule.includes(";")) {
            return "Missing semicolon in CSS rule";
          }
        }
      }
      return null;
    } catch {
      return "Invalid CSS syntax";
    }
  };
  const validateHTML = (html: string): string | null => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        return "Invalid HTML syntax";
      }
      return null;
    } catch {
      return "Invalid HTML syntax";
    }
  };

  const loadSnippet = async (snippet: Snippet) => {
    setSnippetLoadingId(snippet.id);
    try {
      const detailedSnippet = await fetchSnippetDetail(snippet.id);

      setHtmlCode(languages.html.template);
      setCssCode(languages.css.template);
      setCode(languages.javascript.template);

      if (detailedSnippet.language === "html") setHtmlCode(detailedSnippet.code_text);
      else if (detailedSnippet.language === "css") setCssCode(detailedSnippet.code_text);
      else setCode(detailedSnippet.code_text);

      //✅ per-language snippet id fix (if you implemented it)
      setSnippetCtxByLang((prev) => ({
        ...prev,
        [detailedSnippet.language as LangKey]: {
          id: detailedSnippet.id,
          title: detailedSnippet.title,
          lessonId: detailedSnippet.lesson ? String(detailedSnippet.lesson) : "",
        },
      }));
      setSaveTitleByLang((prev) => ({
        ...prev,
        [detailedSnippet.language as LangKey]: detailedSnippet.title,
      }));

      setSelectedLanguage(detailedSnippet.language);
      if (detailedSnippet.lesson) setSelectedLesson(String(detailedSnippet.lesson));
      setActiveTab("editor");
      setSyntaxError(null);
      setIsImagePreview(false);
    } catch {
      showCustomAlert("Failed to load snippet");
    } finally {
      setSnippetLoadingId(null);
    }
    isProgrammaticLoadRef.current = true;
    try {
      // setSelectedLanguage, setCode, setHtmlCode...
    } finally {
      // let CodeMirror settle before allowing dirty again
      setTimeout(() => {
        isProgrammaticLoadRef.current = false;
      }, 0);
    }

  };


  const copySnippetUrl = (id: number) => {
    const url = `${window.location.origin}/api/code-ide/snippets/${id}`;
    navigator.clipboard.writeText(url);
    showCustomAlert("Snippet URL copied to clipboard");
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fileInputRef.current) {
      if (file.size > MAX_FILE_SIZE) {
        showCustomAlert("File size exceeds 25MB limit");
        return;
      }
      fileInputRef.current.value = "";
      await uploadFile(
        file,
        selectedLesson || undefined,
        `Uploaded ${file.name}`
      );
    }
  };

  const buildWebDoc = (h: string, c: string, j: string, runId: number) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>${c ?? ""}</style>
  </head>

  <body>
    ${h ?? ""}

    <script>
      (function () {
        const RUN_ID = ${runId};

        function send(type, msg) {
          try {
            window.parent.postMessage(
              { source: "web-iframe", type, message: String(msg), runId: RUN_ID },
              "*"
            );
          } catch {}
        }

        // console bridge
        const _log = console.log;
        const _warn = console.warn;
        const _err = console.error;

        console.log = (...args) => { send("log", args.map(String).join(" ")); _log.apply(console, args); };
        console.warn = (...args) => { send("warn", args.map(String).join(" ")); _warn.apply(console, args); };
        console.error = (...args) => { send("error", args.map(String).join(" ")); _err.apply(console, args); };

        // runtime errors
        window.onerror = function (message, source, line, col, error) {
          send("error", (error && error.stack) ? error.stack : message + " (" + line + ":" + col + ")");
        };

        // promise errors
        window.addEventListener("unhandledrejection", function (event) {
          const reason = event.reason;
          send("error", reason && reason.stack ? reason.stack : reason);
        });

        })();
            </script>

            <script>
              // user code runs at global scope so onclick= handlers can find functions
              try {
                ${j ?? ""}
              } catch (e) {
                const msg = e && e.stack ? e.stack : e;
                try {
                  window.parent.postMessage(
                    { source: "web-iframe", type: "error", message: String(msg), runId: ${runId} },
                    "*"
                  );
                } catch {}
              }
            </script>
  </body>
</html>
`;

  const executeWithJudge0 = async (codeToRun: string, langId: number, stdin: string) => {
    const res = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "aa76b3efa6msh96695e665e5f57fp105d9cjsn87230da97198",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: codeToRun,
          language_id: langId,
          stdin,
        }),
      }
    );
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const result = await res.json();
    if (result.status?.id === 3) {
      setOutput(result.stdout || "Success (no output)");
      setSuccessMessage("Code executed successfully!");
    } else if (result.status?.id === 6) {
      setOutput(`Compilation Error:\n${result.compile_output || result.stderr}`);
    } else if (result.status?.id === 5) {
      setOutput("Time Limit Exceeded");
    } else if (result.status?.id === 4) {
      setOutput(`Runtime Error:\n${result.stderr}`);
    } else {
      setOutput(result.stderr || result.stdout || "Unknown error");
    }
  };

  const runCode = async () => {
    if (isImagePreview) {
      setOutput("Image preview mode: No code to execute");
      setActiveTab("output");
      return;
    }
    setIsRunning(true);
    setOutput("");
    setWebConsole("");

    setExecutionError("");
    setSuccessMessage(null);
    try {
      if (error === "Session expired" || error === "Not authenticated") {
        setOutput("Session expired. Please log in again.");
        setActiveTab("output");
        return;
      }
      if (selectedLanguage === "javascript") {
        const logs: string[] = [];
        const original = console.log;
        console.log = (...a) => logs.push(a.map(String).join(" "));
        try {
          new Function(code)();
          setOutput(
            logs.join("\n") || "Code executed successfully (no output)"
          );
          setSuccessMessage("Code executed successfully!");
        } catch (e: any) {
          setOutput(`Error: ${e.message}`);
        } finally {
          console.log = original;
        }
      } else if (selectedLanguage === "html" || selectedLanguage === "css") {
        // new run
        runIdRef.current += 1;
        const runId = runIdRef.current;

        setWebConsole(""); // clear console for this run

        const finalHtml = htmlCode;
        const finalCss = cssCode;
        const finalJs = jsCode;

        setHtmlPreview(buildWebDoc(finalHtml, finalCss, finalJs, runId));
        setOutput("Rendered preview (HTML + CSS + JS).");
        setSuccessMessage("Rendered successfully!");
      }
      else {
        const cfg = languages[selectedLanguage as keyof typeof languages];
        if (cfg.judgeId) {
          try {
            const prompts = selectedLanguage === "python" ? parsePythonInputs(code) : [];

            if (prompts.length > 0) {
              // Show input modal — execution continues in the callback
              setPythonInputPrompts(prompts);
              setPythonInputValues(Array(prompts.length).fill(""));
              pendingStdinRef.current = async (stdin: string) => {
                try {
                  await executeWithJudge0(code, cfg.judgeId!, stdin);
                } catch {
                  setExecutionError("Online execution unavailable. Using local simulation.");
                  setOutput("Simulated output for " + selectedLanguage);
                } finally {
                  setIsRunning(false);
                  setActiveTab("output");
                }
              };
              setShowPythonInputModal(true);
              // Don't setIsRunning(false) here — modal confirm/cancel handles it
              return;
            }

            // No input() calls — run immediately with empty stdin
            await executeWithJudge0(code, cfg.judgeId, "");
          } catch {
            setExecutionError("Online execution unavailable. Using local simulation.");
            setOutput("Simulated output for " + selectedLanguage);
          }
        } else {
          setOutput("Language not supported for execution");
        }
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
      setActiveTab("output");
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };


  const handleEditorSubmit = async () => {
    if (!submissionTitle.trim()) {
      showCustomAlert("Submission Title is required");
      return;
    }

    const lang = selectedLanguage as LangKey;
    const isEditingThisLang = !!editCtxByLang[lang]?.id;
    const lessonId = lessonByLang[lang] ?? selectedLesson;
    if (!lessonId) return showCustomAlert("Please select a lesson");
    if (isSubmittingEditor) return;

    setIsSubmittingEditor(true);
    try {
      if (isEditingThisLang) {
        await updateSubmission();
        showCustomAlert("Submission updated successfully");
      } else {
        await createSubmission(); // (optional: also make createSubmission use lessonByLang/titleByLang like update does)
        showCustomAlert("Submitted successfully");
      }
    } catch (error) {
      showCustomAlert(
        `${isEditingThisLang ? "Update" : "Submission"} failed: ${(error as Error).message
        }`
      );
    } finally {
      setIsSubmittingEditor(false);
    }
  };


  const handleSubmissionTabSubmit = async () => {
    if (!submissionTitle.trim()) {
      showCustomAlert("Submission Title is required");
      return;
    }
    if (!selectedLesson) return showCustomAlert("Please select a lesson");

    try {
      // IMPORTANT: always create from Submission tab
      await createSubmission();
      showCustomAlert("Submitted successfully");
    } catch (error) {
      showCustomAlert(`Submission failed: ${(error as Error).message}`);
    }
  };

  const handleNewFileCreate = () => {
    if (!newFileTitle.trim()) return showCustomAlert("Title required");
    setSnippetCtxByLang((prev) => {
      const copy = { ...prev };
      delete copy[selectedLanguage as LangKey];
      return copy;
    });

    setShowNewFileModal(false);
    setShowSaveModal(false);
    setNewFileTitle("");
    setNewFileLesson("");
    resetCode();
    setActiveTab("editor");
    setPrepopulatedSaveData({
      title: newFileTitle,
      lesson: newFileLesson || "",
    });
    setTimeout(() => {
      setSaveFileName(newFileTitle);
      setSelectedLesson(newFileLesson || "");
      setShowSaveModal(true);
    }, 150);
  };
  const filteredSnippets = mySnippets.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUploads = uploadedFiles.filter((f) =>
    (f.label || f.original_name)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const paginatedSnippets = filteredSnippets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginatedUploads = filteredUploads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalSnippetPages = Math.ceil(filteredSnippets.length / itemsPerPage);
  const totalUploadPages = Math.ceil(filteredUploads.length / itemsPerPage);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || data.source !== "web-iframe") return;

      // ignore logs from old runs
      if (data.runId !== runIdRef.current) return;

      const line =
        data.type === "error"
          ? `❌ ${data.message}`
          : data.type === "warn"
            ? `⚠️ ${data.message}`
            : data.message;

      setWebConsole((prev) => (prev ? prev + "\n" + line : line));
    };

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Effects
  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !session?.user?.sessionToken) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(false);

    // ✅ only set defaults if truly empty
    if (!code && selectedLanguage !== "html" && selectedLanguage !== "css") {
      setCode(languages[selectedLanguage as LangKey].template);
    }
    if (selectedLanguage === "html" && !htmlCode.trim()) {
      setHtmlCode(languages.html.template);
    }
    if (selectedLanguage === "css" && !cssCode.trim()) {
      setCssCode(languages.css.template);
    }
  }, [session, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetchLessons(),
      fetchSnippets().then((snips) => {
        setMySnippets(snips);
      }),
      fetchSubmissions()
        .then(setMySubmissions)
        .catch(() => { }),
      fetch("/api/code-ide/uploads")
        .then((res) => (res.ok ? res.json() : []))
        .then(setUploadedFiles)
        .catch(() => setUploadedFiles([])),
    ]).catch(() => { });
  }, [status]);
  useEffect(() => {
    if (!session || isImagePreview) return;
    const draft = {
      language: selectedLanguage,
      code:
        selectedLanguage === "html"
          ? htmlCode
          : selectedLanguage === "css"
            ? cssCode
            : code,
      htmlCode: selectedLanguage === "html" ? code : htmlCode,
      cssCode: selectedLanguage === "css" ? code : cssCode,
      lesson: selectedLesson,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("code-ide-draft", JSON.stringify(draft));
  }, [
    code,
    htmlCode,
    cssCode,
    selectedLanguage,
    selectedLesson,
    session,
    isImagePreview,
  ]);
  useEffect(() => {
    if (prepopulatedSaveData) {
      setSaveFileName(prepopulatedSaveData.title);
      setSelectedLesson(prepopulatedSaveData.lesson);
    }
  }, [prepopulatedSaveData]);
  if (loading && !fileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
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
  return (
    <>
      <Dialog open={showReloadWarning} onOpenChange={setShowReloadWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have code that hasn’t been saved. If you reload, unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                pendingReloadRef.current = null;
                setShowReloadWarning(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#EF7B55] hover:bg-[#F79771]"
              onClick={() => {
                const action = pendingReloadRef.current;
                pendingReloadRef.current = null;
                setShowReloadWarning(false);
                action?.();
              }}
            >
              Reload anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Snippet</DialogTitle>
            <DialogDescription>
              Save your code as a snippet with title and optional lesson.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="snippet-title" className="text-right">
                Title
              </Label>
              <Input
                id="snippet-title"
                className="col-span-3"
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                placeholder="My code snippet"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="snippet-lesson" className="text-right">
                Lesson
              </Label>
              <Select
                value={selectedLesson}
                onValueChange={(value) => setLessonForActiveLang(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select lesson (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveModal(false);
                setSaveFileName("");
                setPrepopulatedSaveData(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={saveAsFile}
              disabled={!saveFileName.trim() || isSaving}
              className="bg-[#EF7B55] hover:bg-[#F79771]"
            >
              {isSaving ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Snippet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showNewFileModal} onOpenChange={setShowNewFileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Snippet</DialogTitle>
            <DialogDescription>
              Create a new snippet. Fill in details and click "Create" to start
              editing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-title" className="text-right">
                Title
              </Label>
              <Input
                id="new-title"
                className="col-span-3"
                value={newFileTitle}
                onChange={(e) => setNewFileTitle(e.target.value)}
                placeholder="My new snippet"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-lesson" className="text-right">
                Lesson
              </Label>
              <Select value={newFileLesson} onValueChange={setNewFileLesson}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select lesson (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewFileModal(false);
                setNewFileTitle("");
                setNewFileLesson("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewFileCreate}
              disabled={!newFileTitle.trim()}
              className="bg-[#EF7B55] hover:bg-[#F79771]"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showAlert} onOpenChange={setShowAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alert</DialogTitle>
            <DialogDescription>{alertMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowAlert(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
            <DialogDescription>{confirmMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={confirmLoading} onClick={() => setShowConfirm(false)}>
              No
            </Button>

            <Button
              disabled={confirmLoading}
              onClick={async () => {
                if (!onConfirmCallback) return;
                setConfirmLoading(true);
                try {
                  await onConfirmCallback();
                } finally {
                  setConfirmLoading(false);
                  setShowConfirm(false);
                }
              }}
            >
              {confirmLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Yes"
              )}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showPythonInputModal} onOpenChange={setShowPythonInputModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Program Input
              </DialogTitle>
              <DialogDescription className="text-sm text-white/50 mt-1">
                Your code calls <code className="text-[#EF7B55]">input()</code> — provide values before running
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Input fields */}
          <div className="px-6 py-5 space-y-4 bg-white dark:bg-[#0f0f23]">
            {pythonInputPrompts.map((prompt, i) => (
              <div key={i} className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {prompt || `Input ${i + 1}`}
                </Label>
                <Input
                  placeholder={`Value for input ${i + 1}...`}
                  value={pythonInputValues[i] ?? ""}
                  onChange={(e) => {
                    const updated = [...pythonInputValues];
                    updated[i] = e.target.value;
                    setPythonInputValues(updated);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && i === pythonInputPrompts.length - 1) {
                      const stdin = pythonInputValues.join("\n");
                      setShowPythonInputModal(false);
                      pendingStdinRef.current?.(stdin);
                    }
                  }}
                  autoFocus={i === 0}
                  className="font-mono text-sm"
                />
              </div>
            ))}
          </div>

          <div className="px-6 pb-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPythonInputModal(false);
                pendingStdinRef.current = null;
                setIsRunning(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#EF7B55] hover:bg-[#F79771] text-white"
              onClick={() => {
                const stdin = pythonInputValues.join("\n");
                setShowPythonInputModal(false);
                pendingStdinRef.current?.(stdin);
              }}
            >
              <Play className="mr-2 h-3.5 w-3.5" />
              Run with inputs
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <style jsx>{`
        .code-editor-textarea {
          background: #2b2b2b;
          color: #f8f8f2;
          font-family: "Fira Code", monospace;
          border: none;
          border-radius: 4px;
          padding: 8px;
          line-height: 1.5;
          caret-color: #f8f8f2;
          width: 100%;
          box-sizing: border-box;
        }
        .code-editor-textarea:focus {
          outline: none;
          box-shadow: 0 0 0 2px #ef7b55;
        }
        .code-editor-textarea::selection {
          background: #44475a;
        }
        .error-line {
          border-left: 2px solid #ff5555;
          background: #ff555522;
        }
        .tab-content {
          background: #1e1e1e;
          border-radius: 4px;
          width: 100%;
        }
        .syntax-error {
          background: #ff555522;
          border: 1px solid #ff5555;
          color: #ff5555;
          padding: 6px;
          border-radius: 4px;
          margin-top: 6px;
          font-size: 0.75rem;
        }
        .codemirror-container {
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #44475a;
          width: 100%;
        }
        .codemirror-container .cm-editor {
          height: 50vh;
          min-height: 200px;
          max-height: 600px;
          font-family: "Fira Code", monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .codemirror-container .cm-focused {
          outline: 2px solid #ef7b55;
        }
        .image-preview {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          border: 1px solid #44475a;
          background: #2b2b2b;
          padding: 8px;
        }
        .file-url {
          font-size: 0.75rem;
          color: #a0a0a0;
          word-break: break-all;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .language-tabs {
          background: #f797712e;
          border-radius: 4px;
          margin-bottom: 6px;
          width: 100%;
          overflow-x: auto;
        }
        .language-tabs .tab-trigger {
          flex: 1;
          text-align: center;
          padding: 6px 8px;
          color: #334155;
          font-size: 0.75rem;
          font-weight: 500;
          min-width: 80px;
        }
        .language-tabs .tab-trigger[data-state="active"] {
          background: #ef7b55;
          color: white;
        }
        .main-tabs {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
        }
        .main-tabs .tabs-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .main-tabs .tabs-trigger {
          width: 100%;
          padding: 8px;
          font-size: 0.875rem;
        }
        @media (min-width: 640px) {
          .main-tabs .tabs-list {
            flex-direction: row;
            gap: 8px;
          }
          .main-tabs .tabs-trigger {
            width: auto;
            padding: 8px 16px;
          }
          .language-tabs .tab-trigger {
            font-size: 0.875rem;
            padding: 8px 12px;
          }
          .codemirror-container .cm-editor {
            font-size: 0.875rem;
          }
          .syntax-error {
            font-size: 0.875rem;
            padding: 8px;
          }
        }
        @media (min-width: 1024px) {
          .space-y-4 {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          .codemirror-container .cm-editor {
            height: 400px;
            font-size: 0.875rem;
          }
          .language-tabs .tab-trigger {
            font-size: 0.875rem;
            padding: 8px 16px;
          }
        }
        .output-iframe {
          width: 100%;
          height: 50vh;
          min-height: 200px;
          max-height: 600px;
        }
        .output-console {
          width: 100%;
          height: 50vh;
          min-height: 200px;
          max-height: 600px;
        }
        .editor-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .editor-buttons button {
          flex: 1 1 auto;
          min-width: 80px;
          padding: 6px;
          font-size: 0.75rem;
        }
        @media (min-width: 640px) {
          .editor-buttons {
            gap: 8px;
          }
          .editor-buttons button {
            min-width: 100px;
            padding: 8px;
            font-size: 0.875rem;
          }
        }
        .files-tab {
          width: 100%;
        }
        .files-tab .accordion-item {
          font-size: 0.75rem;
        }
        @media (min-width: 640px) {
          .files-tab .accordion-item {
            font-size: 0.875rem;
          }
        }
        .submission-tab .select-trigger {
          width: 100%;
        }
        .submission-tab .submission-item {
          font-size: 0.75rem;
        }
        @media (min-width: 640px) {
          .submission-tab .submission-item {
            font-size: 0.875rem;
          }
        }
        .snippet-item {
          font-size: 0.875rem;
        }
      `}</style>
      <div className="space-y-4 py-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Code IDE</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Write, run, and test your code in multiple programming languages
            with real-time execution
          </p>
        </div>
        {executionError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{executionError}</AlertDescription>
          </Alert>
        )}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="main-tabs"
        >
          <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col items-center lg:flex-row w-full gap-2 mb-3 sm:mb-14">
            <TabsTrigger
              value="editor"
              className="tabs-trigger bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3"
            >
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="tabs-trigger bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3"
            >
              Output
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="tabs-trigger bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3"
            >
              Files
            </TabsTrigger>
            <TabsTrigger
              value="submission"
              className="tabs-trigger bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3"
            >
              Submission
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="tab-content">
            <Card className="flex flex-col w-full border-none">
              <CardHeader className="p-0 py-4 sm:py-4">
                {/* <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">
                    Code Editor
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={resetCode}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div> */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">
                    Code Editor
                  </CardTitle>
                  <Button
                    variant="outline"
                    className="hover:bg-[#EF7855]/20"
                    size="sm"
                    onClick={() => {
                      setIsRotating(true);
                      handleResetClick();
                      setTimeout(() => setIsRotating(false), 1000); // Match animation duration
                    }}
                  >
                    <RotateCcw
                      className={`h-4 w-4 ${isRotating ? "animate-spin-ccw" : ""
                        }`}
                    />
                  </Button>
                </div>
                <Tabs
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}
                  className="language-tabs"
                >
                  <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col items-center lg:flex-row w-full gap-2 mb-3 sm:mb-14">
                    {Object.entries(languages).map(([key, lang]) => {
                      const k = key as LangKey;
                      const ctx = editCtxByLang[k];
                      const label = (titleByLang[k] ?? ctx?.title ?? "").toString().trim();
                      const display = label ? shortLabel(label, 18) : `#${ctx?.id}`;

                      return (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-2"
                        >
                          <span>{lang.name}</span>

                          {ctx?.id && (
                            <span
                              className="ml-1 rounded-md px-2 py-0.5 text-[10px] leading-none bg-black/10 data-[state=active]:bg-white/20 max-w-[110px] truncate"
                              title={label || `Submission #${ctx.id}`}
                            >
                              {display}
                            </span>
                          )}
                        </TabsTrigger>
                      );
                    })}


                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col px-0">
                {isImagePreview ? (
                  <div className="image-preview">
                    <img
                      src={imagePreviewUrl}
                      alt="Uploaded image"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  </div>
                ) : (
                  <div
                    className={`codemirror-container ${syntaxError ? "error-line" : ""
                      }`}
                  >
                    <CodeMirror
                      value={
                        selectedLanguage === "html"
                          ? htmlCode
                          : selectedLanguage === "css"
                            ? cssCode
                            : code
                      }
                      extensions={[
                        ...(codeMirrorExtensions[
                          selectedLanguage as keyof typeof codeMirrorExtensions
                        ] as any),
                        EditorView.lineWrapping, // ✅ wrap long lines
                      ]}
                      theme={monokai}
                      height="50vh"
                      basicSetup={{
                        lineNumbers: true,
                        tabSize: 2,
                        indentOnInput: true,
                      }}
                      editable={!loading}
                      onChange={handleCodeChange}
                      className="flex-1"
                    />

                  </div>
                )}
                {syntaxError && !isImagePreview && (
                  <div className="syntax-error">{syntaxError}</div>
                )}
                <div className="editor-buttons mt-4">
                  {selectedLanguage !== "css" && selectedLanguage !== "javascript" && (
                    <Button
                      onClick={runCode}
                      disabled={isRunning || !!error || loading}
                      className="bg-[#EF7B55]/70 hover:bg-[#F79771]/90"
                      size="sm"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isRunning ? "Executing..." : "Run Code"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="hover:bg-[#EF7B55]/20"
                    size="sm"
                    onClick={openSaveModal}
                    disabled={loading || isImagePreview}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save As...
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-[#EF7B55]/20"
                    size="sm"
                    onClick={handleEditorSubmit}
                    disabled={
                      !selectedLesson ||
                      !submissionTitle.trim() || // ✅ REQUIRED
                      loading ||
                      isImagePreview ||
                      isSubmittingEditor
                    }
                  >
                    {isSubmittingEditor ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingSubmissionId ? "Updating..." : "Submitting..."}
                      </>
                    ) : currentEditingId ? (
                      "Update Submission"
                    ) : (
                      "Submit"
                    )}

                  </Button>

                  <Button
                    variant="outline"
                    className="hover:bg-[#EF7B55]/20"
                    size="sm"
                    onClick={copyCode}
                    disabled={loading || isImagePreview}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-[#EF7B55]/20"
                    size="sm"
                    onClick={downloadCode}
                    disabled={loading || isImagePreview}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                {loading && (
                  <div className="mt-2 p-2 bg-yellow-50 border rounded text-sm text-yellow-800">
                    Loading file content...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="output" className="tab-content">
            <Card className="flex flex-col w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {selectedLanguage === "html" || selectedLanguage === "css"
                    ? "Preview & Output"
                    : "Output"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {successMessage && (
                  <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                {(selectedLanguage === "html" || selectedLanguage === "css") &&
                  htmlPreview ? (
                  <Tabs defaultValue="preview" className="h-full flex flex-col">
                    <TabsList className="grid grid-cols-2 gap-2">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="output">Console</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="flex-1">
                      <iframe
                        ref={iframeRef}
                        srcDoc={htmlPreview}
                        className="output-iframe border rounded-md bg-white"
                        title="HTML/CSS Preview"
                      />
                    </TabsContent>
                    <TabsContent value="output" className="flex-1">
                      <div className="output-console bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-auto">
                        <pre className="whitespace-pre-wrap">
                          {webConsole || "Console output will appear here..."}

                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="output-console bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-auto">
                    <pre className="whitespace-pre-wrap">
                      {output || "Output will appear here..."}
                    </pre>

                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="files" className="tab-content">
            <Card className="flex flex-col w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Files</CardTitle>
                {uploadSuccessMessage && (
                  <Alert className="mt-2 bg-green-50 border-green-200 text-green-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadSuccessMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="w-full flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="hover:bg-[#EF7B55]/20"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".js,.py,.html,.css,.txt,.json,.xml,.png,.jpg,.jpeg"
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
                {uploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Uploading: {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 files-tab">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                  disabled={uploading}
                />
                <Tabs defaultValue="saved" className="flex-1">
                  <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row items-center w-full gap-2 mb-14">
                    <TabsTrigger
                      value="saved"
                      className="bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3"
                    >
                      Saved Snippets
                    </TabsTrigger>
                    <TabsTrigger
                      value="uploads"
                      className="bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3"
                    >
                      Other Uploads
                    </TabsTrigger>
                  </TabsList>
                  {/* Saved Snippets */}
                  <TabsContent value="saved" className="space-y-4">
                    {paginatedSnippets.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
                        No snippets found. Create some using "New Snippet"!
                      </p>
                    ) : (
                      paginatedSnippets
                        .sort(
                          (a, b) =>
                            new Date(b.updated_at).getTime() -
                            new Date(a.updated_at).getTime()
                        )
                        .map((s) => (
                          <Card key={s.id} className="p-4 overflow-hidden">
                            {/* Header */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              {/* Title */}
                              <span
                                className="font-medium cursor-pointer hover:text-primary truncate w-full sm:max-w-[60%]"
                                title="Click to load into editor"
                              >
                                {s.title}
                              </span>

                              {/* Actions */}
                              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                                <span className="text-muted-foreground text-xs truncate max-w-[120px] sm:max-w-none">
                                  {new Date(s.updated_at).toLocaleString()}
                                </span>

                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copySnippetUrl(s.id)}
                                    title="Copy snippet URL"
                                  >
                                    <Link className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSnippet(s.id)}
                                    title="Delete snippet"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 sm:mt-0 sm:flex-row gap-2">
                              {/* Lesson */}
                              {s.lesson && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  Lesson {s.lesson}
                                </p>
                              )}
                              {/* View Button */}
                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto px-3 py-1.5 bg-transparent hover:bg-[#EF7B55]/20"
                                  onClick={() => loadSnippet(s)}
                                  disabled={snippetLoadingId === s.id}
                                >
                                  {snippetLoadingId === s.id ? (
                                    <>
                                      <Spinner size="sm" className="mr-2" />
                                      Loading...
                                    </>
                                  ) : (
                                    "View"
                                  )}
                                </Button>

                              </div>
                            </div>
                          </Card>
                        ))
                    )}

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
                      <Button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="w-full sm:w-auto bg-[#EF7B55]/70 hover:bg-[#F79771]/90"
                        size="sm"
                      >
                        Previous
                      </Button>

                      <span className="text-sm text-center">
                        Page {currentPage} of {totalSnippetPages} (
                        {filteredSnippets.length} total)
                      </span>

                      <Button
                        disabled={currentPage === totalSnippetPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="w-full sm:w-auto bg-[#EF7B55]/70 hover:bg-[#F79771]/90"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Other Uploads */}
                  <TabsContent value="uploads" className="space-y-4">
                    {uploading && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Uploading file...</AlertDescription>
                      </Alert>
                    )}
                    {paginatedUploads.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        {uploading
                          ? "Upload in progress..."
                          : "No uploaded files found"}
                      </p>
                    ) : (
                      paginatedUploads.map((file) => (
                        <Card
                          key={file.id}
                          className="p-3 sm:p-4 overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`font-medium cursor-pointer hover:text-primary truncate text-sm sm:text-base ${fileLoading === file.id
                                  ? "opacity-50 cursor-wait"
                                  : ""
                                  }`}
                                onClick={() =>
                                  !loading && !fileLoading && loadFile(file)
                                }
                                title={
                                  fileLoading === file.id
                                    ? "Loading..."
                                    : "Click to load into editor"
                                }
                              >
                                {file.label || file.original_name}
                                {fileLoading === file.id && (
                                  <Spinner size="sm" className="inline ml-2" />
                                )}
                              </h4>

                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {file.original_name} •{" "}
                                {Math.round(file.size_bytes / 1024)} KB •
                                {file.lesson
                                  ? ` Lesson ${file.lesson}`
                                  : " No lesson"}
                              </p>

                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {new Date(file.updated_at).toLocaleString()}
                              </p>

                              {/* URL — mobile-safe wrapping */}
                              <div className="items-start gap-2 text-xs text-muted-foreground mt-1 min-w-0">
                                <span className="break-all flex-1 min-w-0">
                                  {file.url}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyFileUrl(file)}
                                title="Copy file URL"
                                disabled={loading || fileLoading === file.id}
                                className="flex-1 sm:flex-none"
                              >
                                <Link className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyFileUrl(file)}
                                title="Copy file URL"
                                disabled={loading || fileLoading === file.id}
                                className="shrink-0"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSnippet(file.id)}
                                title={deletingSnippetId === file.id ? "Deleting..." : "Delete snippet"}
                                className="text-destructive hover:text-destructive"
                                disabled={deletingSnippetId === file.id || snippetLoadingId === file.id}
                              >
                                {deletingSnippetId === file.id ? (
                                  <Spinner size="sm" className="h-4 w-4" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>

                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1 || uploading}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="w-full sm:w-auto bg-[#EF7B55]/70 hover:bg-[#F79771]/90"
                      >
                        Previous
                      </Button>

                      <span className="text-sm text-center sm:text-left">
                        Page {currentPage} of {totalUploadPages} (
                        {filteredUploads.length} total)
                      </span>

                      <Button
                        variant="outline"
                        disabled={currentPage === totalUploadPages || uploading}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="w-full sm:w-auto bg-[#EF7B55]/70 hover:bg-[#F79771]/90"
                      >
                        Next
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="submission" className="tab-content">
            <SubmissionTab
              lessons={lessons}
              selectedLesson={selectedLesson}
              setSelectedLesson={setSelectedLesson}
              submissionTitle={submissionTitle}
              setSubmissionTitle={setTitleForActiveLang}
              onSubmit={handleSubmissionTabSubmit}
              role={session?.user?.role || undefined}
              submissions={mySubmissions}
              onGrade={async (id, upd) => { await gradeSubmission(id, upd); }}
              onComment={async (id, msg) => { await addComment(id, msg); }}
              fetchSubmissionDetail={fetchSubmissionDetail}
              onLoadToEditor={(sub) => loadSubmissionIntoEditor(sub)}
              showCustomAlert={showCustomAlert}
              // ✅ NEW: pass all current code buffers
              codeByLang={{
                ...(jsCode !== languages.javascript.template && { javascript: jsCode }),
                ...((codeBuffers["python"] ?? languages.python.template) !== languages.python.template && { python: codeBuffers["python"] }),
                ...(htmlCode !== languages.html.template && { html: htmlCode }),
                ...(cssCode !== languages.css.template && { css: cssCode }),
              }}
              // ✅ NEW: multi-language submit handler
              onSubmitMultiple={async (selectedLangs) => {
                const lessonId = selectedLesson;
                const title = submissionTitle.trim() || null;
                if (!lessonId) throw new Error("No lesson selected");
                const results: Submission[] = [];
                for (const lang of selectedLangs) {
                  const codeText =
                    lang === "html" ? htmlCode
                      : lang === "css" ? cssCode
                        : lang === "javascript" ? jsCode
                          : codeBuffers[lang] ?? "";
                  const body = {
                    title,
                    lesson: parseInt(lessonId),
                    language: lang,
                    code_text: codeText,
                  };
                  const res = await fetch("/api/code-ide/submissions/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  });
                  if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || `Failed to submit ${lang}`);
                  }
                  const created: Submission = await res.json();
                  results.push(created);
                }
                setMySubmissions((prev) => [...results, ...prev]);
                setSubmissionTitle("");
              }}
            />

          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ─── Language Selection Modal ─────────────────────────────────────────────────

const LANG_META: Record<string, { label: string; color: string; icon: string }> = {
  javascript: { label: "JavaScript", color: "#F7DF1E", icon: "JS" },
  python: { label: "Python", color: "#3776AB", icon: "PY" },
  html: { label: "HTML", color: "#E34F26", icon: "HT" },
  css: { label: "CSS", color: "#264DE4", icon: "CS" },
};

function LanguageSelectionModal({
  open,
  onClose,
  codeByLang,
  title,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  codeByLang: Partial<Record<string, string>>;
  title: string;
  onConfirm: (langs: string[]) => Promise<void>;
}) {
  const available = Object.keys(codeByLang).filter(
    (lang) => (codeByLang[lang] ?? "").trim().length > 0
  );

  const [selected, setSelected] = useState<Set<string>>(new Set(available));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset selection whenever modal opens
  useEffect(() => {
    if (open) {
      setSelected(new Set(available));
      setError(null);
    }
  }, [open]);

  const toggle = (lang: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(lang) ? next.delete(lang) : next.add(lang);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0) {
      setError("Select at least one language to submit.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(Array.from(selected));
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              Submit Code
            </DialogTitle>
            <DialogDescription className="text-sm text-white/50 mt-1">
              Choose which languages to submit
              {title ? (
                <>
                  {" "}as{" "}
                  <span className="text-[#EF7B55] font-medium">"{title}"</span>
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Language Cards */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-[#0f0f23]">
          {available.map((lang) => {
            const meta = LANG_META[lang] ?? { label: lang, color: "#888", icon: lang.slice(0, 2).toUpperCase() };
            const code = codeByLang[lang] ?? "";
            const preview = code.trim().split("\n").slice(0, 3).join("\n");
            const isSelected = selected.has(lang);

            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggle(lang)}
                className={`
                  relative text-left rounded-xl border-2 p-4 transition-all duration-200 group
                  ${isSelected
                    ? "border-[#EF7B55] bg-[#EF7B55]/5 shadow-md shadow-[#EF7B55]/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50"}
                `}
              >
                {/* Check indicator */}
                <span
                  className={`
                    absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center text-white text-xs transition-all
                    ${isSelected
                      ? "bg-[#EF7B55] border-[#EF7B55]"
                      : "border-slate-300 dark:border-slate-600"}
                  `}
                >
                  {isSelected && (
                    <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>

                {/* Language badge */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {meta.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {code.trim().split("\n").length} line{code.trim().split("\n").length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Code preview */}
                <pre className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed overflow-hidden line-clamp-3 bg-slate-100 dark:bg-slate-900/60 rounded-md px-2.5 py-2">
                  {preview || <span className="italic text-slate-400">(empty)</span>}
                </pre>
              </button>
            );
          })}

          {available.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 text-sm">
              No code found in any language tab.
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 -mt-2 mb-1 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {selected.size} of {available.length} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={selected.size === 0 || submitting}
              className="rounded-lg bg-[#EF7B55] hover:bg-[#F79771] text-white font-semibold px-5 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting {selected.size}…
                </>
              ) : (
                <>
                  Submit {selected.size > 1 ? `${selected.size} files` : "1 file"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── SubmissionTab ────────────────────────────────────────────────────────────

function SubmissionTab({
  lessons,
  selectedLesson,
  setSelectedLesson,
  submissionTitle,
  setSubmissionTitle,
  onSubmit,
  role,
  submissions,
  onGrade,
  onComment,
  fetchSubmissionDetail,
  onLoadToEditor,
  showCustomAlert,
  codeByLang,       // ✅ NEW
  onSubmitMultiple, // ✅ NEW
}: {
  lessons: { id: string; title: string }[];
  selectedLesson: string;
  setSelectedLesson: (v: string) => void;
  submissionTitle: string;
  setSubmissionTitle: (v: string) => void;
  onSubmit: () => Promise<void>;
  role?: string;
  submissions: Submission[];
  onGrade: (id: number, upd: any) => Promise<void>;
  onComment: (id: number, msg: string) => Promise<void>;
  fetchSubmissionDetail: (id: number) => Promise<Submission>;
  onLoadToEditor: (sub: Submission) => void;
  showCustomAlert: (message: string) => void;
  codeByLang: Partial<Record<string, string>>;      // ✅ NEW
  onSubmitMultiple: (langs: string[]) => Promise<void>; // ✅ NEW
}) {
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lessonSearch, setLessonSearch] = useState("");

  // ✅ NEW: modal state
  const [showLangModal, setShowLangModal] = useState(false);

  const itemsPerPage = 10;
  const filteredSubmissions = submissions.filter((s) =>
    `${s.id} ${s.title ?? ""} ${s.status} ${s.language}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  const viewDetail = async (s: Submission) => {
    setLoading(true);
    try {
      const full = await fetchSubmissionDetail(s.id);
      setViewing(full);
    } catch {
      showCustomAlert("Could not load details");
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async () => {
    if (!viewing || !comment.trim()) return;
    try {
      await onComment(viewing.id, comment);
      setComment("");
      const fresh = await fetchSubmissionDetail(viewing.id);
      setViewing(fresh);
    } catch {
      showCustomAlert("Comment failed");
    }
  };

  const copySubmissionCode = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => showCustomAlert("Code copied to clipboard"))
      .catch(() => showCustomAlert("Failed to copy code"));
  };

  return (
    <Card className="flex flex-col w-full submission-tab">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Code Submission</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">

        {/* ✅ Language Selection Modal */}
        <LanguageSelectionModal
          open={showLangModal}
          onClose={() => setShowLangModal(false)}
          codeByLang={codeByLang}
          title={submissionTitle}
          onConfirm={async (langs) => {
            await onSubmitMultiple(langs);
            showCustomAlert(`Submitted ${langs.length} file${langs.length > 1 ? "s" : ""} successfully!`);
          }}
        />

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          {/* Lesson selector */}
          <div className="w-full">
            <Label htmlFor="lesson-select" className="block mb-2 text-sm font-medium">
              Select Lesson
            </Label>
            <Select
              value={selectedLesson}
              onValueChange={setSelectedLesson}
              onOpenChange={(open) => { if (!open) setLessonSearch(""); }}
            >
              <SelectTrigger id="lesson-select">
                <SelectValue placeholder="Select a lesson" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                  <Input
                    placeholder="Search lessons..."
                    value={lessonSearch}
                    onChange={(e) => setLessonSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="h-8 text-sm"
                    autoFocus={false}
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto mt-1">
                  {lessons
                    .filter((l) => l.title.toLowerCase().includes(lessonSearch.toLowerCase()))
                    .map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                    ))}
                  {lessons.filter((l) =>
                    l.title.toLowerCase().includes(lessonSearch.toLowerCase())
                  ).length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No lessons found
                      </div>
                    )}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="w-full">
            <Label htmlFor="submission-title">
              Submission Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="submission-title"
              placeholder="Enter submission title"
              value={submissionTitle}
              onChange={(e) => setSubmissionTitle(e.target.value)}
            />
          </div>

          {/* ✅ Button now opens modal */}
          <Button
            onClick={() => setShowLangModal(true)}
            disabled={!selectedLesson || !submissionTitle.trim()}
            className="w-full md:w-auto bg-[#EF7B55]/70 hover:bg-[#EF7B55]/90"
          >
            Submit Code
          </Button>
        </div>

        {/* Detail view / list — unchanged below this point */}
        {viewing ? (
          <Card className="border rounded-md flex-1 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Submission #{viewing.id}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setViewing(null)}>
                Back to List
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1"><Label className="text-muted-foreground">Title</Label><p>{viewing.title || "N/A"}</p></div>
                <div className="space-y-1"><Label className="text-muted-foreground">Status</Label><p className="capitalize">{viewing.status}</p></div>
                <div className="space-y-1"><Label className="text-muted-foreground">Language</Label><p className="capitalize">{viewing.language}</p></div>
                <div className="space-y-1"><Label className="text-muted-foreground">Score</Label><p>{viewing.score ?? "Not graded"}</p></div>
                <div className="space-y-1"><Label className="text-muted-foreground">Graded By</Label><p>{viewing.graded_by_name ? `${viewing.graded_by_name}` : "N/A"}</p></div>
                <div className="space-y-1"><Label className="text-muted-foreground">Graded At</Label><p>{viewing.graded_at ? new Date(viewing.graded_at).toLocaleString() : "N/A"}</p></div>
                <div className="space-y-1 md:col-span-2"><Label className="text-muted-foreground">Created</Label><p>{new Date(viewing.created_at).toLocaleString()}</p></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Code</Label>
                  <Button variant="ghost" size="sm" onClick={() => copySubmissionCode(viewing.code_text)} title="Copy code"><Copy className="h-4 w-4" /></Button>
                </div>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-48 border">{viewing.code_text}</pre>
              </div>
              {viewing.feedback && (
                <div className="space-y-2">
                  <Label className="font-medium">Feedback</Label>
                  <p className="text-sm bg-muted p-4 rounded-md border">{viewing.feedback}</p>
                </div>
              )}
              {viewing.correction_code && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Correction</Label>
                    <Button variant="ghost" size="sm" onClick={() => copySubmissionCode(viewing.correction_code)} title="Copy correction code"><Copy className="h-4 w-4" /></Button>
                  </div>
                  <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-48 border">{viewing.correction_code}</pre>
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">Comments</Label>
                </div>
                <div className="space-y-3 max-h-48 overflow-auto">
                  {viewing.comments.map((c) => (
                    <div key={c.id} className="bg-muted p-3 rounded-md space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">{c.author_name} ({c.author_role})</span>
                        <span className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{c.message}</p>
                    </div>
                  ))}
                  {viewing.comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">No comments yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} className="flex-1" />
                  <Button onClick={sendComment} disabled={!comment.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); onLoadToEditor(viewing); }}>
                  Load to Editor
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          submissions.length > 0 && (
            <div className="space-y-4">
              <Input
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {role === "teacher" ? "All Submissions" : "My Submissions"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {(() => {
                      // Group by title (null/empty titles each get their own group keyed by id)
                      const groups: Map<string, Submission[]> = new Map();
                      paginatedSubmissions.forEach((s) => {
                        const key = s.title?.trim() || `__id_${s.id}`;
                        if (!groups.has(key)) groups.set(key, []);
                        groups.get(key)!.push(s);
                      });

                      return Array.from(groups.entries()).map(([key, group]) => {
                        const displayTitle = group[0].title?.trim()
                          ? group[0].title
                          : `Submission #${group[0].id}`;
                        const latestDate = group.reduce((latest, s) =>
                          new Date(s.created_at) > new Date(latest.created_at) ? s : latest
                        ).created_at;
                        const allGraded = group.every((s) => s.score !== null);
                        const avgScore = allGraded
                          ? (
                            group.reduce((sum, s) => sum + parseFloat(s.score ?? "0"), 0) /
                            group.length
                          ).toFixed(1)
                          : null;

                        return (
                          <div key={key} className="p-4 space-y-3">
                            {/* Group header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="space-y-1 min-w-0">
                                <p className="font-semibold truncate">{displayTitle}</p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {group.map((s) => (
                                    <span
                                      key={s.id}
                                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                                      style={{
                                        borderColor:
                                          s.language === "javascript" ? "#F7DF1E"
                                            : s.language === "python" ? "#3776AB"
                                              : s.language === "html" ? "#E34F26"
                                                : s.language === "css" ? "#264DE4"
                                                  : "#888",
                                        color:
                                          s.language === "javascript" ? "#b8a800"
                                            : s.language === "python" ? "#3776AB"
                                              : s.language === "html" ? "#E34F26"
                                                : s.language === "css" ? "#264DE4"
                                                  : "#888",
                                        backgroundColor:
                                          s.language === "javascript" ? "#F7DF1E18"
                                            : s.language === "python" ? "#3776AB18"
                                              : s.language === "html" ? "#E34F2618"
                                                : s.language === "css" ? "#264DE418"
                                                  : "#88888818",
                                      }}
                                    >
                                      {s.language.toUpperCase()}
                                      <span className="text-muted-foreground capitalize">
                                        · {s.status}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col sm:items-end gap-1 shrink-0">
                                <p className="text-sm font-medium">
                                  {avgScore !== null ? `${avgScore} pts` : "--"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(latestDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Actions row */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              {/* Single "View Code" loads ALL languages in the group */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                  group.forEach((s) => onLoadToEditor(s));
                                }}
                              >
                                View Code
                                {group.length > 1 && (
                                  <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-mono">
                                    {group.length}
                                  </span>
                                )}
                              </Button>

                              {/* Individual Details per submission */}
                              <div className="flex flex-wrap gap-2">
                                {group.map((s) => (
                                  <Button
                                    key={s.id}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground hover:text-foreground border border-dashed"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      viewDetail(s);
                                    }}
                                  >
                                    #{s.id} {s.language} · Details
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </CardContent>
              </Card>
              <div className="flex items-center justify-between text-sm">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                <span>Page {currentPage} of {totalPages} ({filteredSubmissions.length} total)</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <Spinner size="md" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
