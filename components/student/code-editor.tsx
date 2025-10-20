import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  const saveSnippet = async () => {
    if (!session?.user?.sessionToken) return;
    const body = {
      lesson: selectedLesson || null,
      title: `Draft ${new Date().toISOString()}`,
      language: selectedLanguage,
      code_text: selectedLanguage === "html" ? htmlCode : selectedLanguage === "css" ? cssCode : code,
      meta: {},
    };
    try {
      const res = await fetch("/api/code-ide/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      const created: Snippet = await res.json();
      setMySnippets((prev) => [created, ...prev]);
    } catch {
      alert("Save failed");
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
      alert("File size exceeds 10MB limit");
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
        xhr.setRequestHeader("Authorization", `Bearer ${session.user.sessionToken}`);
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

  const loadUploadedFile = async (file: UploadedFile) => {
    try {
      setFileLoading(file.id);
      setLoading(true);
      console.log(`Loading file ${file.id}: ${file.original_name}`);

      const content = await fetchFileContent(file);

      const contentType = file.content_type;
      const extension = file.original_name.split(".").pop()?.toLowerCase();

      const languageMap: { [key: string]: string } = {
        "text/x-python": "python",
        "application/javascript": "javascript",
        "text/javascript": "javascript",
        "text/html": "html",
        "text/css": "css",
        "text/x-java": "java",
        "text/x-c++": "cpp",
        "image/png": "html",
        "image/jpeg": "html",
        "text/plain":
          extension === "py"
            ? "python"
            : extension === "js"
            ? "javascript"
            : extension === "html"
            ? "html"
            : extension === "css"
            ? "css"
            : extension === "png" || extension === "jpg" || extension === "jpeg"
            ? "html"
            : "javascript",
      };

      let language = languageMap[contentType] || "javascript";

      if (contentType === "text/plain" && extension && languageMap[extension]) {
        language = languageMap[extension];
      }

      if (language === "html" && (contentType.includes("image/") || extension === "png" || extension === "jpg" || extension === "jpeg")) {
        setHtmlCode(`<img src="${file.url}" alt="${file.original_name}" style="max-width: 100%; height: auto;" />`);
      } else if (language === "html") {
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
    if (!selectedLesson) throw new Error("No lesson selected");
    const body = {
      lesson: selectedLesson,
      language: selectedLanguage,
      code_text: selectedLanguage === "html" ? htmlCode : selectedLanguage === "css" ? cssCode : code,
    };
    const res = await fetch("/api/code-ide/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Submission failed");
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout-route", { method: "POST" }).catch(() => {});
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
      setCode(languages[selectedLanguage].template);
      if (selectedLanguage === "html") setHtmlCode(languages.html.template);
      if (selectedLanguage === "css") setCssCode(languages.css.template);
    }
  }, [session, status, selectedLanguage]);

  useEffect(() => {
    const t = setTimeout(() => saveSnippet().catch(() => {}), 10_000);
    return () => clearTimeout(t);
  }, [code, htmlCode, cssCode, selectedLanguage, selectedLesson]);

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetchSnippets().then((snips) => {
        const uniq = Array.from(
          new Set(snips.map((s) => s.lesson).filter(Boolean))
        );
        setLessons(uniq.map((l) => ({ id: String(l), title: `Lesson ${l}` })));
        setMySnippets(snips);
      }),
      fetchSubmissions()
        .then(setMySubmissions)
        .catch(() => {}),
      fetch("/api/code-ide/uploads")
        .then((res) => (res.ok ? res.json() : []))
        .then(setUploadedFiles)
        .catch(() => setUploadedFiles([])),
    ]).catch(() => {});
  }, [status]);

  const copyCode = () => {
    const text = selectedLanguage === "html" ? htmlCode : selectedLanguage === "css" ? cssCode : code;
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
    const content = selectedLanguage === "html" ? htmlCode : selectedLanguage === "css" ? cssCode : code;
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
    setCode(languages[selectedLanguage].template);
    if (selectedLanguage === "html") setHtmlCode(languages.html.template);
    if (selectedLanguage === "css") setCssCode(languages.css.template);
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
    setSyntaxError(null);
    setActiveTab("editor");
  };

  const handleLanguageChange = (lang: string) => {
    const languageKey = lang as keyof typeof languages;
    setSelectedLanguage(languageKey);
    setCode(languages[languageKey].template);
    if (languageKey === "html") setHtmlCode(languages.html.template);
    if (languageKey === "css") setCssCode(languages.css.template);
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
    setSyntaxError(null);
    setActiveTab("editor");
  };

  const handleCodeChange = (value: string) => {
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
      if (detailedSnippet.language === "html") {
        setHtmlCode(detailedSnippet.code_text);
      } else if (detailedSnippet.language === "css") {
        setCssCode(detailedSnippet.code_text);
      } else {
        setCode(detailedSnippet.code_text);
      }
      setSelectedLanguage(detailedSnippet.language);
      if (detailedSnippet.lesson)
        setSelectedLesson(String(detailedSnippet.lesson));
      setActiveTab("editor");
      setSyntaxError(null);
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
    } catch {
      alert("Failed to load snippet details");
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
        alert("File size exceeds 10MB limit");
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
    setIsRunning(true);
    setOutput("");
    setExecutionError("");
    try {
      if (error === "Session expired" || error === "Not authenticated") {
        setOutput("Session expired. Please log in again.");
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
      } else {
        const cfg = languages[selectedLanguage];
        if (cfg.judgeId) {
          try {
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
                  source_code: code,
                  language_id: cfg.judgeId,
                  stdin: "",
                }),
              }
            );
            const result = await res.json();
            if (result.status?.id === 3)
              setOutput(result.stdout || "Success (no output)");
            else if (result.status?.id === 6)
              setOutput(
                `Compilation Error:\n${result.compile_output || result.stderr}`
              );
            else if (result.status?.id === 5) setOutput("Time Limit Exceeded");
            else if (result.status?.id === 4)
              setOutput(`Runtime Error:\n${result.stderr}`);
            else setOutput(result.stderr || result.stdout || "Unknown error");
          } catch {
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
    }
  };

  const handleSubmit = async () => {
    if (!selectedLesson) return alert("Please select a lesson");
    try {
      await createSubmission();
      alert("Submitted successfully");
    } catch {
      alert("Submission failed");
    }
  };

  if (loading && !fileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (error === "Session expired" || error === "Not authenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <p className="text-center text-muted-foreground">
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
    <div className="space-y-6">
      <style jsx>{`
        .code-editor-textarea {
          background: #2b2b2b;
          color: #f8f8f2;
          font-family: 'Fira Code', monospace;
          border: none;
          border-radius: 4px;
          padding: 12px;
          line-height: 1.5;
          caret-color: #f8f8f2;
        }
        .code-editor-textarea:focus {
          outline: none;
          box-shadow: 0 0 0 2px #EF7B55;
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
        }
        .syntax-error {
          background: #ff555522;
          border: 1px solid #ff5555;
          color: #ff5555;
          padding: 8px;
          border-radius: 4px;
          margin-top: 8px;
        }
        .codemirror-container {
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #44475a;
        }
        .codemirror-container .cm-editor {
          height: 400px;
          font-family: 'Fira Code', monospace;
          font-size: 14px;
          line-height: 1.5;
        }
        .codemirror-container .cm-focused {
          outline: 2px solid #EF7B55;
        }
      `}</style>
      <div>
        <h1 className="text-3xl font-bold">Code IDE</h1>
        <p className="text-muted-foreground">
          Write, run, and test your code in multiple programming languages with
          real-time execution
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
        className="relative mr-auto w-full"
      >
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="editor"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Editor
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Output
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Files
          </TabsTrigger>
          <TabsTrigger
            value="submission"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Submission
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="tab-content">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Code Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedLanguage}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(languages).map(([key, lang]) => (
                        <SelectItem key={key} value={key}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={resetCode}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className={`codemirror-container ${syntaxError ? 'error-line' : ''}`}>
                <CodeMirror
                  value={selectedLanguage === "html" ? htmlCode : selectedLanguage === "css" ? cssCode : code}
                  extensions={codeMirrorExtensions[selectedLanguage as keyof typeof codeMirrorExtensions]}
                  theme={monokai}
                  height="400px"
                  basicSetup={{
                    lineNumbers: true,
                    tabSize: 2,
                    indentOnInput: true,
                    lineWrapping: true,
                  }}
                  editable={!loading}
                  onChange={handleCodeChange}
                  className="flex-1"
                />
              </div>
              {syntaxError && (
                <div className="syntax-error">
                  {syntaxError}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={runCode}
                  disabled={isRunning || !!error || loading}
                  className="flex-1 bg-[#EF7B55] hover:bg-[#F79771]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isRunning ? "Executing..." : "Run Code"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    saveSnippet().catch(() => alert("Save failed"))
                  }
                  disabled={loading}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!selectedLesson || loading}
                >
                  Submit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCode}
                  disabled={loading}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCode}
                  disabled={loading}
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
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedLanguage === "html" || selectedLanguage === "css"
                  ? "Preview & Output"
                  : "Output"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {(selectedLanguage === "html" || selectedLanguage === "css") &&
              htmlPreview ? (
                <Tabs defaultValue="preview" className="h-full flex flex-col">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="output">Console</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="flex-1">
                    <iframe
                      ref={iframeRef}
                      srcDoc={htmlPreview}
                      className="w-full h-[400px] border rounded-md bg-white"
                      title="HTML/CSS Preview"
                    />
                  </TabsContent>
                  <TabsContent value="output" className="flex-1">
                    <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-[400px] overflow-auto">
                      <pre className="whitespace-pre-wrap">
                        {output || "Run your code to see output here..."}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-[400px] overflow-auto">
                  <pre className="whitespace-pre-wrap">
                    {output || "Run your code to see output here..."}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="tab-content">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Files</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetCode();
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  disabled={uploading}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Code
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
            <CardContent className="flex-1 flex flex-col gap-4">
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
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                  <TabsTrigger value="uploads">Uploads</TabsTrigger>
                </TabsList>
                <TabsContent value="saved">
                  <Accordion type="single" collapsible>
                    {Object.entries(
                      paginatedSnippets.reduce(
                        (acc: Record<string, Snippet[]>, s) => {
                          const key = s.lesson
                            ? `Lesson-${s.lesson}`
                            : `General-${s.id}`;
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(s);
                          return acc;
                        },
                        {}
                      )
                    ).map(([key, snips]) => (
                      <AccordionItem key={key} value={key}>
                        <AccordionTrigger>
                          {key.startsWith("Lesson-")
                            ? `Lesson ${key.split("-")[1]}`
                            : "General"}
                        </AccordionTrigger>
                        <AccordionContent>
                          {snips
                            .sort(
                              (a, b) =>
                                new Date(b.updated_at).getTime() -
                                new Date(a.updated_at).getTime()
                            )
                            .map((s) => (
                              <div
                                key={s.id}
                                className="cursor-pointer hover:bg-accent p-2 rounded text-sm flex justify-between items-center"
                              >
                                <span onClick={() => loadSnippet(s)}>
                                  {s.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
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
                            ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <div className="flex justify-between mt-4">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {currentPage} of {totalSnippetPages}
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
                      <Card key={file.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4
                              className={`font-medium cursor-pointer hover:text-primary ${
                                fileLoading === file.id
                                  ? "opacity-50 cursor-wait"
                                  : ""
                              }`}
                              onClick={() =>
                                !loading &&
                                !fileLoading &&
                                loadUploadedFile(file)
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
                            <p className="text-sm text-muted-foreground">
                              {file.original_name} •{" "}
                              {Math.round(file.size_bytes / 1024)} KB •
                              {file.lesson
                                ? ` Lesson ${file.lesson}`
                                : " No lesson"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(file.updated_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
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
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1 || uploading}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span>
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
  onSubmit: () => void;
  role?: string;
  submissions: Submission[];
  onGrade: (id: number, upd: any) => Promise<void>;
  onComment: (id: number, msg: string) => Promise<void>;
  fetchSubmissionDetail: (id: number) => Promise<Submission>;
}) {
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

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
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Code Submission</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
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
        <Button onClick={onSubmit} disabled={!selectedLesson}>
          Submit Code
        </Button>

        {submissions.length > 0 && (
          <div className="border rounded-md p-3 space-y-2">
            <p className="text-sm font-medium">
              {role === "teacher" ? "All submissions" : "My submissions"}
            </p>
            {submissions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-xs border-b pb-2 cursor-pointer hover:bg-accent/20 rounded px-2"
                onClick={() => viewDetail(s)}
              >
                <span>
                  #{s.id} – {s.status}
                </span>
                <span>{s.score ?? "-"} pts</span>
              </div>
            ))}
          </div>
        )}

        {viewing && (
          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Submission #{viewing.id}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewing(null)}
              >
                Close
              </Button>
            </div>

            <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
              {viewing.code_text}
            </pre>

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
                  <span className="font-semibold">{c.author_name}</span> –{" "}
                  {c.message}
                  <div className="text-muted-foreground">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
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
          </div>
        )}

        {loading && <Spinner size="sm" />}
      </CardContent>
    </Card>
  );
}