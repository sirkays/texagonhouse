"use client";

import {useState, useEffect} from "react";
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
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {
  Key,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Link,
  RefreshCw,
} from "lucide-react";

export default function ChildAccountManager() {
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetChildId, setResetChildId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const fetchChildren = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parent/managechildren/children", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch children data");
      }

      setChildren(data.children || data || []); // Handle both { children: [...] } and [...] responses
      setError(null);
    } catch (err: any) {
      console.error("API fetch error:", err);
      setError(
        err.message || "Failed to load children data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    return subscription?.toLowerCase() === "premium" ? (
      <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
    ) : (
      <Badge variant="secondary">Basic</Badge>
    );
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    alert("Email copied to clipboard!"); // Replace with toast in production
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

  const submitPasswordReset = async () => {
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

    try {
      const res = await fetch(
        "/api/parent/managechildren/reset-child-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({childId: resetChildId, newPassword}),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to reset password");
      }

      setResetSuccess(data.detail || "Password updated successfully.");
      setTimeout(closeResetDialog, 2000);
    } catch (err: any) {
      setResetError(
        err.message || "An error occurred while resetting the password"
      );
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Children Accounts</h1>
          <p className="text-muted-foreground">
            View child account details and reset passwords securely.
          </p>
        </div>
      </div>

      {isLoading && <p className="text-center">Loading children data...</p>}
      {error && (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          {error.includes("Unauthorized") && (
            <p className="text-red-600">
              Please ensure you are logged in with a parent account or contact
              support.
            </p>
          )}
          <Button variant="outline" className="mt-2" onClick={fetchChildren}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
      {!isLoading && children.length === 0 && !error && (
        <p className="text-center">No children accounts found.</p>
      )}

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
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "N/A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {child.name || "Unknown"}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>
                        Age {child.age || "N/A"} • {child.grade || "N/A"} •{" "}
                        {child.school || "N/A"}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(child.status)}
                        {getSubscriptionBadge(child.subscription)}
                      </div>
                    </CardDescription>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openResetDialog(child.id)}>
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
                      <span className="truncate max-w-[60%] text-right">
                        {child.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Join Date:</span>
                      <span>{child.joinDate || child.join_date || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Active:
                      </span>
                      <span>
                        {child.lastActive || child.last_active || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Courses:</span>
                      <span>
                        {child.completedCourses || child.completed_courses || 0}
                        /{child.totalCourses || child.total_courses || 0}{" "}
                        completed
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Relationship:
                      </span>
                      <span>{child.relationship || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Admission No:
                      </span>
                      <span>
                        {child.admissionNo || child.admission_no || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Account Email
                  </h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={child.email || "N/A"}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyEmail(child.email || "")}
                      disabled={!child.email}>
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

      <Dialog
        open={resetChildId !== null}
        onOpenChange={(open) => (!open ? closeResetDialog() : null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Reset Child Password</DialogTitle>
            <DialogDescription>
              Enter a new password for this child account.
            </DialogDescription>
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
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowNew((s) => !s)}>
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}>
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {resetError && <p className="text-sm text-red-600">{resetError}</p>}
            {resetSuccess && (
              <p className="text-sm text-green-700">{resetSuccess}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeResetDialog}>
              Cancel
            </Button>
            <Button onClick={submitPasswordReset} disabled={!!resetSuccess}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
