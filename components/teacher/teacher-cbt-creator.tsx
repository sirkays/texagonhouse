"use client";

import {useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Clock,
  Users,
  TestTube,
  Copy,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "essay";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
  explanation?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

interface CBTTest {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  questions: Question[];
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  isPublished: boolean;
}

export function TeacherCBTCreator() {
  const [activeTab, setActiveTab] = useState("create");
  const [currentTest, setCurrentTest] = useState<CBTTest>({
    id: "",
    title: "",
    description: "",
    duration: 30,
    totalPoints: 0,
    questions: [],
    difficulty: "Medium",
    category: "",
    isPublished: false,
  });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [isPreviewTestOpen, setIsPreviewTestOpen] = useState(false);
  const [selectedTestForEdit, setSelectedTestForEdit] =
    useState<CBTTest | null>(null);
  const [selectedTestForPreview, setSelectedTestForPreview] =
    useState<CBTTest | null>(null);
  const [selectedTestForAnalytics, setSelectedTestForAnalytics] =
    useState<CBTTest | null>(null);
  const [isAnalyticsDetailOpen, setIsAnalyticsDetailOpen] = useState(false);

  const existingTests: CBTTest[] = [
    {
      id: "1",
      title: "React Fundamentals",
      description: "Test your knowledge of React basics",
      duration: 45,
      totalPoints: 100,
      questions: [],
      difficulty: "Medium",
      category: "Frontend",
      isPublished: true,
    },
    {
      id: "2",
      title: "JavaScript Advanced Concepts",
      description: "Advanced JavaScript topics and patterns",
      duration: 60,
      totalPoints: 150,
      questions: [],
      difficulty: "Hard",
      category: "Programming",
      isPublished: false,
    },
  ];

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 5,
      difficulty: "Medium",
    };
    setCurrentTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + 5,
    }));
    setEditingQuestion(newQuestion);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? {...q, ...updates} : q
      ),
    }));
    if (editingQuestion?.id === questionId) {
      setEditingQuestion((prev) => (prev ? {...prev, ...updates} : null));
    }
  };

  const deleteQuestion = (questionId: string) => {
    const question = currentTest.questions.find((q) => q.id === questionId);
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      totalPoints: prev.totalPoints - (question?.points || 0),
    }));
    if (editingQuestion?.id === questionId) {
      setEditingQuestion(null);
    }
  };

  const saveTest = () => {
    // Save test logic here
    console.log("Saving test:", currentTest);
    alert("Test saved successfully!");
  };

  const publishTest = () => {
    setCurrentTest((prev) => ({...prev, isPublished: true}));
    alert("Test published successfully!");
  };

  const handleEditTest = (test: CBTTest) => {
    setSelectedTestForEdit(test);
    setCurrentTest(test);
    setIsEditTestOpen(true);
  };

  const handlePreviewTest = (test: CBTTest) => {
    setSelectedTestForPreview(test);
    setIsPreviewTestOpen(true);
  };

  const handleDuplicateTest = (test: CBTTest) => {
    const duplicatedTest = {
      ...test,
      id: Date.now().toString(),
      title: `${test.title} (Copy)`,
      isPublished: false,
    };
    console.log("Duplicating test:", duplicatedTest);
    alert("Test duplicated successfully!");
  };

  const handleDeleteTest = (testId: string) => {
    if (confirm("Are you sure you want to delete this test?")) {
      console.log("Deleting test:", testId);
      alert("Test deleted successfully!");
    }
  };

  const handleViewAnalyticsDetails = (test: CBTTest) => {
    setSelectedTestForAnalytics(test);
    setIsAnalyticsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CBT Test Creator</h1>
        <p className="text-muted-foreground">
          Create and manage computer-based tests for your students
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create">Create New Test</TabsTrigger>
          <TabsTrigger value="manage">Manage Tests</TabsTrigger>
          <TabsTrigger value="analytics">Test Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Test Configuration */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Set up your test parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    value={currentTest.title}
                    onChange={(e) =>
                      setCurrentTest((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter test title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentTest.description}
                    onChange={(e) =>
                      setCurrentTest((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what this test covers"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={currentTest.duration}
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          duration: Number.parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={currentTest.difficulty}
                      onValueChange={(value: "Easy" | "Medium" | "Hard") =>
                        setCurrentTest((prev) => ({...prev, difficulty: value}))
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={currentTest.category}
                    onValueChange={(value) =>
                      setCurrentTest((prev) => ({...prev, category: value}))
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">
                        Frontend Development
                      </SelectItem>
                      <SelectItem value="Backend">
                        Backend Development
                      </SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="AI/ML">AI/Machine Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Questions:</span>
                    <span>{currentTest.questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Points:</span>
                    <span>{currentTest.totalPoints}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button onClick={saveTest} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Test
                  </Button>
                  <Button
                    onClick={publishTest}
                    variant="outline"
                    className="w-full bg-transparent">
                    <TestTube className="mr-2 h-4 w-4" />
                    Publish Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>
                      Manage your test questions
                    </CardDescription>
                  </div>
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentTest.questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No questions added yet</p>
                    <p className="text-sm">
                      Click the + button to add your first question
                    </p>
                  </div>
                ) : (
                  currentTest.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        editingQuestion?.id === question.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setEditingQuestion(question)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              Q{index + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {question.type.replace("-", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {question.points} pts
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">
                            {question.question || "Untitled question"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(question.id);
                          }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Question Editor */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Question Editor</CardTitle>
                <CardDescription>
                  {editingQuestion
                    ? "Edit the selected question"
                    : "Select a question to edit"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingQuestion ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={editingQuestion.type}
                        onValueChange={(value: Question["type"]) =>
                          updateQuestion(editingQuestion.id, {type: value})
                        }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="short-answer">
                            Short Answer
                          </SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        value={editingQuestion.question}
                        onChange={(e) =>
                          updateQuestion(editingQuestion.id, {
                            question: e.target.value,
                          })
                        }
                        placeholder="Enter your question here"
                        rows={3}
                      />
                    </div>

                    {editingQuestion.type === "multiple-choice" && (
                      <div className="space-y-3">
                        <Label>Answer Options</Label>
                        <RadioGroup
                          value={editingQuestion.correctAnswer.toString()}
                          onValueChange={(value) =>
                            updateQuestion(editingQuestion.id, {
                              correctAnswer: Number.parseInt(value),
                            })
                          }>
                          {editingQuestion.options?.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                              />
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(editingQuestion.options || []),
                                  ];
                                  newOptions[index] = e.target.value;
                                  updateQuestion(editingQuestion.id, {
                                    options: newOptions,
                                  });
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {editingQuestion.type === "true-false" && (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <RadioGroup
                          value={editingQuestion.correctAnswer.toString()}
                          onValueChange={(value) =>
                            updateQuestion(editingQuestion.id, {
                              correctAnswer: value,
                            })
                          }>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="true" />
                            <Label htmlFor="true">True</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="false" />
                            <Label htmlFor="false">False</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={editingQuestion.points}
                        onChange={(e) =>
                          updateQuestion(editingQuestion.id, {
                            points: Number.parseInt(e.target.value),
                          })
                        }
                        min="1"
                        max="50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Textarea
                        value={editingQuestion.explanation || ""}
                        onChange={(e) =>
                          updateQuestion(editingQuestion.id, {
                            explanation: e.target.value,
                          })
                        }
                        placeholder="Explain the correct answer"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Select a question to edit</p>
                    <p className="text-sm">
                      Choose a question from the list to start editing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manage Tests</h2>
              <p className="text-muted-foreground">
                View and manage all your created tests
              </p>
            </div>
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Test
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {existingTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {test.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditTest(test)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateTest(test)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePreviewTest(test)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTest(test.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={test.isPublished ? "default" : "secondary"}>
                      {test.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{test.difficulty}</Badge>
                    <Badge variant="outline">{test.category}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {test.duration} mins
                    </div>
                    <div className="flex items-center gap-1">
                      <TestTube className="h-3 w-3" />
                      {test.totalPoints} pts
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditTest(test)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewTest(test)}>
                      <Eye className="mr-2 h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Test Analytics</h2>
            <p className="text-muted-foreground">
              Monitor test performance and student results
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  +1% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Performance Overview</CardTitle>
              <CardDescription>
                Detailed analytics for your tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {existingTests.map((test, index) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{test.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {Math.floor(Math.random() * 500) + 100} attempts
                        </div>
                        <div>Avg: {Math.floor(Math.random() * 30) + 70}%</div>
                        <div>Pass: {Math.floor(Math.random() * 20) + 80}%</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnalyticsDetails(test)}>
                      <Eye className="mr-2 h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Test Modal */}
      <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test: {selectedTestForEdit?.title}</DialogTitle>
            <DialogDescription>
              Modify your test configuration and questions
            </DialogDescription>
          </DialogHeader>

          {selectedTestForEdit && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Test Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Title</Label>
                    <Input
                      value={currentTest.title}
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={currentTest.description}
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={currentTest.duration}
                        onChange={(e) =>
                          setCurrentTest((prev) => ({
                            ...prev,
                            duration: Number.parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={currentTest.difficulty}
                        onValueChange={(value: "Easy" | "Medium" | "Hard") =>
                          setCurrentTest((prev) => ({
                            ...prev,
                            difficulty: value,
                          }))
                        }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Management */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Questions ({currentTest.questions.length})
                    </CardTitle>
                    <Button onClick={addQuestion} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentTest.questions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No questions added yet</p>
                        <p className="text-sm">
                          Click "Add Question" to create your first question
                        </p>
                      </div>
                    ) : (
                      currentTest.questions.map((question, index) => (
                        <Card
                          key={question.id}
                          className="border-l-4 border-l-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Question {index + 1}
                                </span>
                                <Badge variant="outline">
                                  {question.type.replace("-", " ")}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {question.points} pts
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteQuestion(question.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Question Type */}
                            <div className="space-y-2">
                              <Label>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value: Question["type"]) =>
                                  updateQuestion(question.id, {type: value})
                                }>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple-choice">
                                    Multiple Choice
                                  </SelectItem>
                                  <SelectItem value="true-false">
                                    True/False
                                  </SelectItem>
                                  <SelectItem value="short-answer">
                                    Short Answer
                                  </SelectItem>
                                  <SelectItem value="essay">Essay</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-2">
                              <Label>Question</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    question: e.target.value,
                                  })
                                }
                                placeholder="Enter your question here"
                                rows={3}
                              />
                            </div>

                            {/* Multiple Choice Options */}
                            {question.type === "multiple-choice" && (
                              <div className="space-y-3">
                                <Label>Answer Options</Label>
                                <RadioGroup
                                  value={question.correctAnswer.toString()}
                                  onValueChange={(value) =>
                                    updateQuestion(question.id, {
                                      correctAnswer: Number.parseInt(value),
                                    })
                                  }>
                                  {question.options?.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center space-x-2">
                                      <RadioGroupItem
                                        value={optIndex.toString()}
                                        id={`q${question.id}-option-${optIndex}`}
                                      />
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [
                                            ...(question.options || []),
                                          ];
                                          newOptions[optIndex] = e.target.value;
                                          updateQuestion(question.id, {
                                            options: newOptions,
                                          });
                                        }}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="flex-1"
                                      />
                                      {optIndex === question.correctAnswer && (
                                        <Badge
                                          variant="default"
                                          className="text-xs">
                                          Correct
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            )}

                            {/* True/False Options */}
                            {question.type === "true-false" && (
                              <div className="space-y-2">
                                <Label>Correct Answer</Label>
                                <RadioGroup
                                  value={question.correctAnswer.toString()}
                                  onValueChange={(value) =>
                                    updateQuestion(question.id, {
                                      correctAnswer: value,
                                    })
                                  }>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="true"
                                      id={`q${question.id}-true`}
                                    />
                                    <Label htmlFor={`q${question.id}-true`}>
                                      True
                                    </Label>
                                    {question.correctAnswer === "true" && (
                                      <Badge
                                        variant="default"
                                        className="text-xs ml-2">
                                        Correct
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="false"
                                      id={`q${question.id}-false`}
                                    />
                                    <Label htmlFor={`q${question.id}-false`}>
                                      False
                                    </Label>
                                    {question.correctAnswer === "false" && (
                                      <Badge
                                        variant="default"
                                        className="text-xs ml-2">
                                        Correct
                                      </Badge>
                                    )}
                                  </div>
                                </RadioGroup>
                              </div>
                            )}

                            {/* Short Answer/Essay Sample Answer */}
                            {(question.type === "short-answer" ||
                              question.type === "essay") && (
                              <div className="space-y-2">
                                <Label>Sample Answer (Optional)</Label>
                                <Textarea
                                  value={question.correctAnswer.toString()}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      correctAnswer: e.target.value,
                                    })
                                  }
                                  placeholder={`Enter a sample ${
                                    question.type === "short-answer"
                                      ? "short answer"
                                      : "essay response"
                                  }`}
                                  rows={question.type === "essay" ? 4 : 2}
                                />
                              </div>
                            )}

                            {/* Points and Explanation */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Points</Label>
                                <Input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) => {
                                    const newPoints =
                                      Number.parseInt(e.target.value) || 0;
                                    const oldPoints = question.points;
                                    updateQuestion(question.id, {
                                      points: newPoints,
                                    });
                                    // Update total points
                                    setCurrentTest((prev) => ({
                                      ...prev,
                                      totalPoints:
                                        prev.totalPoints -
                                        oldPoints +
                                        newPoints,
                                    }));
                                  }}
                                  min="1"
                                  max="50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                  value={question.difficulty || "Medium"}
                                  onValueChange={(
                                    value: "Easy" | "Medium" | "Hard"
                                  ) =>
                                    updateQuestion(question.id, {
                                      difficulty: value,
                                    })
                                  }>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Explanation */}
                            <div className="space-y-2">
                              <Label>Explanation (Optional)</Label>
                              <Textarea
                                value={question.explanation || ""}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    explanation: e.target.value,
                                  })
                                }
                                placeholder="Explain the correct answer"
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditTestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTest}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Test Modal */}
      <Dialog open={isPreviewTestOpen} onOpenChange={setIsPreviewTestOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview Test: {selectedTestForPreview?.title}
            </DialogTitle>
            <DialogDescription>
              Preview how students will see this test
            </DialogDescription>
          </DialogHeader>

          {selectedTestForPreview && (
            <div className="space-y-6">
              {/* Test Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedTestForPreview.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {selectedTestForPreview.description}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        {selectedTestForPreview.duration} minutes
                      </div>
                      <div>
                        {selectedTestForPreview.totalPoints} points total
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedTestForPreview.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {selectedTestForPreview.category}
                    </Badge>
                    <Badge
                      variant={
                        selectedTestForPreview.isPublished
                          ? "default"
                          : "secondary"
                      }>
                      {selectedTestForPreview.isPublished
                        ? "Published"
                        : "Draft"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Questions ({currentTest.questions.length})
                </h3>
                {currentTest.questions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No questions added to this test yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  currentTest.questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            Question {index + 1} ({question.points} points)
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {question.type.replace("-", " ")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{question.question}</p>

                        {question.type === "multiple-choice" &&
                          question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 border rounded ${
                                    optIndex === question.correctAnswer
                                      ? "border-green-500 bg-green-50"
                                      : "border-gray-200"
                                  }`}>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                    <span className="text-sm">{option}</span>
                                    {optIndex === question.correctAnswer && (
                                      <Badge
                                        variant="default"
                                        className="text-xs ml-auto">
                                        Correct Answer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        {question.type === "true-false" && (
                          <div className="space-y-2">
                            <div
                              className={`p-2 border rounded ${
                                question.correctAnswer === "true"
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}>
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                <span className="text-sm">True</span>
                                {question.correctAnswer === "true" && (
                                  <Badge
                                    variant="default"
                                    className="text-xs ml-auto">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div
                              className={`p-2 border rounded ${
                                question.correctAnswer === "false"
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}>
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                <span className="text-sm">False</span>
                                {question.correctAnswer === "false" && (
                                  <Badge
                                    variant="default"
                                    className="text-xs ml-auto">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {(question.type === "short-answer" ||
                          question.type === "essay") && (
                          <div className="space-y-2">
                            <div className="p-3 border rounded bg-gray-50">
                              <Label className="text-xs text-muted-foreground">
                                Answer Area
                              </Label>
                              <div className="mt-2 p-2 bg-white border rounded min-h-[60px]">
                                <span className="text-xs text-muted-foreground">
                                  Students will type their answer here...
                                </span>
                              </div>
                            </div>
                            {question.correctAnswer && (
                              <div className="p-2 border border-green-500 bg-green-50 rounded">
                                <Label className="text-xs font-medium text-green-700">
                                  Sample Answer:
                                </Label>
                                <p className="text-sm mt-1">
                                  {question.correctAnswer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {question.explanation && (
                          <div className="p-2 border border-blue-500 bg-blue-50 rounded">
                            <Label className="text-xs font-medium text-blue-700">
                              Explanation:
                            </Label>
                            <p className="text-sm mt-1">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Detail Modal */}
      <Dialog
        open={isAnalyticsDetailOpen}
        onOpenChange={setIsAnalyticsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Test Analytics: {selectedTestForAnalytics?.title}
            </DialogTitle>
            <DialogDescription>
              Detailed performance analytics for this test
            </DialogDescription>
          </DialogHeader>

          {selectedTestForAnalytics && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Attempts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 500) + 100}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 20) + 5}% from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 30) + 70}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 10) + 1}% from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pass Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 20) + 80}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 5) + 1}% from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 20) + 25}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                      -{Math.floor(Math.random() * 3) + 1}m from last week
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>
                    How students performed on this test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        range: "90-100%",
                        count: Math.floor(Math.random() * 50) + 20,
                        color: "bg-green-500",
                      },
                      {
                        range: "80-89%",
                        count: Math.floor(Math.random() * 40) + 30,
                        color: "bg-blue-500",
                      },
                      {
                        range: "70-79%",
                        count: Math.floor(Math.random() * 30) + 25,
                        color: "bg-yellow-500",
                      },
                      {
                        range: "60-69%",
                        count: Math.floor(Math.random() * 20) + 15,
                        color: "bg-orange-500",
                      },
                      {
                        range: "Below 60%",
                        count: Math.floor(Math.random() * 15) + 5,
                        color: "bg-red-500",
                      },
                    ].map((item) => (
                      <div key={item.range} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">
                          {item.range}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className={`${item.color} h-6 rounded-full flex items-center justify-end pr-2`}
                            style={{width: `${(item.count / 100) * 100}%`}}>
                            <span className="text-white text-xs font-medium">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Question Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Question Analysis</CardTitle>
                  <CardDescription>
                    Performance breakdown by question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentTest.questions
                      .slice(0, 5)
                      .map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Question {index + 1}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {question.question || "Untitled question"}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium">
                                {Math.floor(Math.random() * 30) + 70}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Correct
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">
                                {Math.floor(Math.random() * 10) + 15}s
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Avg Time
                              </div>
                            </div>
                            <Badge
                              variant={
                                Math.random() > 0.7
                                  ? "destructive"
                                  : Math.random() > 0.4
                                  ? "secondary"
                                  : "default"
                              }>
                              {Math.random() > 0.7
                                ? "Hard"
                                : Math.random() > 0.4
                                ? "Medium"
                                : "Easy"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Attempts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attempts</CardTitle>
                  <CardDescription>Latest test submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({length: 5}).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {String.fromCharCode(
                                65 + Math.floor(Math.random() * 26)
                              )}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              Student {Math.floor(Math.random() * 1000) + 1}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 24) + 1} hours ago
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              {Math.floor(Math.random() * 40) + 60}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 20) + 20}m
                            </div>
                          </div>
                          <Badge
                            variant={
                              Math.random() > 0.3 ? "default" : "secondary"
                            }>
                            {Math.random() > 0.3 ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
