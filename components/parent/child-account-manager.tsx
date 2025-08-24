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
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Key} from "lucide-react";
import {
  Plus,
  Shield,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Link,
} from "lucide-react";

export function ChildAccountManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showLinkCode, setShowLinkCode] = useState<number | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkCode, setLinkCode] = useState("");

  const children = [
    {
      id: 1,
      name: "John Adebayo",
      age: 17,
      grade: "SS3",
      school: "Lagos State Model College",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "john.adebayo@student.lsmc.edu.ng",
      status: "Active",
      subscription: "Premium",
      parentalControls: {
        screenTime: 4,
        contentFilter: "Moderate",
        allowPrivateTutoring: true,
        allowEcommerce: false,
        studyReminders: true,
        examAccess: true,
        offlineDownloads: true,
      },
      linkCode: "TECH-JA-2024-001",
      lastActive: "2 hours ago",
      joinDate: "2023-09-01",
      totalCourses: 8,
      completedCourses: 6,
      permissions: {
        canTakeExams: true,
        canAccessPremiumContent: true,
        canDownloadOffline: true,
        canJoinLiveSessions: true,
        canAccessEcommerce: false,
        maxScreenTime: 4,
      },
    },
    {
      id: 2,
      name: "Mary Adebayo",
      age: 15,
      grade: "SS1",
      school: "Lagos State Model College",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "mary.adebayo@student.lsmc.edu.ng",
      status: "Active",
      subscription: "Premium",
      parentalControls: {
        screenTime: 3,
        contentFilter: "Strict",
        allowPrivateTutoring: true,
        allowEcommerce: false,
        studyReminders: true,
        examAccess: true,
        offlineDownloads: false,
      },
      linkCode: "TECH-MA-2024-002",
      lastActive: "1 hour ago",
      joinDate: "2023-09-01",
      totalCourses: 6,
      completedCourses: 4,
      permissions: {
        canTakeExams: true,
        canAccessPremiumContent: true,
        canDownloadOffline: false,
        canJoinLiveSessions: true,
        canAccessEcommerce: false,
        maxScreenTime: 3,
      },
    },
  ];

  const handleLinkExistingAccount = () => {
    console.log("Linking account with code:", linkCode);
    setIsLinkDialogOpen(false);
    setLinkCode("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    return subscription === "Premium" ? (
      <Badge className="bg-gold-100 text-gold-800">Premium</Badge>
    ) : (
      <Badge variant="secondary">Basic</Badge>
    );
  };

  const copyLinkCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Children Accounts</h1>
          <p className="text-muted-foreground">
            Create and manage your children's learning accounts with secure
            parent-child linking
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex w-full sm:w-auto items-center gap-2 bg-transparent">
                <Link className="h-4 w-4" />
                Link Existing Account
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg w-full sm:rounded-xl p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Link Existing Child Account</DialogTitle>
                <DialogDescription>
                  Connect your child's existing TECHXAGON account to your parent
                  dashboard
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Input Section */}
                <div className="space-y-2">
                  <Label htmlFor="link-code">Child's Account Link Code</Label>
                  <Input
                    id="link-code"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value)}
                    placeholder="TECH-XX-2024-XXX"
                  />
                  <p className="text-sm text-muted-foreground">
                    Ask your child for their unique link code from their account
                    settings
                  </p>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    What happens when you link:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• All existing progress and data is preserved</li>
                    <li>• You gain parental control and monitoring access</li>
                    <li>• Child retains their login credentials</li>
                    <li>• Account settings can be managed from here</li>
                  </ul>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={handleLinkExistingAccount}
                  disabled={!linkCode.trim()}>
                  Link Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex w-full sm:w-auto items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Child Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Child Account</DialogTitle>
                <DialogDescription>
                  Create a new learning account for your child with
                  comprehensive parental controls
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-name">Child's Full Name</Label>
                    <Input id="child-name" placeholder="Enter child's name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-age">Age</Label>
                    <Input id="child-age" type="number" placeholder="Age" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-grade">Grade/Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="js1">JS1</SelectItem>
                        <SelectItem value="js2">JS2</SelectItem>
                        <SelectItem value="js3">JS3</SelectItem>
                        <SelectItem value="ss1">SS1</SelectItem>
                        <SelectItem value="ss2">SS2</SelectItem>
                        <SelectItem value="ss3">SS3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="child-school">School</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lsmc">
                          Lagos State Model College
                        </SelectItem>
                        <SelectItem value="fgc">
                          Federal Government College
                        </SelectItem>
                        <SelectItem value="greenfield">
                          Greenfield Academy
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child-interests">
                    Learning Interests (Optional)
                  </Label>
                  <Textarea
                    id="child-interests"
                    placeholder="e.g., Mathematics, Science, Programming..."
                  />
                </div>
                <div className="space-y-4">
                  <Label>Parental Controls & Permissions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="screen-time">
                        Daily Screen Time (hours)
                      </Label>
                      <Input id="screen-time" type="number" placeholder="4" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content-filter">Content Filter</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select filter level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">Strict</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-tutoring">
                        Allow Private Tutoring
                      </Label>
                      <Switch id="allow-tutoring" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-ecommerce">
                        Allow E-commerce Purchases
                      </Label>
                      <Switch id="allow-ecommerce" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="exam-access">Allow Semester Exams</Label>
                      <Switch id="exam-access" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="offline-downloads">
                        Allow Offline Downloads
                      </Label>
                      <Switch id="offline-downloads" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="study-reminders">
                        Send Study Reminders
                      </Label>
                      <Switch id="study-reminders" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Create Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {child.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div>
                        Age {child.age} • {child.grade} • {child.school}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(child.status)}
                        {getSubscriptionBadge(child.subscription)}
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Account Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{child.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Join Date:</span>
                      <span>{child.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Active:
                      </span>
                      <span>{child.lastActive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Courses:</span>
                      <span>
                        {child.completedCourses}/{child.totalCourses} completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Parental Controls
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Screen Time:
                      </span>
                      <span>{child.parentalControls.screenTime}h/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Content Filter:
                      </span>
                      <Badge variant="outline">
                        {child.parentalControls.contentFilter}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Exam Access:
                      </span>
                      <Badge
                        variant={
                          child.parentalControls.examAccess
                            ? "default"
                            : "secondary"
                        }>
                        {child.parentalControls.examAccess
                          ? "Allowed"
                          : "Blocked"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Offline Downloads:
                      </span>
                      <Badge
                        variant={
                          child.parentalControls.offlineDownloads
                            ? "default"
                            : "secondary"
                        }>
                        {child.parentalControls.offlineDownloads
                          ? "Allowed"
                          : "Blocked"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Key className="h-4 w-4" />
                  Account Permissions
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        child.permissions.canTakeExams
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span>Semester Exams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        child.permissions.canAccessPremiumContent
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span>Premium Content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        child.permissions.canDownloadOffline
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span>Offline Downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        child.permissions.canJoinLiveSessions
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span>Live Sessions</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Account Link Code
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowLinkCode(
                        showLinkCode === child.id ? null : child.id
                      )
                    }>
                    {showLinkCode === child.id ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={
                      showLinkCode === child.id
                        ? child.linkCode
                        : "••••••••••••••••"
                    }
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLinkCode(child.linkCode)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Use this code to link your child's account to your parent
                  dashboard. Keep it secure and don't share with others.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Secure Parent-Child Account Linking</CardTitle>
          <CardDescription>
            NDPR-compliant account management with comprehensive parental
            controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">For New Accounts:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click "Add Child Account" to create a new account</li>
                <li>
                  Fill in your child's information and set parental controls
                </li>
                <li>A unique link code will be generated automatically</li>
                <li>Your child can use this code to access their account</li>
                <li>No separate password needed for underage students</li>
              </ol>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">For Existing Accounts:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click "Link Existing Account" button</li>
                <li>Ask your child for their account link code</li>
                <li>Enter the code to establish secure connection</li>
                <li>All progress and data will be preserved</li>
                <li>Gain full parental control and monitoring access</li>
              </ol>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              Security Features:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• End-to-end encrypted account linking</li>
              <li>• NDPR compliant data protection</li>
              <li>• Role-based access control</li>
              <li>• Secure unique link codes</li>
              <li>• Comprehensive audit logging</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
