"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";

/* -------------------------------------------------- */
/* Types from backend docs                            */
/* -------------------------------------------------- */
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
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState("");
  const [executionError, setExecutionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedLesson, setSelectedLesson] = useState("");

  /* ---------- lesson list from real snippets ---------- */
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);

  /* ==========  SNIPPET ROUTES  =================== */
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
      code_text: code,
      meta: {},
    };
    const res = await fetch("/api/code-ide/snippets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Save failed");
    const created: Snippet = await res.json();
    setMySnippets((prev) => [created, ...prev]);
  };

  /* ==========  SUBMISSION ROUTES  ================ */
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
    const body = { lesson: selectedLesson, language: selectedLanguage, code_text: code };
    const res = await fetch("/api/code-ide/submissions/create", {
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
    updates: { score?: string; feedback?: string; correction_code?: string; status?: "graded" | "revised" }
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

  /* ==========  COMMENT ROUTE  ==================== */
  const addComment = async (submissionId: number, message: string) => {
    const res = await fetch(`/api/code-ide/submissions/${submissionId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Comment failed");
    return res.json() as Promise<Comment>;
  };

  /* -------------------------------------------------- */
  /* UI  helpers                                        */
  /* -------------------------------------------------- */
  const languages = {
    javascript: { name: "JavaScript", judgeId: 63, template: `console.log("Hello, World!");` },
    python: { name: "Python", judgeId: 71, template: `print("Hello, World!")` },
    java: { name: "Java", judgeId: 62, template: `System.out.println("Hello");` },
    cpp: { name: "C++", judgeId: 54, template: `std::cout << "Hello";` },
    html: { name: "HTML", judgeId: null, template: `<h1>Hello</h1>` },
    css: { name: "CSS", judgeId: null, template: `body{color:red;}` },
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout-route", { method: "POST" }).catch(() => {});
    document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
    document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
    window.location.href = "/login";
  };

  /* -------------------------------------------------- */
  /* side effects                                       */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      setError("Not authenticated");
      setLoading(false);
    } else {
      setError(null);
      setLoading(false);
      setCode(languages[selectedLanguage].template);
    }
  }, [session, status, selectedLanguage]);

  /* auto-save */
  useEffect(() => {
    const t = setTimeout(() => saveSnippet().catch(() => {}), 10_000);
    return () => clearTimeout(t);
  }, [code, selectedLanguage, selectedLesson]);

  /* initial load: lessons + my submissions + my snippets */
  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetchSnippets().then((snips) => {
        const uniq = Array.from(new Set(snips.map((s) => s.lesson).filter(Boolean)));
        setLessons(uniq.map((l) => ({ id: String(l), title: `Lesson ${l}` })));
        setMySnippets(snips);
      }),
      fetchSubmissions().then(setMySubmissions).catch(() => {}),
    ]).catch(() => {});
  }, [status]);

  /* -------------------------------------------------- */
  /* UI handlers                                        */
  /* -------------------------------------------------- */
  const copyCode = () => navigator.clipboard.writeText(code);
  const downloadCode = () => {
    const ext = { javascript: "js", python: "py", java: "java", cpp: "cpp", html: "html", css: "css" } as const;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `code.${ext[selectedLanguage]}`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const resetCode = () => {
    setCode(languages[selectedLanguage].template);
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
  };
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setCode(languages[lang as keyof typeof languages].template);
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
  };
  const handleCodeChange = (v: string) => {
    setCode(v);
    if (selectedLanguage === "html") setHtmlPreview(v);
    if (selectedLanguage === "css") {
      const html = `<!DOCTYPE html><html><head><style>${v}</style></head><body><div class="container"><h1>CSS Preview</h1><button class="button">Btn</button></div></body></html>`;
      setHtmlPreview(html);
    }
  };

  /* -------------------------------------------------- */
  /* run / submit / comment                             */
  /* -------------------------------------------------- */
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
          setOutput(logs.join("\n") || "Code executed successfully (no output)");
        } catch (e: any) {
          setOutput(`Error: ${e.message}`);
        } finally {
          console.log = original;
        }
      } else if (selectedLanguage === "html") {
        setHtmlPreview(code);
        setOutput("HTML rendered in preview tab");
      } else if (selectedLanguage === "css") {
        const html = `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="container"><h1>CSS Preview</h1><button class="button">Btn</button></div></body></html>`;
        setHtmlPreview(html);
        setOutput("CSS applied to preview template");
      } else {
        const cfg = languages[selectedLanguage];
        if (cfg.judgeId) {
          try {
            const res = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true ", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": "aa76b3efa6msh96695e665e5f57fp105d9cjsn87230da97198",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              },
              body: JSON.stringify({ source_code: code, language_id: cfg.judgeId, stdin: "" }),
            });
            const result = await res.json();
            if (result.status?.id === 3) setOutput(result.stdout || "Success (no output)");
            else if (result.status?.id === 6) setOutput(`Compilation Error:\n${result.compile_output || result.stderr}`);
            else if (result.status?.id === 5) setOutput("Time Limit Exceeded");
            else if (result.status?.id === 4) setOutput(`Runtime Error:\n${result.stderr}`);
            else setOutput(result.stderr || result.stdout || "Unknown error");
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

  /* -------------------------------------------------- */
  /* render                                             */
  /* -------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" />
      </div>
    );
  }

  if (error === "Session expired" || error === "Not authenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Session Expired</CardTitle>
            <CardDescription className="text-center">Your session has expired or you are not authenticated. Please log in again to continue.</CardDescription>
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
      <div>
        <h1 className="text-3xl font-bold">Code IDE</h1>
        <p className="text-muted-foreground">Write, run, and test your code in multiple programming languages with real-time execution</p>
      </div>

      {executionError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{executionError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="editor" className="relative mr-auto w-full">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger value="editor" className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Editor
          </TabsTrigger>
          <TabsTrigger value="output" className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Output
          </TabsTrigger>
          <TabsTrigger value="submission" className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Submission
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Code Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
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
              <Textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Write your code here..."
                className="flex-1 font-mono text-sm resize-none min-h-[400px]"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={runCode} disabled={isRunning || !!error} className="flex-1 bg-[#EF7B55] hover:bg-[#F79771]">
                  <Play className="mr-2 h-4 w-4" />
                  {isRunning ? "Executing..." : "Run Code"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => saveSnippet().catch(() => alert("Save failed"))}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleSubmit} disabled={!selectedLesson}>
                  Submit
                </Button>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCode}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={resetCode}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>{selectedLanguage === "html" || selectedLanguage === "css" ? "Preview & Output" : "Output"}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {(selectedLanguage === "html" || selectedLanguage === "css") && htmlPreview ? (
                <Tabs defaultValue="preview" className="h-full flex flex-col">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="output">Console</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="flex-1">
                    <iframe ref={iframeRef} srcDoc={htmlPreview} className="w-full h-[400px] border rounded-md" title="HTML Preview" />
                  </TabsContent>
                  <TabsContent value="output" className="flex-1">
                    <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-[400px] overflow-auto">
                      <pre className="whitespace-pre-wrap">{output || "Run your code to see output here..."}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-[400px] overflow-auto">
                  <pre className="whitespace-pre-wrap">{output || "Run your code to see output here..."}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submission">
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

/* ================================================================= */
/* SubmissionTab  –  isolated to keep main component clean           */
/* ================================================================= */
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

  /* load full detail + comments when user clicks a row */
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
      /* reload detail to show new comment */
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
        <Button onClick={onSubmit} disabled={!selectedLesson}>Submit Code</Button>

        {/* List of existing submissions */}
        {submissions.length > 0 && (
          <div className="border rounded-md p-3 space-y-2">
            <p className="text-sm font-medium">{role === "teacher" ? "All submissions" : "My submissions"}</p>
            {submissions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-xs border-b pb-2 cursor-pointer hover:bg-accent/20 rounded px-2"
                onClick={() => viewDetail(s)}
              >
                <span>#{s.id} – {s.status}</span>
                <span>{s.score ?? "-"} pts</span>
              </div>
            ))}
          </div>
        )}

        {/* Detail pane + comments + teacher grade box */}
        {viewing && (
          <div className="border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Submission #{viewing.id}</p>
              <Button size="sm" variant="ghost" onClick={() => setViewing(null)}>
                Close
              </Button>
            </div>

            <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">{viewing.code_text}</pre>

            {/* Teacher grade box */}
            {role === "teacher" && viewing.status !== "graded" && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await onGrade(viewing.id, { score: "90", feedback: "Great job", status: "graded" });
                    alert("Graded 90");
                  }}
                >
                  Grade 90
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await onGrade(viewing.id, { score: "75", feedback: "Needs improvement", status: "revised" });
                    alert("Sent for revision");
                  }}
                >
                  Request revision
                </Button>
              </div>
            )}

            {/* Comments section – both roles can post */}
            <div className="space-y-2">
              <p className="text-xs font-medium flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Comments
              </p>
              {viewing.comments.map((c) => (
                <div key={c.id} className="text-xs bg-muted p-2 rounded">
                  <span className="font-semibold">{c.author_name}</span> – {c.message}
                  <div className="text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a comment…"
                  className="min-h-[60px] text-xs"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button size="sm" onClick={sendComment} disabled={!comment.trim()}>
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