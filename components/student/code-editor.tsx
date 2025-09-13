"use client";

import {useState, useRef, useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Play,
  Download,
  Copy,
  RotateCcw,
  AlertCircle,
  LogIn,
} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";

export function CodeEditor() {
  const {data: session, status} = useSession();
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState("");
  const [executionError, setExecutionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const languages = {
    javascript: {
      name: "JavaScript",
      judgeId: 63, // Node.js
      template: `// JavaScript Code
console.log("Hello, World!");

// Example: Calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));

// Example: Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled array:", doubled);`,
    },
    python: {
      name: "Python",
      judgeId: 71, // Python 3
      template: `# Python Code
print("Hello, World!")

# Example: Calculate factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("Factorial of 5:", factorial(5))

# Example: List comprehension
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled list:", doubled)

# Example: Working with dictionaries
person = {"name": "Alice", "age": 30}
print(f"Person: {person['name']}, Age: {person['age']}")`,
    },
    java: {
      name: "Java",
      judgeId: 62, // Java 8
      template: `// Java Code
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example: Calculate factorial
        System.out.println("Factorial of 5: " + factorial(5));
        
        // Example: Array operations
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("Original array: ");
        System.out.println(Arrays.toString(numbers));
        
        // Double the array elements
        for (int i = 0; i < numbers.length; i++) {
            numbers[i] *= 2;
        }
        System.out.print("Doubled array: ");
        System.out.println(Arrays.toString(numbers));
        
        // Example: ArrayList
        ArrayList<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Orange");
        System.out.println("Fruits: " + fruits);
    }
    
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}`,
    },
    cpp: {
      name: "C++",
      judgeId: 54, // C++ 17
      template: `// C++ Code
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Factorial of 5: " << factorial(5) << endl;
    
    // Example: Vector operations
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Original vector: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Double the vector elements
    transform(numbers.begin(), numbers.end(), numbers.begin(), 
              [](int n) { return n * 2; });
    
    cout << "Doubled vector: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    return 0;
}`,
    },
    html: {
      name: "HTML",
      judgeId: null,
      template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .feature {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Web Page</h1>
        <div class="feature">
            <h3>Feature 1</h3>
            <p>This is a sample HTML page with CSS styling.</p>
        </div>
        <div class="feature">
            <h3>Feature 2</h3>
            <p>You can edit this code and see the preview in real-time.</p>
        </div>
        <div class="feature">
            <h3>Interactive Element</h3>
            <button onclick="alert('Hello from JavaScript!')">Click Me!</button>
        </div>
    </div>
    
    <script>
        console.log("Page loaded successfully!");
    </script>
</body>
</html>`,
    },
    css: {
      name: "CSS",
      judgeId: null,
      template: `/* CSS Code */
body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 20px;
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    color: white;
}

.card {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    margin: 15px 0;
    border-radius: 10px;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.button {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.button:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}`,
    },
  };

  const handleLogout = async () => {
    console.log(
      "[CodeEditor] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });
      console.log("[CodeEditor] Logout API response status:", response.status);
      const data = await response.json();
      console.log("[CodeEditor] Logout API response:", data);
      if (!response.ok) {
        console.error("[CodeEditor] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
      console.log("[CodeEditor] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[CodeEditor] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    console.log(
      "[CodeEditor] Checking authentication status:",
      status,
      "sessionToken:",
      session?.user?.sessionToken
    );
    if (status === "loading") {
      setLoading(true);
    } else if (status !== "authenticated" || !session?.user?.sessionToken) {
      console.log("[CodeEditor] Session not authenticated");
      setError("Not authenticated");
      setLoading(false);
    } else {
      setError(null);
      setLoading(false);
      setCode(languages[selectedLanguage].template);
    }
  }, [session, status, selectedLanguage]);

  const executeCodeOnline = async (sourceCode: string, languageId: number) => {
    console.log("[CodeEditor] Executing code online, languageId:", languageId);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "aa76b3efa6msh96695e665e5f57fp105d9cjsn87230da97198",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      };
      if (session?.user?.sessionToken) {
        headers["X-Session-Token"] = session.user.sessionToken;
      }
      const submitResponse = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            source_code: sourceCode,
            language_id: languageId,
            stdin: "",
          }),
        }
      );

      console.log(
        "[CodeEditor] Judge0 API response status:",
        submitResponse.status
      );
      if (!submitResponse.ok) {
        console.error(
          "[CodeEditor] Judge0 API failed with status:",
          submitResponse.status
        );
        if (submitResponse.status === 401 || submitResponse.status === 403) {
          setError("Session expired");
          return "Session expired. Please log in again.";
        }
        throw new Error("Failed to submit code for execution");
      }

      const result = await submitResponse.json();
      console.log("[CodeEditor] Judge0 API response:", result);
      setError(null);

      if (result.status?.id === 3) {
        return result.stdout || "Code executed successfully (no output)";
      } else if (result.status?.id === 6) {
        return `Compilation Error:\n${result.compile_output || result.stderr}`;
      } else if (result.status?.id === 5) {
        return "Error: Time Limit Exceeded";
      } else if (result.status?.id === 4) {
        return `Runtime Error:\n${result.stderr}`;
      } else {
        return result.stderr || result.stdout || "Unknown execution error";
      }
    } catch (error) {
      console.error("[CodeEditor] Code execution error:", error);
      setError("Session expired");
      return `Network Error: Unable to execute code. ${error}`;
    }
  };

  const executeCodeLocally = async (sourceCode: string, language: string) => {
    console.log("[CodeEditor] Executing code locally, language:", language);
    const simulatedOutputs = {
      python: `Hello, World!
Factorial of 5: 120
Doubled list: [2, 4, 6, 8, 10]
Person: Alice, Age: 30`,
      java: `Hello, World!
Factorial of 5: 120
Original array: [1, 2, 3, 4, 5]
Doubled array: [2, 4, 6, 8, 10]
Fruits: [Apple, Banana, Orange]`,
      cpp: `Hello, World!
Factorial of 5: 120
Original vector: 1 2 3 4 5 
Doubled vector: 2 4 6 8 10 `,
    };

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      if (language === "python" && sourceCode.includes("print")) {
        const lines = sourceCode.split("\n");
        const outputs: string[] = [];

        for (const line of lines) {
          if (line.trim().startsWith("print(") && line.includes('"')) {
            const match = line.match(/print\("([^"]+)"\)/);
            if (match) {
              outputs.push(match[1]);
            }
          }
        }

        if (outputs.length > 0) {
          return outputs.join("\n");
        }
      }

      return (
        simulatedOutputs[language as keyof typeof simulatedOutputs] ||
        "Code executed successfully"
      );
    } catch (error) {
      return `Execution Error: ${error}`;
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setExecutionError("");

    try {
      if (error === "Session expired" || error === "Not authenticated") {
        setOutput("Session expired. Please log in again.");
        setIsRunning(false);
        return;
      }

      if (selectedLanguage === "javascript") {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map((arg) => String(arg)).join(" "));
        };

        try {
          const func = new Function(code);
          func();
          setOutput(
            logs.join("\n") || "Code executed successfully (no output)"
          );
        } catch (error) {
          setOutput(`Error: ${error}`);
        } finally {
          console.log = originalLog;
        }
      } else if (selectedLanguage === "html") {
        setHtmlPreview(code);
        setOutput("HTML rendered in preview tab");
      } else if (selectedLanguage === "css") {
        const htmlWithCSS = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>${code}</style>
          </head>
          <body>
            <div class="container">
              <h1>CSS Preview</h1>
              <div class="card">
                <h3>Card Example</h3>
                <p>This demonstrates your CSS styling.</p>
                <button class="button">Sample Button</button>
              </div>
              <div class="card">
                <h3>Another Card</h3>
                <p>Hover over elements to see interactions.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        setHtmlPreview(htmlWithCSS);
        setOutput("CSS applied to preview template");
      } else {
        const languageConfig =
          languages[selectedLanguage as keyof typeof languages];

        if (languageConfig.judgeId) {
          try {
            const result = await executeCodeOnline(
              code,
              languageConfig.judgeId
            );
            setOutput(result);
          } catch (error) {
            setExecutionError(
              "Online execution unavailable. Using local simulation."
            );
            const result = await executeCodeLocally(code, selectedLanguage);
            setOutput(result);
          }
        } else {
          setOutput("Language not supported for execution");
        }
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      html: "html",
      css: "css",
    };

    const blob = new Blob([code], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${
      extensions[selectedLanguage as keyof typeof extensions]
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCode = () => {
    setCode(languages[selectedLanguage as keyof typeof languages].template);
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(languages[language as keyof typeof languages].template);
    setOutput("");
    setHtmlPreview("");
    setExecutionError("");
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (selectedLanguage === "html") {
      setHtmlPreview(value);
    } else if (selectedLanguage === "css") {
      const htmlWithCSS = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${value}</style>
        </head>
        <body>
          <div class="container">
            <h1>CSS Preview</h1>
            <div class="card">
              <h3>Card Example</h3>
              <p>This demonstrates your CSS styling.</p>
              <button class="button">Sample Button</button>
            </div>
            <div class="card">
              <h3>Another Card</h3>
              <p>Hover over elements to see interactions.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      setHtmlPreview(htmlWithCSS);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-black" />
      </div>
    );
  }

  if (
    error === "Session expired" ||
    error === "Not authenticated" ||
    (status === "authenticated" && error === "Session expired")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <CardDescription className="text-center">
              Your session has expired or you are not authenticated. Please log
              in again to continue.
            </CardDescription>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Code Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}>
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
              <Button
                onClick={runCode}
                disabled={isRunning || !!error}
                className="flex-1 bg-[#EF7B55] hover:bg-[#F79771]">
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? "Executing..." : "Run Code"}
              </Button>
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCode}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

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
                    className="w-full h-[400px] border rounded-md"
                    title="HTML Preview"
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
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-[400px] overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {output || "Run your code to see output here..."}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
