import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { monokai } from "@uiw/codemirror-theme-monokai";

const codeMirrorExtensions = {
  javascript: [javascript()],
  python: [python()],
  java: [java()],
  cpp: [cpp()],
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
  lesson: number;
  student: number;
  language: string;
  code_text: string;
  status: "submitted" | "graded" | "revised";
  score: string | null;
  feedback: string;
  correction_code: string;
  graded_by: number | null;
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

export function CodeEditor() {
  const languages = {
    javascript: {
      name: "JavaScript",
      judgeId: 63,
      template: `console.log("Hello, World!");`,
    },
    python: { name: "Python", judgeId: 71, template: `print("Hello, World!")` },
    java: {
      name: "Java",
      judgeId: 62,
      template: `System.out.println("Hello");`,
    },
    cpp: { name: "C++", judgeId: 54, template: `std::cout << "Hello";` },
    html: { name: "HTML", judgeId: null, template: `<h1>Hello</h1>` },
    css: { name: "CSS", judgeId: null, template: `body { color: red; }` },
  } as const;

  const { data: session, status } = useSession();
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
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  // [ADD THIS NEW STATE]
  const [codeBuffers, setCodeBuffers] = useState<Record<string, string>>({
    javascript: languages.javascript.template,
    python: languages.python.template,
    java: languages.java.template,
    cpp: languages.cpp.template,
  });
  const [isImagePreview, setIsImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeSnippetId, setActiveSnippetId] = useState<number | null>(null);

  // New File Modal states
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileTitle, setNewFileTitle] = useState("");
  const [newFileLesson, setNewFileLesson] = useState("");

  // Pre-populated save data from new file modal
  const [prepopulatedSaveData, setPrepopulatedSaveData] = useState<{
    title: string;
    lesson: string;
  } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<
    string | null
  >(null);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

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
      const res = await fetch("/api/student/lessons");
      if (!res.ok) throw new Error("Failed to fetch lessons");
      const data = await res.json();
      const lessonList = Array.isArray(data) ? data : data.results || [];
      setLessons(
        lessonList.map((l: any) => ({
          id: String(l.id),
          // Check multiple common property names before falling back to ID
          title: l.title || l.name || l.topic || l.label || `Lesson ${l.id}`,
        }))
      );
    } catch (err) {
      console.error("Failed to load lessons:", err);
    }
  };

  const saveAsFile = async () => {
    if (!session?.user?.sessionToken || isImagePreview || !saveFileName.trim())
      return;

    setIsSaving(true);
    try {
      // [UPDATED] Construct body with ID if we are editing an existing snippet
      const body: any = {
        title: saveFileName.trim(),
        language: selectedLanguage,
        code_text:
          selectedLanguage === "html"
            ? htmlCode
            : selectedLanguage === "css"
              ? cssCode
              : code,
        lesson: selectedLesson ? parseInt(selectedLesson) : null,
      };

      // If we have an active ID, add it to the body to trigger an UPDATE on the backend
      if (activeSnippetId) {
        body.id = activeSnippetId;
      }

      const res = await fetch("/api/code-ide/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Save failed");
      }

      const savedSnippet: Snippet = await res.json();

      // [UPDATED] Update the list based on whether it was a Create or Update
      if (activeSnippetId) {
        // We updated an existing one
        setMySnippets((prev) =>
          prev.map((s) => (s.id === savedSnippet.id ? savedSnippet : s))
        );
        alert("Snippet updated successfully!");
      } else {
        // We created a new one
        setMySnippets((prev) => [savedSnippet, ...prev]);
        setActiveSnippetId(savedSnippet.id); // Set as active so next save is an update
        alert("Snippet saved successfully!");
      }

      setShowSaveModal(false);
      // We do NOT clear saveFileName here anymore, so the user stays in "edit mode"
      setPrepopulatedSaveData(null);
    } catch (error) {
      alert(`Save failed: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSnippet = async (id: number) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    try {
      const res = await fetch(`/api/code-ide/snippets/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Delete failed");
      setMySnippets((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Delete failed: Endpoint not available");
    }
  };

  const fetchFileContent = async (file: UploadedFile) => {
    try {
      console.log(`Fetching content for file ${file.id} via API`);
      const apiRes = await fetch(`/api/code-ide/uploads/${file.id}/content`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error(
          `API content fetch failed: ${apiRes.status} - ${errorText}`
        );
        throw new Error(`Failed to fetch file content: ${apiRes.status}`);
      }

      const content = await apiRes.text();
      console.log(
        `Successfully fetched ${content.length} characters for file ${file.id}`
      );
      return content;
    } catch (error) {
      console.error("fetchFileContent error:", error);
      throw new Error(
        "File content unavailable. The file may be private or the server may be experiencing issues."
      );
    }
  };

  const uploadFile = async (file: File, lesson?: string, label?: string) => {
    if (!session?.user?.sessionToken) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File size exceeds 25MB limit");
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
      setActiveTab("files"); // Switch to Files tab
      setUploadSuccessMessage("File uploaded successfully!"); // Set success message
      setTimeout(() => setUploadSuccessMessage(null), 3000); // Clear after 3s
      return res;
    } catch (error) {
      alert(`Upload failed: ${(error as Error).message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteUploadedFile = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

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
      alert(`Delete failed: ${(error as Error).message}`);
    }
  };

  const loadFile = async (file: UploadedFile) => {
    try {
      setFileLoading(file.id);
      setLoading(true);
      console.log(`Loading file ${file.id}: ${file.original_name}`);

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
        console.log(`Loaded image file ${file.id} for preview`);
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
        "text/x-java": "java",
        "text/x-c++": "cpp",
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

      console.log(`Loaded file ${file.id} as ${language}`);
    } catch (error) {
      console.error("Load file error:", error);
      alert(`Failed to load file content: ${(error as Error).message}`);
    } finally {
      setFileLoading(null);
      setLoading(false);
    }
  };

  const copyFileUrl = (file: UploadedFile) => {
    navigator.clipboard
      .writeText(file.url)
      .then(() => {
        alert("File URL copied to clipboard");
      })
      .catch(() => {
        alert("Failed to copy URL");
      });
  };

  const fetchSubmissions = async (lessonId?: string) => {
    const u = new URL("/api/code-ide/submissions", window.location.origin);
    if (lessonId) u.searchParams.set("lesson", lessonId);
    const r = await fetch(u);
    if (!r.ok) throw new Error("Failed to fetch submissions");
    return r.json() as Promise<Submission[]>;
  };

  const fetchSubmissionDetail = async (id: number) => {
    const r = await fetch(`/api/code-ide/submissions/${id}`);
    if (!r.ok) throw new Error("Failed to fetch submission detail");
    return r.json() as Promise<Submission>;
  };

  const createSubmission = async () => {
    console.log(`[FE] createSubmission called. Lang: ${selectedLanguage}, Code len: ${code?.length}, Code: "${code?.substring(0, 20)}..."`);
    if (!selectedLesson) throw new Error("No lesson selected");

    const body = {
      lesson: parseInt(selectedLesson),
      language: selectedLanguage,
      code_text:
        selectedLanguage === "html"
          ? htmlCode
          : selectedLanguage === "css"
            ? cssCode
            : code,
    };

    const res = await fetch("/api/code-ide/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Submission failed");
    }

    const created: Submission = await res.json();
    setMySubmissions((prev) => [created, ...prev]);
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout-route", { method: "POST" }).catch(() => { });
    document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
    document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
    window.location.href = "/login";
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      setError("Not authenticated");
      setLoading(false);
    } else {
      setError(null);
      setLoading(false);

      // Only set the default template if the editor is completely empty (Initial Load)
      // This prevents overwriting code when loadSnippet() or loadFile() is called
      if (!code && selectedLanguage !== "html" && selectedLanguage !== "css") {
        setCode(
          languages[selectedLanguage as keyof typeof languages].template
        );
      }
      if (selectedLanguage === "html" && !htmlCode.includes("Hello")) {
        setHtmlCode(languages.html.template);
      }
      if (selectedLanguage === "css" && !cssCode.includes("color: red")) {
        setCssCode(languages.css.template);
      }
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

  // Auto-save current work to localStorage
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
      java: "java",
      cpp: "cpp",
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
    setCode(languages[selectedLanguage as keyof typeof languages].template);
    if (selectedLanguage === "html") setHtmlCode(languages.html.template);
    if (selectedLanguage === "css") setCssCode(languages.css.template);
    setActiveSnippetId(null);
    setSaveFileName("");
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
    setSyntaxError(null);
    setIsImagePreview(false);
    setImagePreviewUrl("");
    setActiveTab("editor");
  };

  const handleLanguageChange = (lang: string) => {
    const languageKey = lang as keyof typeof languages;

    if (selectedLanguage !== "html" && selectedLanguage !== "css") {
      setCodeBuffers((prev) => ({
        ...prev,
        [selectedLanguage]: code,
      }));
    }

    setSelectedLanguage(languageKey);

    // 2. Load the code for the NEW language
    if (languageKey === "html") {
      // Do nothing: HTML has its own dedicated state (htmlCode) which persists automatically
    } else if (languageKey === "css") {
      // Do nothing: CSS has its own dedicated state (cssCode) which persists automatically
    } else {
      // For JS/Python/Java/CPP, load from the buffer
      // If the buffer has code, use it. Otherwise, use the default template.
      setCode(codeBuffers[languageKey] || languages[languageKey].template);
    }

    // 3. Reset UI states (Outputs, errors, etc)
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
    setSyntaxError(null);
    setIsImagePreview(false);
    setImagePreviewUrl("");
    setActiveTab("editor");
  };

  const handleCodeChange = (value: string) => {
    // console.log(`[FE] Code changed. Len: ${value.length}`);
    if (isImagePreview) return;
    if (selectedLanguage === "html") {
      setHtmlCode(value);
    } else if (selectedLanguage === "css") {
      setCssCode(value);
    } else {
      setCode(value);
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
    try {
      const detailedSnippet = await fetchSnippetDetail(snippet.id);

      // ... existing reset logic ...
      setHtmlCode(languages.html.template);
      setCssCode(languages.css.template);
      setCode(languages.javascript.template);

      // ... existing loading logic ...
      if (detailedSnippet.language === "html") {
        setHtmlCode(detailedSnippet.code_text);
      } else if (detailedSnippet.language === "css") {
        setCssCode(detailedSnippet.code_text);
      } else {
        setCode(detailedSnippet.code_text);
      }

      // [ADD THIS] Store the ID and Title
      setActiveSnippetId(detailedSnippet.id);
      setSaveFileName(detailedSnippet.title); // Pre-fill the save name

      setSelectedLanguage(detailedSnippet.language);
      if (detailedSnippet.lesson)
        setSelectedLesson(String(detailedSnippet.lesson));

      setActiveTab("editor");
      setSyntaxError(null);
      setIsImagePreview(false);
    } catch (err) {
      alert("Failed to load snippet");
    }
  };

  const copySnippetUrl = (id: number) => {
    const url = `${window.location.origin}/api/code-ide/snippets/${id}`;
    navigator.clipboard.writeText(url);
    alert("Snippet URL copied to clipboard");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fileInputRef.current) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 25MB limit");
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

  const runCode = async () => {
    if (isImagePreview) {
      setOutput("Image preview mode: No code to execute");
      setActiveTab("output");
      return;
    }
    setIsRunning(true);
    setOutput("");
    setExecutionError("");
    setSuccessMessage(null); // Clear any previous success message
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
          setSuccessMessage("Code executed successfully!"); // Set success message
        } catch (e: any) {
          setOutput(`Error: ${e.message}`);
        } finally {
          console.log = original;
        }
      } else if (selectedLanguage === "html" || selectedLanguage === "css") {
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
        setOutput("HTML/CSS rendered in preview tab");
        setSuccessMessage("HTML/CSS rendered successfully!"); // Set success message
      } else {
        const cfg = languages[selectedLanguage as keyof typeof languages];
        if (cfg.judgeId) {
          try {
            let codeToRun = code;

            // Auto-wrap Java/C++ execution
            if (
              selectedLanguage === "java" &&
              !code.includes("class Main") &&
              !code.includes("class ")
            ) {
              codeToRun = `public class Main {\n    public static void main(String[] args) {\n        ${code}\n    }\n}`;
            } else if (
              selectedLanguage === "cpp" &&
              !code.includes("int main")
            ) {
              codeToRun = `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    ${code}\n    return 0;\n}`;
            }

            const res = await fetch(
              "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-RapidAPI-Key":
                    "aa76b3efa6msh96695e665e5f57fp105d9cjsn87230da97198",
                  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                },
                body: JSON.stringify({
                  source_code: codeToRun,
                  language_id: cfg.judgeId,
                  stdin: "",
                }),
              }
            );
            if (!res.ok) {
              const errorText = await res.text();
              console.error("Judge0 API error:", res.status, errorText);
              throw new Error(`API Error: ${res.status}`);
            }
            const result = await res.json();
            if (result.status?.id === 3) {
              setOutput(result.stdout || "Success (no output)");
              setSuccessMessage("Code executed successfully!"); // Set success message
            } else if (result.status?.id === 6) {
              setOutput(
                `Compilation Error:\n${result.compile_output || result.stderr}`
              );
            } else if (result.status?.id === 5) {
              setOutput("Time Limit Exceeded");
            } else if (result.status?.id === 4) {
              setOutput(`Runtime Error:\n${result.stderr}`);
            } else {
              setOutput(result.stderr || result.stdout || "Unknown error");
            }
          } catch (e: any) {
            console.error("Judge0 execution failed:", e);
            setExecutionError(
              "Online execution unavailable. Using local simulation."
            );
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
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedLesson) return alert("Please select a lesson");
    try {
      await createSubmission();
      alert("Submitted successfully");
    } catch (error) {
      alert(`Submission failed: ${(error as Error).message}`);
    }
  };

  // Handle New File Modal Create - Close modal, go to editor, then open save modal
  const handleNewFileCreate = () => {
    if (!newFileTitle.trim()) return alert("Title required");

    setActiveSnippetId(null);

    // Close the new file modal immediately
    setShowNewFileModal(false);

    // Close save modal first (if open)
    setShowSaveModal(false);

    // Reset new file form
    setNewFileTitle("");
    setNewFileLesson("");

    // Reset editor to default state and switch to editor tab
    resetCode();
    setActiveTab("editor");

    // Store prepopulated data
    setPrepopulatedSaveData({
      title: newFileTitle,
      lesson: newFileLesson || "",
    });

    // Pre-populate save modal fields after a brief delay
    setTimeout(() => {
      setSaveFileName(newFileTitle);
      setSelectedLesson(newFileLesson || "");
      setShowSaveModal(true);
    }, 150);
  };

  // Effect to prepopulate save modal when new file data is set
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
      {/* Save Modal - POST to snippets */}
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
                onValueChange={(value) => setSelectedLesson(value)}
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

      {/* New File Modal - Pre-populates Save modal */}
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

      <div className="space-y-4 px-4 sm:px-6 lg:px-8">
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
          <TabsList className="tabs-list bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
            <TabsTrigger
              value="editor"
              className="tabs-trigger bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            >
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="tabs-trigger bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            >
              Output
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="tabs-trigger bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            >
              Files
            </TabsTrigger>
            <TabsTrigger
              value="submission"
              className="tabs-trigger bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            >
              Submission
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="tab-content">
            <Card className="flex flex-col w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">
                    Code Editor
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={resetCode}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <Tabs
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}
                  className="language-tabs"
                >
                  <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Object.entries(languages).map(([key, lang]) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="tab-trigger"
                      >
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
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
                      extensions={
                        codeMirrorExtensions[
                        selectedLanguage as keyof typeof codeMirrorExtensions
                        ] as any
                      }
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
                  <Button
                    onClick={runCode}
                    disabled={isRunning || !!error || loading}
                    className="bg-[#EF7B55] hover:bg-[#F79771]"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isRunning ? "Executing..." : "Run Code"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveModal(true)}
                    disabled={loading || isImagePreview}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save As...
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!selectedLesson || loading || isImagePreview}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    disabled={loading || isImagePreview}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadCode}
                    disabled={loading || isImagePreview}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetCode}
                    disabled={loading}
                  >
                    <RotateCcw className="h-4 w-4" />
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
                          {output || "Run your code to see output here..."}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="output-console bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-auto">
                    <pre className="whitespace-pre-wrap">
                      {output || "Run your code to see output here..."}
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewFileModal(true)}
                    disabled={uploading}
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    New Snippet
                  </Button>
                  <Button
                    variant="outline"
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
                    accept=".js,.py,.java,.cpp,.html,.css,.txt,.json,.xml,.png,.jpg,.jpeg"
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
                  <TabsList className="grid grid-cols-2 gap-2">
                    <TabsTrigger value="saved">Saved Snippets</TabsTrigger>
                    <TabsTrigger value="uploads">Other Uploads</TabsTrigger>
                  </TabsList>
                  <TabsContent value="saved" className="space-y-4">
                    {paginatedSnippets.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
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
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                              <span
                                className="font-medium cursor-pointer hover:text-primary truncate flex-1"
                                onClick={() => loadSnippet(s)}
                                title="Click to load into editor"
                              >
                                {s.title}
                              </span>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-muted-foreground text-xs truncate">
                                  {new Date(s.updated_at).toLocaleString()}
                                </span>
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
                            {s.lesson && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                Lesson {s.lesson}
                              </p>
                            )}
                          </Card>
                        ))
                    )}
                    <div className="flex justify-between mt-4 flex-wrap gap-2">
                      <Button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalSnippetPages} (
                        {filteredSnippets.length} total)
                      </span>
                      <Button
                        disabled={currentPage === totalSnippetPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </TabsContent>
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
                        <Card key={file.id} className="p-4 overflow-hidden">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div className="flex-1">
                              <h4
                                className={`font-medium cursor-pointer hover:text-primary truncate ${fileLoading === file.id
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
                              <p className="text-sm text-muted-foreground truncate">
                                {file.original_name} •{" "}
                                {Math.round(file.size_bytes / 1024)} KB •
                                {file.lesson
                                  ? ` Lesson ${file.lesson}`
                                  : " No lesson"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {new Date(file.updated_at).toLocaleString()}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                <span>{file.url}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyFileUrl(file)}
                                  title="Copy file URL"
                                  disabled={loading || fileLoading === file.id}
                                  className="ml-2"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyFileUrl(file)}
                                title="Copy file URL"
                                disabled={loading || fileLoading === file.id}
                              >
                                <Link className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUploadedFile(file.id)}
                                title="Delete file"
                                className="text-destructive hover:text-destructive"
                                disabled={loading || fileLoading === file.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                    <div className="flex justify-between mt-4 flex-wrap gap-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1 || uploading}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalUploadPages} (
                        {filteredUploads.length} total)
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalUploadPages || uploading}
                        onClick={() => setCurrentPage((p) => p + 1)}
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
              onSubmit={handleSubmit}
              role={session?.user?.role}
              submissions={mySubmissions}
              onGrade={gradeSubmission}
              onComment={addComment}
              fetchSubmissionDetail={fetchSubmissionDetail}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function SubmissionTab({
  lessons,
  selectedLesson,
  setSelectedLesson,
  onSubmit,
  role,
  submissions,
  onGrade,
  onComment,
  fetchSubmissionDetail,
}: {
  lessons: { id: string; title: string }[];
  selectedLesson: string;
  setSelectedLesson: (v: string) => void;
  onSubmit: () => Promise<void>;
  role?: string;
  submissions: Submission[];
  onGrade: (id: number, upd: any) => Promise<void>;
  onComment: (id: number, msg: string) => Promise<void>;
  fetchSubmissionDetail: (id: number) => Promise<Submission>;
}) {
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitClick = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsPerPage = 10;
  const filteredSubmissions = submissions.filter((s) =>
    `${s.id} ${s.status} ${s.language}`
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
      alert("Could not load details");
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
      alert("Comment failed");
    }
  };
  return (
    <Card className="flex flex-col w-full submission-tab">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Code Submission</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="select-trigger">
          <Select value={selectedLesson} onValueChange={setSelectedLesson}>
            <SelectTrigger>
              <SelectValue placeholder="Select a lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* [UPDATED BUTTON] Shows spinner and disables while submitting */}
        <Button
          onClick={handleSubmitClick}
          disabled={!selectedLesson || isSubmitting}
        >
          {isSubmitting && <Spinner size="sm" className="mr-2" />}
          {isSubmitting ? "Submitting..." : "Submit Code"}
        </Button>
        {submissions.length > 0 && (
          <div className="space-y-4">
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="border rounded-md p-3 space-y-2">
              <p className="text-sm font-medium">
                {role === "teacher" ? "All submissions" : "My submissions"}
              </p>
              {paginatedSubmissions.map((s) => (
                <div
                  key={s.id}
                  className="submission-item flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-accent/20 rounded px-2"
                  onClick={() => viewDetail(s)}
                >
                  <span>
                    #{s.id} – {s.status} ({s.language})
                  </span>
                  <span>{s.score ?? "-"} pts</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages} ({filteredSubmissions.length}{" "}
                total)
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        {viewing && (
          <Card className="border rounded-md p-3 space-y-3">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Submission #{viewing.id}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewing(null)}
              >
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Status:</span> {viewing.status}
                </div>
                <div>
                  <span className="font-medium">Feedback:</span>{" "}
                  {viewing.feedback ? viewing.feedback : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Language:</span>{" "}
                  {viewing.language}
                </div>
                <div>
                  <span className="font-medium">Score:</span>{" "}
                  {viewing.score ?? "Not graded"}
                </div>
                <div>
                  <span className="font-medium">Graded By:</span>{" "}
                  {viewing.graded_by ? `User ${viewing.graded_by}` : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Graded At:</span>{" "}
                  {viewing.graded_at
                    ? new Date(viewing.graded_at).toLocaleString()
                    : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(viewing.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="font-medium block mb-1">Code:</span>
                <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                  {viewing.code_text}
                </pre>
              </div>
              {viewing.feedback && (
                <div>
                  <span className="font-medium block mb-1">Feedback:</span>
                  <p className="text-xs bg-muted p-2 rounded">
                    {viewing.feedback}
                  </p>
                </div>
              )}
              {viewing.correction_code && (
                <div>
                  <span className="font-medium block mb-1">Correction:</span>
                  <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                    {viewing.correction_code}
                  </pre>
                </div>
              )}
              {role === "teacher" && viewing.status !== "graded" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await onGrade(viewing.id, {
                        score: "90",
                        feedback: "Great job",
                        status: "graded",
                      });
                      alert("Graded 90");
                    }}
                  >
                    Grade 90
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await onGrade(viewing.id, {
                        score: "75",
                        feedback: "Needs improvement",
                        status: "revised",
                      });
                      alert("Sent for revision");
                    }}
                  >
                    Request revision
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Comments
                </p>
                {viewing.comments.map((c) => (
                  <div key={c.id} className="text-xs bg-muted p-2 rounded">
                    <span className="font-semibold">{c.author_name}</span> (
                    {c.author_role}) – {c.message}
                    <div className="text-muted-foreground">
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Input
                    placeholder="Write a comment…"
                    className="min-h-[60px] text-xs"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={sendComment}
                    disabled={!comment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {loading && <Spinner size="sm" />}
      </CardContent>
    </Card>
  );
}
