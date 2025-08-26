"use client";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  Settings,
  Baby,
  Shield,
  Key,
} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "student" | "teacher" | "admin" | "parent" | null
  >(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleRoleSelection = (
    role: "student" | "teacher" | "admin" | "parent"
  ) => {
    setSelectedRole(role);
    setIsAuthDialogOpen(true);
  };

  const handleAuth = () => {
    if (selectedRole) {
      router.push(`/${selectedRole}`);
      setIsAuthDialogOpen(false);
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case "admin":
        return [
          "Full system access",
          "School management",
          "User administration",
          "Analytics & reporting",
          "Subscription control",
          "Content moderation",
        ];
      case "teacher":
        return [
          "Content creation",
          "Student management",
          "Assessment tools",
          "Live sessions",
          "Progress tracking",
          "Resource library",
        ];
      case "student":
        return [
          "Course access",
          "Interactive learning",
          "Assessment taking",
          "Progress tracking",
          "Gamification",
          "Offline content",
        ];
      case "parent":
        return [
          "Child monitoring",
          "Progress tracking",
          "Payment management",
          "Parental controls",
          "Tutoring booking",
          "Account linking",
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            TECHXAGON E-Learning Platform
          </h1>
          <p className="text-xl text-gray-600">
            Secure role-based access for comprehensive education management
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>
              NDPR Compliant • Role-Based Security • Parent-Child Linking
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-red-200"
            onClick={() => handleRoleSelection("admin")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <Settings className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Admin Portal</CardTitle>
              <CardDescription className="text-sm">
                System administration with full platform control
              </CardDescription>
              <Badge
                variant="outline"
                className="w-fit mx-auto text-red-600 border-red-200">
                Highest Access
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Multi-school management</li>
                <li>• User role administration</li>
                <li>• System analytics & reports</li>
                <li>• Subscription & billing control</li>
                <li>• Content moderation</li>
                <li>• Security & compliance</li>
              </ul>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                <Key className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-green-200"
            onClick={() => handleRoleSelection("teacher")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Teacher Portal</CardTitle>
              <CardDescription className="text-sm">
                Content creation and student management tools
              </CardDescription>
              <Badge
                variant="outline"
                className="w-fit mx-auto text-green-600 border-green-200">
                Content Creator
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Create CBT tests & quizzes</li>
                <li>• Upload learning materials</li>
                <li>• Live session management</li>
                <li>• Student progress analytics</li>
                <li>• Content library access</li>
                <li>• Assessment grading</li>
              </ul>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                <Key className="h-4 w-4 mr-2" />
                Teacher Access
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-blue-200"
            onClick={() => handleRoleSelection("student")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Student Portal</CardTitle>
              <CardDescription className="text-sm">
                Interactive learning with progress tracking
              </CardDescription>
              <Badge
                variant="outline"
                className="w-fit mx-auto text-blue-600 border-blue-200">
                Learner Access
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Interactive course content</li>
                <li>• Secure CBT test taking</li>
                <li>• Progress & achievement tracking</li>
                <li>• Gamification & rewards</li>
                <li>• Offline content access</li>
                <li>• Peer collaboration</li>
              </ul>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                <Key className="h-4 w-4 mr-2" />
                Student Access
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-purple-200"
            onClick={() => handleRoleSelection("parent")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Baby className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Parent Portal</CardTitle>
              <CardDescription className="text-sm">
                Child monitoring with secure account linking
              </CardDescription>
              <Badge
                variant="outline"
                className="w-fit mx-auto text-purple-600 border-purple-200">
                Guardian Access
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Child progress monitoring</li>
                <li>• Secure account linking</li>
                <li>• Payment & subscription management</li>
                <li>• Parental controls & limits</li>
                <li>• Tutoring session booking</li>
                <li>• Rewards & achievement tracking</li>
              </ul>
              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                <Key className="h-4 w-4 mr-2" />
                Parent Access
              </Button>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {authMode === "login" ? "Sign In" : "Create Account"} -{" "}
                {selectedRole?.charAt(0).toUpperCase() + selectedRole?.slice(1)}{" "}
                Portal
              </DialogTitle>
              <DialogDescription>
                {authMode === "login"
                  ? "Enter your credentials to access your account"
                  : "Create a new account with role-based permissions"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedRole && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Access Permissions:</h4>
                  <ul className="text-sm space-y-1">
                    {getRolePermissions(selectedRole).map(
                      (permission, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {permission}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={`${selectedRole}@techxagon.edu.ng`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                  />
                </div>

                {authMode === "signup" && selectedRole === "parent" && (
                  <div className="space-y-2">
                    <Label htmlFor="child-link-code">
                      Child Link Code (Optional)
                    </Label>
                    <Input
                      id="child-link-code"
                      placeholder="TECH-XX-2024-XXX"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your child's link code to connect their existing
                      account
                    </p>
                  </div>
                )}

                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleAuth} className="w-full">
                  {authMode === "login" ? "Sign In" : "Create Account"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() =>
                    setAuthMode(authMode === "login" ? "signup" : "login")
                  }
                  className="w-full">
                  {authMode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
              </div>

              {selectedRole === "parent" && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Parent Account Features:
                  </p>
                  <p className="text-blue-700">
                    • Link multiple children with unique codes
                    <br />• No passwords needed for underage students
                    <br />• Full parental control and monitoring
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-center space-y-4">
          <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>End-to-End Encryption</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4 text-blue-600" />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Baby className="h-4 w-4 text-purple-600" />
              <span>Secure Parent-Child Linking</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            TECHXAGON complies with Nigeria Data Protection Regulation (NDPR)
            and implements enterprise-grade security for all user data and
            educational content.
          </p>
        </div>
      </div>
    </div>
  );
}
