"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRef } from "react";
import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  UserPlus,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Relationship = "Father" | "Mother" | "Uncle" | "Aunty" | "";
type InvoiceStatus = "open" | "paid" | "void" | "uncollectible" | "active";

export default function ChildAccountManager() {
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Parent profile id (needed by create_account_view for student)
  // We will try to infer it from children response if present.
  const [parentProfileId, setParentProfileId] = useState<number | null>(null);

  // Reset password dialog states
  const [resetChildId, setResetChildId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ✅ Inline Add Child states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addFullName, setAddFullName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addRelationship, setAddRelationship] = useState<Relationship>("");

  const [showAddPass, setShowAddPass] = useState(false);
  const [showAddConfirmPass, setShowAddConfirmPass] = useState(false);

  // ✅ OTP step (for verify_email_view)
  const [otp, setOtp] = useState("");
  const [otpStepActive, setOtpStepActive] = useState(false); // show OTP inputs after create
  const [otpVerified, setOtpVerified] = useState(false);

  // track the email used for OTP verification (locked after create)
  const [createdEmail, setCreatedEmail] = useState<string>("");

  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [addDob, setAddDob] = useState<Date | undefined>(undefined);




  const addErrorRef = useRef<HTMLDivElement | null>(null);
  const [errorPulse, setErrorPulse] = useState(false);

  const API = useMemo(
    () => ({
      listChildren: "/api/parent/managechildren/children",
      resetPassword: "/api/parent/managechildren/reset-child-password",

      // your Next route.ts paths
      createAccount: "/api/accounts/create",
      resendEmail: "/api/auth/resend-email",
      verifyEmail: "/api/auth/verify-email-auth",
    }),
    []
  );

  const fetchChildren = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API.listChildren, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      const list = data.children || data || [];
      setChildren(list);

      // ✅ pick parent_profile_id from API response (top-level or first child)
      const pid =
        data.parent_profile_id ??
        data.parentProfileId ??
        list?.[0]?.parent_profile_id ??
        list?.[0]?.parentProfileId ??
        null;

      if (pid) setParentProfileId(Number(pid));

    } catch (err: any) {
      //console.error("API fetch error:", err);
      setError(err.message || "Failed to load children data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    alert("Email copied to clipboard!");
  };

  // ------------------------
  // Reset Password handlers
  // ------------------------
  const openResetDialog = (childId: number) => {
    setResetChildId(childId);
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
    setResetError(null);
    setResetSuccess(null);
    setIsUpdatingPassword(false);
  };

  const closeResetDialog = () => {
    if (isUpdatingPassword) return;
    setResetChildId(null);
  };

  const submitPasswordReset = async () => {
    if (isUpdatingPassword) return;
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

    setIsUpdatingPassword(true);

    try {
      const res = await fetch(API.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: resetChildId, newPassword }),
      });

      const data = await res.json();


      setResetSuccess(data.detail || "Password updated successfully.");
      setTimeout(() => {
        setIsUpdatingPassword(false);
        closeResetDialog();
      }, 1500);
    } catch (err: any) {
      setResetError(err.message || "An error occurred while resetting the password");
      setIsUpdatingPassword(false);
    }
  };

  // ------------------------
  // Add Child (INLINE) helpers
  // ------------------------
  const resetAddForm = () => {
    setAddFullName("");
    setAddEmail("");
    setAddPassword("");
    setAddConfirmPassword("");
    setAddRelationship("");
    setShowAddPass(false);
    setShowAddConfirmPass(false);

    setOtp("");
    setOtpVerified(false);
    setOtpStepActive(false);
    setCreatedEmail("");

    setAddError(null);
    setAddSuccess(null);

    setIsCreatingChild(false);
    setIsVerifyingOtp(false);
    setIsResendingOtp(false);
  };

  const toggleAddChild = () => {
    setIsAddOpen((prev) => {
      const next = !prev;
      if (next) resetAddForm();
      return next;
    });
  };

  const splitFullName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { first_name: "", last_name: "" };
    if (parts.length === 1) return { first_name: parts[0], last_name: "" };
    return {
      first_name: parts[0],
      last_name: parts.slice(1).join(" "),
    };
  };

  const validateAddFormBasics = () => {
    if (!addFullName.trim()) return "Full name is required.";
    if (!addEmail.trim()) return "Email is required.";
    if (!addPassword || !addConfirmPassword)
      return "Password and confirm password are required.";
    if (addPassword !== addConfirmPassword) return "Passwords do not match.";
    if (addPassword.length < 8) return "Password must be at least 8 characters.";
    if (!addRelationship) return "Please select a relationship.";
    if (!addDob) return "Date of birth is required.";

    // IMPORTANT: create_account_view requires parent_profile_id for students
    if (!parentProfileId) {
      return "Parent profile not found. Please refresh or contact support.";
    }

    return null;
  };

  const dobStr = addDob ? format(addDob, "yyyy-MM-dd") : null;


  // ✅ Step 1: Create child (account_type=student) -> backend sends OTP automatically
  const createChildAccount = async () => {
    if (isCreatingChild) return;
    setAddError(null);
    setAddSuccess(null);

    const basicError = validateAddFormBasics();
    if (basicError) {
      setAddError(basicError);
      return;
    }

    setIsCreatingChild(true);

    try {
      const nameParts = splitFullName(addFullName);

      const res = await fetch(API.createAccount, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_type: "student",
          email: addEmail.trim().toLowerCase(),
          password: addPassword,

          // name mapping
          first_name: nameParts.first_name,
          last_name: nameParts.last_name,

          // required for student creation
          parent_profile_id: parentProfileId,
          relationship: addRelationship,
          dob: dobStr,

          // optional: you can omit if not used
          admission_no: "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create child account");

      // OTP is sent by backend
      setCreatedEmail(data.email || addEmail.trim().toLowerCase());
      setOtpStepActive(true);
      setOtpVerified(false);

      setAddSuccess(
        data.existing_inactive
          ? (data.detail || "Account already exists. OTP resent. Please verify.")
          : "Account created. OTP has been sent to the child’s email."
      );
    } catch (err: any) {
      const msg = err?.message || "Failed to create child. Please try again.";
      setAddError(msg);

      // ✅ make it noticeable
      setErrorPulse(false);
      requestAnimationFrame(() => setErrorPulse(true));

      // ✅ scroll into view
      setTimeout(() => addErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);

    } finally {
      setIsCreatingChild(false);
    }
  };

  // ✅ Step 2: Verify OTP
  const verifyChildEmailOtp = async () => {
    if (isVerifyingOtp) return;
    setAddError(null);
    setAddSuccess(null);

    if (!otpStepActive || !createdEmail) {
      setAddError("Please create the account first so an OTP can be sent.");
      setErrorPulse(false);
      requestAnimationFrame(() => setErrorPulse(true));

      // ✅ scroll into view
      setTimeout(() => addErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    if (!otp.trim() || otp.trim().length < 4) {
      setAddError("Enter the OTP sent to the email.");
      setErrorPulse(false);
      requestAnimationFrame(() => setErrorPulse(true));

      // ✅ scroll into view
      setTimeout(() => addErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const res = await fetch(API.verifyEmail, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createdEmail,
          code: otp.trim(), // your DRF accepts code or otp
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "OTP verification failed");

      setOtpVerified(true);
      setAddSuccess("Email verified successfully. Child account is now active.");

      // refresh list so the new child appears as active / shows in children list
      await fetchChildren();

      // optionally auto close after verify
      setTimeout(() => {
        setIsAddOpen(false);
      }, 1200);
    } catch (err: any) {
      setOtpVerified(false);
      setAddError(err.message || "Invalid or expired OTP. Please try again.");
      setErrorPulse(false);
      requestAnimationFrame(() => setErrorPulse(true));

      // ✅ scroll into view
      setTimeout(() => addErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ✅ Optional: Resend OTP
  const resendOtp = async () => {
    if (isResendingOtp) return;
    setAddError(null);
    setAddSuccess(null);

    const emailToUse = createdEmail || addEmail.trim().toLowerCase();
    if (!emailToUse) {
      setAddError("Email is required to resend OTP.");
      setErrorPulse(false);
      requestAnimationFrame(() => setErrorPulse(true));

      // ✅ scroll into view
      setTimeout(() => addErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }

    setIsResendingOtp(true);
    try {
      const res = await fetch(API.resendEmail, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await res.json();

      // Your backend sometimes returns 200 generic, or 429 cooldown.
      if (!res.ok) {
        // If cooldown, show the server message
        throw new Error(data.detail || "Failed to resend OTP");
      }

      setAddSuccess(data.detail || "If this email exists, a new code has been sent.");
    } catch (err: any) {
      setAddError(err.message || "Could not resend OTP. Please try again.");
      setErrorPulse(false);
      requestAnimationFrame(() => setErrorPulse(true));

      // ✅ scroll into view
      setTimeout(() => addErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } finally {
      setIsResendingOtp(false);
    }
  };

  const addBusy = isCreatingChild || isVerifyingOtp || isResendingOtp;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Children Accounts</h1>
          <p className="text-muted-foreground">
            View child account details, reset passwords, and add new child accounts securely.
          </p>
        </div>

        {/* ✅ Inline Add Child toggle */}
        <Button onClick={toggleAddChild} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          {isAddOpen ? "Close" : "Add Child"}
        </Button>
      </div>

      {/* ✅ Inline Add Child Form (functional) */}
      {isAddOpen && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Child Account
            </CardTitle>
            <CardDescription>
              Step 1: Create account (OTP is sent) • Step 2: Verify OTP
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Parent profile helper */}
            {!parentProfileId && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                Parent profile ID not detected yet. If account creation fails, ensure your
                children endpoint returns <b>parent_profile_id</b> or your Next route injects it.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="child-fullname">Full Name</Label>
                <Input
                  id="child-fullname"
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={addBusy || otpStepActive} // lock once created
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="child-email">Email</Label>
                <Input
                  id="child-email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="e.g. child@example.com"
                  disabled={addBusy || otpStepActive} // lock once created
                />
                <p className="text-xs text-muted-foreground">
                  OTP will be sent to this email when you create the account.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Date of Birth</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={addBusy || otpStepActive}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {addDob ? format(addDob, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={addDob}
                      onSelect={setAddDob}
                      captionLayout="dropdown"  // ✅ year/month dropdown (best UX)

                      disabled={(date) => date > new Date()} // no future DOB
                      startMonth={new Date(1990, 0)}
                      endMonth={new Date(new Date().getFullYear(), 11)}
                      autoFocus

                    />
                  </PopoverContent>
                </Popover>

                <p className="text-xs text-muted-foreground">DOB is required.</p>
              </div>


              <div className="space-y-2 sm:col-span-2">
                <Label>Related</Label>
                <Select
                  value={addRelationship}
                  onValueChange={(v) => setAddRelationship(v as Relationship)}
                  disabled={addBusy || otpStepActive} // lock once created
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Uncle">Uncle</SelectItem>
                    <SelectItem value="Aunty">Aunty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="child-password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="child-password"
                    type={showAddPass ? "text" : "password"}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Create password"
                    disabled={addBusy || otpStepActive} // lock once created
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowAddPass((s) => !s)}
                    disabled={addBusy || otpStepActive}
                  >
                    {showAddPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="child-confirm-password">Confirm Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="child-confirm-password"
                    type={showAddConfirmPass ? "text" : "password"}
                    value={addConfirmPassword}
                    onChange={(e) => setAddConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    disabled={addBusy || otpStepActive}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowAddConfirmPass((s) => !s)}
                    disabled={addBusy || otpStepActive}
                  >
                    {showAddConfirmPass ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 1 Action */}
            {!otpStepActive && (
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button
                  onClick={createChildAccount}
                  disabled={isCreatingChild}
                  className="w-full sm:w-auto min-w-[220px]"
                >
                  {isCreatingChild ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Creating & Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Create Child & Send OTP
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* OTP section (Step 2) */}
            {otpStepActive && (
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Verify Email OTP
                  </CardTitle>
                  <CardDescription className="text-xs">
                    OTP was sent to: <span className="font-medium">{createdEmail || addEmail}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP code"
                      disabled={isVerifyingOtp || otpVerified}
                      className="flex-1"
                    />

                    <Button
                      onClick={verifyChildEmailOtp}
                      disabled={isVerifyingOtp || otpVerified}
                      className="w-full sm:w-[170px]"
                    >
                      {otpVerified ? (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Verified
                        </span>
                      ) : isVerifyingOtp ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
                    <p className="text-xs text-muted-foreground">
                      Didn’t get a code? You can resend (cooldown may apply).
                    </p>

                    <Button
                      variant="outline"
                      onClick={resendOtp}
                      disabled={isResendingOtp || otpVerified}
                      className="w-full sm:w-auto"
                    >
                      {isResendingOtp ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          Resending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Resend OTP
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Messages */}
            {addError && (
              <div
                ref={addErrorRef}
                role="alert"
                aria-live="assertive"
                className={[
                  "rounded-lg border border-red-300 bg-red-50 p-4",
                  "text-red-900 shadow-sm",
                  errorPulse ? "animate-[shake_0.35s_ease-in-out]" : "",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <TriangleAlert className="h-5 w-5 text-red-700" />
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-red-900">Action failed</div>
                    <div className="mt-1 text-sm leading-relaxed">{addError}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setAddError(null)}
                        className="h-8"
                      >
                        Dismiss
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // optional: retry create or resend based on context
                          if (!otpStepActive) createChildAccount();
                          else resendOtp();
                        }}
                        className="h-8 border-red-300 text-red-900 hover:bg-red-100"
                        disabled={addBusy}
                      >
                        {otpStepActive ? "Resend OTP" : "Retry"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {addSuccess && <p className="text-sm text-green-700">{addSuccess}</p>}

            {/* Cancel */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  if (addBusy) return;
                  setIsAddOpen(false);
                }}
                disabled={addBusy}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <Spinner className="h-10 w-10 text-[#EF7B55]" />
        </div>
      )}

      {/* Error block */}
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

      {/* Children list */}
      <div className="grid gap-6">
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                    <AvatarImage src={child.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-base sm:text-lg">
                      {child.name?.split(" ").map((n: string) => n[0]).join("") || "N/A"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl truncate">
                      {child.name || "Unknown"}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm space-y-1 mt-1">
                      {/* Allow text to wrap nicely up to 2 lines */}
                      <div className="text-sm text-muted-foreground line-clamp-2 break-words leading-snug">
                        <span className="font-medium text-foreground">
                          Age {child.age || "N/A"}
                        </span>{" "}
                        • {child.grade || "N/A"} • {child.school || "N/A"}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {getStatusBadge(child.status)}
                        {getSubscriptionBadge(child.subscription)}
                      </div>
                    </CardDescription>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openResetDialog(child.id)}
                  className="w-full sm:w-auto"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Account Information
                  </h4>

                  <div className="grid gap-y-3 text-sm mt-3">
                    {[
                      { label: "Email", value: child.email, isEmail: true },
                      {
                        label: "Join Date",
                        value: child.joinDate || child.join_date,
                      },
                      {
                        label: "Last Active",
                        value: child.lastActive || child.last_active,
                      },
                      {
                        label: "Courses",
                        value: `${
                          child.completedCourses || child.completed_courses || 0
                        }/${
                          child.totalCourses || child.total_courses || 0
                        } completed`,
                      },
                      { label: "Relationship", value: child.relationship },
                      {
                        label: "Admission No",
                        value: child.admissionNo || child.admission_no,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-start gap-2"
                      >
                        <span className="text-muted-foreground font-medium text-xs uppercase tracking-wide pt-0.5">
                          {item.label}:
                        </span>
                        <span
                          className={`font-medium ${
                            item.isEmail ? "break-all" : "break-words"
                          }`}
                        >
                          {item.value || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Account Email
                  </h4>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={child.email || "N/A"}
                      readOnly
                      className="font-mono text-xs sm:text-sm flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyEmail(child.email || "")}
                      disabled={!child.email}
                      className="w-full sm:w-auto"
                    >
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

      {/* Reset Password Dialog (kept as-is) */}
      <Dialog
        open={resetChildId !== null}
        onOpenChange={(open) => (!open ? closeResetDialog() : null)}
      >
        <DialogContent className="w-[95vw] max-w-[480px] rounded-xl">
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
                  disabled={isUpdatingPassword}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  disabled={isUpdatingPassword}
                >
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
                  disabled={isUpdatingPassword}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  disabled={isUpdatingPassword}
                >
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
            <Button
              variant="outline"
              onClick={closeResetDialog}
              disabled={isUpdatingPassword}
            >
              Cancel
            </Button>

            <Button
              onClick={submitPasswordReset}
              disabled={!!resetSuccess || isUpdatingPassword}
              className="min-w-[150px]"
            >
              {isUpdatingPassword ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
