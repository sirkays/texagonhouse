"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Key, BookOpen, AlertCircle, CheckCircle, Copy, Eye, EyeOff, Link } from "lucide-react";

export function ChildAccountManager() {
  // Password reset dialog state
  const [resetChildId, setResetChildId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

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
      lastActive: "2 hours ago",
      joinDate: "2023-09-01",
      totalCourses: 8,
      completedCourses: 6,
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
      lastActive: "1 hour ago",
      joinDate: "2023-09-01",
      totalCourses: 6,
      completedCourses: 4,
    },
  ];

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

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
  };

  const openResetDialog = (childId: number) => {
    setResetChildId(childId);
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
    setResetError(null);
    setResetSuccess(null);
  };

  const closeResetDialog = () => {
    setResetChildId(null);
  };

  const submitPasswordReset = () => {
    setResetError(null);
    setResetSuccess(null);

    if (!newPassword || !confirmPassword) {
      setResetError("Please enter and confirm the new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }

    // Replace with your API call: POST /parent/reset-child-password { childId, newPassword }
    console.log("Resetting password for child:", resetChildId, "to:", newPassword);

    setResetSuccess("Password updated successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Header only (buttons removed) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Children Accounts</h1>
          <p className="text-muted-foreground">
            View child account details and reset passwords securely.
          </p>
        </div>
      </div>

      {/* Children list */}
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

                {/* Reset password button */}
                <Button variant="outline" size="sm" onClick={() => openResetDialog(child.id)}>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
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
                      <span className="truncate max-w-[60%] text-right">{child.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Join Date:</span>
                      <span>{child.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Active:</span>
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

                {/* Account Email display */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Account Email
                  </h4>
                  <div className="flex items-center gap-2">
                    <Input value={child.email} readOnly className="font-mono" />
                    <Button variant="outline" size="sm" onClick={() => copyEmail(child.email)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is the child's login email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetChildId !== null} onOpenChange={(open) => (!open ? closeResetDialog() : null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Reset Child Password</DialogTitle>
            <DialogDescription>Enter a new password for this child account.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button variant="outline" type="button" onClick={() => setShowNew((s) => !s)}>
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="flex gap-2">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
                <Button variant="outline" type="button" onClick={() => setShowConfirm((s) => !s)}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {resetError && <p className="text-sm text-red-600">{resetError}</p>}
            {resetSuccess && <p className="text-sm text-green-700">{resetSuccess}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeResetDialog}>
              Cancel
            </Button>
            <Button onClick={submitPasswordReset}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
