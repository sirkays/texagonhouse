//texagon_academy\texagonui\app\admin\verify-user\page.tsx
"use client";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  Search,
  User,
  GraduationCap,
  Users,
  UserCircle,
  CheckCircle2,
  Loader2,
  Edit,
  Trash2,
  Plus,
  X,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ProfileType = "student" | "teacher" | "parent" | "user";

interface Classroom {
  id: number;
  name: string;
}

interface Language {
  id: number;
  language_name?: string;
  name?: string;
}

interface Subject {
  id: number;
  name: string;
}

interface TeacherProfile {
  id: number;
  organization_id: number;
  bio: string | null;
  experience: number | null;
  languages: Language[];
  specialties: Subject[];
}

interface StudentProfile {
  id: number;
  organization_id: number;
  current_classroom_id: number | null;
  admission_no: string | null;
  dob: string | null;
  parent_links: any[];
}

interface ParentProfile {
  id: number;
  organization_id: number;
  address: string | null;
  children_links: any[];
}

interface FetchUserResponse {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: string | null;
  primary_org_id: number | null;
  is_active: boolean;
  is_staff: boolean;
  profile_type: ProfileType;
  teacher_profile?: TeacherProfile;
  student_profile?: StudentProfile;
  parent_profile?: ParentProfile;
  organization_name?: string; // Legacy/Mock support
}

// ========== MOCK MODE ==========
const MOCK_MODE = false;

const MOCK_CLASSROOMS: Classroom[] = [
  { id: 1, name: "JSS 1A" },
  { id: 2, name: "JSS 1B" },
  { id: 3, name: "JSS 2A" },
  { id: 4, name: "SSS 1A" },
  { id: 5, name: "SSS 2B" },
];

const MOCK_LANGUAGES: Language[] = [
  { id: 1, name: "python" },
  { id: 2, name: "java" },
  { id: 3, name: "Javascript" },
  { id: 4, name: "ruby" },
  { id: 5, name: "C++" },
];

const MOCK_SUBJECTS: Subject[] = [
  { id: 1, name: "web" },
  { id: 2, name: "Mobile development" },
  { id: 3, name: "Seo" },
];

export default function VerifyUserPage() {
  const { toast } = useToast();

  // Flow state
  const [step, setStep] = useState<"search" | "verified" | "updating">(
    "search"
  );
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<FetchUserResponse | null>(
    null
  );

  // Student fields
  const [admissionNo, setAdmissionNo] = useState("");
  const [dob, setDob] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Teacher fields
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Parent fields
  const [address, setAddress] = useState("");

  // Parent - Manage Children state
  const [showAddStudentSearch, setShowAddStudentSearch] = useState(false);
  const [studentSearchEmail, setStudentSearchEmail] = useState("");
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [foundStudentToAdd, setFoundStudentToAdd] = useState<any | null>(null);
  // Activation (based on primary_org_id)
  const [activateUser, setActivateUser] = useState(false);

  // best org to use if activating (fallbacks)
  const getActivatableOrgId = (u: FetchUserResponse | null) => {
    if (!u) return null;
    return (
      u.primary_org_id ??
      u.teacher_profile?.organization_id ??
      u.student_profile?.organization_id ??
      u.parent_profile?.organization_id ??
      null
    );
  };

  // Action Confirmation State
  const [actionConfirmation, setActionConfirmation] = useState<{
    isOpen: boolean;
    type: "add" | "remove" | "update_profile";
    student?: any;
  }>({ isOpen: false, type: "update_profile" });

  // Confirmation dialog state (Legacy - replaced by actionConfirmation but kept for compatibility if needed, though we'll use actionConfirmation for everything)
  // const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // We will reuse showConfirmDialog for the main profile update to keep changes minimal,
  // but we'll use actionConfirmation for the specific add/remove actions.
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch data when user is verified
  useEffect(() => {
    if (verifiedUser?.profile_type === "student") {
      // Pass the student's organization ID if available
      fetchClassrooms(verifiedUser.primary_org_id?.toString());
    }
    if (verifiedUser?.profile_type === "teacher") {
      fetchLanguages();
      fetchSubjects();
    }
  }, [verifiedUser]);

  const fetchClassrooms = async (orgId?: string) => {
    if (MOCK_MODE) {
      setClassrooms(MOCK_CLASSROOMS);
      return;
    }
    try {
      let url = "/api/admin/classrooms?page_size=1000";
      if (orgId) {
        url += `&org_id=${orgId}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      // Handle both plain list and paginated response
      const results = Array.isArray(data) ? data : data.results || [];

      if (results.length > 0) {
        setClassrooms(results);
      } else if (data.classrooms) {
        // Handle legacy format if still present
        setClassrooms(data.classrooms);
      }
    } catch (error) {
      console.error("Failed to fetch classrooms:", error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const res = await fetch("/api/admin/languages?page_size=1000");
      const data = await res.json();

      // Handle both plain list and paginated response
      const results = Array.isArray(data) ? data : data.results || [];

      if (Array.isArray(results)) {
        const apiLanguages = results.map((l: any) => ({
          id: l.id,
          name: l.language_name || l.name,
        }));

        setLanguages((prev) => {
          const newLangs = [...prev];
          apiLanguages.forEach((al: any) => {
            if (!newLangs.find((pl) => pl.id === al.id)) {
              newLangs.push(al);
            }
          });
          return newLangs;
        });
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
  };

  const fetchSubjects = async (orgId?: string) => {
    if (MOCK_MODE) {
      return;
    }
    try {
      let url = "/api/admin/subjects?page_size=1000";
      if (orgId) {
        url += `&org_id=${orgId}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      // Handle both plain list and paginated response
      const results = Array.isArray(data) ? data : data.results || [];

      if (Array.isArray(results)) {
        const apiSubjects = results.map((s: any) => ({ id: s.id, name: s.name }));

        setSubjects((prev) => {
          const newSubjects = [...prev];
          apiSubjects.forEach((as: any) => {
            if (!newSubjects.find((ps) => ps.id === as.id)) {
              newSubjects.push(as);
            }
          });
          return newSubjects;
        });
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const resetForm = () => {
    setStep("search");
    setEmail("");
    setVerifiedUser(null);
    setAdmissionNo("");
    setDob("");
    setClassroomId("");
    setBio("");
    setExperience("");
    setSelectedLanguages([]);
    setSelectedSubjects([]);
    setAddress("");
    setShowAddStudentSearch(false);
    setStudentSearchEmail("");
    setFoundStudentToAdd(null);
    setActionConfirmation({ isOpen: false, type: "update_profile" });
    setActivateUser(false);
  };

  // Step 1: Fetch user by email
  const handleFetchUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // MOCK MODE: Use fake data for testing
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Mock data simulation logic would go here if needed
    }

    try {
      const res = await fetch("/api/admin/fetch-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        handleApiError(res.status, data);
        return;
      }

      setVerifiedUser(data);
      setActivateUser(!!data.primary_org_id);
      setStep("verified");

      // Pre-populate form fields based on profile type
      if (data.profile_type === "student" && data.student_profile) {
        const p = data.student_profile;
        if (p.admission_no) setAdmissionNo(p.admission_no);
        if (p.dob) setDob(p.dob);
        if (p.current_classroom_id)
          setClassroomId(p.current_classroom_id.toString());
      } else if (data.profile_type === "teacher" && data.teacher_profile) {
        const p = data.teacher_profile;
        if (p.bio) setBio(p.bio);
        if (p.experience) setExperience(p.experience.toString());

        // Handle Languages
        if (p.languages && Array.isArray(p.languages)) {
          const userLangs = p.languages.map((l: any) => ({
            id: l.id,
            name: l.language_name || l.name,
          }));

          // Set selected IDs
          setSelectedLanguages(userLangs.map((l: any) => l.id));

          // Merge into available languages so they render correctly
          setLanguages((prev) => {
            const newLangs = [...prev];
            userLangs.forEach((ul: any) => {
              if (!newLangs.find((pl) => pl.id === ul.id)) {
                newLangs.push(ul);
              }
            });
            return newLangs;
          });
        }

        // Handle Specialties (Subjects)
        if (p.specialties && Array.isArray(p.specialties)) {
          const userSubjects = p.specialties.map((s: any) => ({
            id: s.id,
            name: s.name,
          }));

          // Set selected IDs
          setSelectedSubjects(userSubjects.map((s: any) => s.id));

          // Merge into available subjects so they render correctly
          setSubjects((prev) => {
            const newSubjects = [...prev];
            userSubjects.forEach((us: any) => {
              if (!newSubjects.find((ps) => ps.id === us.id)) {
                newSubjects.push(us);
              }
            });
            return newSubjects;
          });
        }
      } else if (data.profile_type === "parent" && data.parent_profile) {
        const p = data.parent_profile;
        if (p.address) setAddress(p.address);
      }

      toast({
        title: "User Found",
        description: `${data.email} is a ${data.profile_type}. You can now update their profile.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show confirmation dialog before updating
  const handleUpdateClick = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  // Step 2: Update user profile (called after confirmation)
  const handleConfirmUpdate = async () => {
    if (!verifiedUser) return;

    setShowConfirmDialog(false);
    setIsLoading(true);
    setStep("updating");

    try {
      // 1. Update Main Profile
      const payload: any = { email: verifiedUser.email };

      // Activation is based on primary_org_id
      const activatableOrgId = getActivatableOrgId(verifiedUser);
      payload.primary_org_id = activateUser ? activatableOrgId : null;

      const profile = buildProfilePayload(verifiedUser.profile_type);
      if (profile && Object.keys(profile).length > 0) {
        payload.profile = profile;
      }

      const res = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        handleApiError(res.status, data);
        setStep("verified");
        return;
      }

      // Re-fetch user to get updated data
      const fetchRes = await fetch("/api/admin/fetch-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedUser.email }),
      });

      if (fetchRes.ok) {
        const updatedUser = await fetchRes.json();
        setVerifiedUser(updatedUser);
      }

      toast({
        title: "✅ Update Successful",
        description: `Profile updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      setStep("verified");
    } finally {
      setIsLoading(false);
    }
  };

  const buildProfilePayload = (profileType: ProfileType) => {
    switch (profileType) {
      case "student":
        const studentProfile: any = {};
        if (admissionNo) studentProfile.admission_no = admissionNo;
        if (dob) studentProfile.dob = dob;
        if (classroomId)
          studentProfile.current_classroom_id = parseInt(classroomId);
        return studentProfile;

      case "teacher":
        const teacherProfile: any = {};
        if (bio) teacherProfile.bio = bio;
        if (experience) teacherProfile.experience = parseInt(experience);
        if (selectedLanguages.length > 0) {
          teacherProfile.language_ids = selectedLanguages;
        }
        if (selectedSubjects.length > 0) {
          teacherProfile.specialty_ids = selectedSubjects;
        }
        return teacherProfile;

      case "parent":
        const parentProfile: any = {};
        if (address) parentProfile.address = address;
        // Note: add_child_ids and remove_child_ids are now handled via separate API calls
        return parentProfile;

      default:
        return {};
    }
  };

  // Parent - Manage Children Helpers
  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentSearchEmail.trim()) return;

    setIsSearchingStudent(true);
    setFoundStudentToAdd(null);

    try {
      const res = await fetch("/api/admin/fetch-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentSearchEmail.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Student Not Found",
          description:
            data.detail || "Could not find a student with that email.",
          variant: "destructive",
        });
        return;
      }

      if (data.profile_type !== "student") {
        toast({
          title: "Invalid User Type",
          description: `The user found is a ${data.profile_type}, not a student.`,
          variant: "destructive",
        });
        return;
      }

      // Check if already linked
      const isAlreadyLinked =
        verifiedUser?.parent_profile?.children_links?.some(
          (link: any) => link.student_user?.id === data.id
        );

      if (isAlreadyLinked) {
        toast({
          title: "Already Linked",
          description: "This student is already linked to this parent.",
          variant: "destructive",
        });
        return;
      }

      setFoundStudentToAdd(data);
    } catch (error) {
      console.error("Search student error:", error);
      toast({
        title: "Error",
        description: "Failed to search for student.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingStudent(false);
    }
  };

  const handleAddClick = (student: any) => {
    setActionConfirmation({
      isOpen: true,
      type: "add",
      student: student,
    });
  };

  const handleRemoveClick = (student: any) => {
    setActionConfirmation({
      isOpen: true,
      type: "remove",
      student: student,
    });
  };

  const confirmAction = async () => {
    if (!verifiedUser || !actionConfirmation.student) return;

    const { type, student } = actionConfirmation;
    setActionConfirmation({ ...actionConfirmation, isOpen: false });
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/parent-child-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifiedUser.email,
          other_email: student.email,
          action: type === "add" ? "create" : "delete",
          relationship: "Parent",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Action Failed",
          description: data.detail || `Failed to ${type} student.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Student successfully ${type === "add" ? "added" : "removed"
          }.`,
      });

      // Refresh user data
      const fetchRes = await fetch("/api/admin/fetch-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedUser.email }),
      });

      if (fetchRes.ok) {
        const updatedUser = await fetchRes.json();
        setVerifiedUser(updatedUser);
        // Reset search state if adding
        if (type === "add") {
          setFoundStudentToAdd(null);
          setStudentSearchEmail("");
          setShowAddStudentSearch(false);
        }
      }
    } catch (error) {
      console.error("Link action error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (status: number, data: any) => {
    if (status === 404) {
      toast({
        title: "User Not Found",
        description:
          data.detail ||
          "No user found with this email address. Please check and try again.",
        variant: "destructive",
      });
    } else if (status === 403) {
      toast({
        title: "Access Denied",
        description:
          data.detail || "You do not have permission to perform this action.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description:
          data.detail || "An error occurred while processing your request.",
        variant: "destructive",
      });
    }
  };

  const getProfileIcon = (type: ProfileType) => {
    switch (type) {
      case "student":
        return <GraduationCap className="h-5 w-5" />;
      case "teacher":
        return <Users className="h-5 w-5" />;
      case "parent":
        return <UserCircle className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getProfileLabel = (type: ProfileType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

return (
  <div className="space-y-6 px-1 sm:px-0"> {/* Reduced padding for tiny screens */}
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Verify User
        </h1>
        <p className="text-sm text-muted-foreground mt-1 break-words">
          {verifiedUser ? (
            <>
              User found:{" "}
              <span className="font-semibold text-[#EF7B55]">
                {verifiedUser.full_name}
              </span>
            </>
          ) : (
            "Enter an email to verify a user."
          )}
        </p>
      </div>
      {(email || verifiedUser) && (
        <Button 
          variant="outline" 
          onClick={resetForm}
          className="w-full sm:w-auto" // Full width on mobile
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      )}
    </div>

    {/* Step 1: Email Search */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-[#EF7B55] shrink-0" />
          Step 1: Find User
        </CardTitle>
        <CardDescription>
          Enter the user's email address to fetch details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* FIX: Stack input and button on mobile */}
        <form onSubmit={handleFetchUser} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              placeholder="user@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || step !== "search"}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || step !== "search"}
            className="bg-[#EF7B55] hover:bg-[#d96a47] w-full sm:w-auto shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Fetch Details"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* Step 2: User Verified - Show Profile Info & Update Form */}
    {verifiedUser && (
      <Card className="border-[#EF7B55]/30">
        <CardHeader className="pb-4">
          {/* FIX: Stack header items on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                User Verified
              </CardTitle>
              <CardDescription className="mt-1">
                Update profile details below.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 w-fit"
            >
              {getProfileIcon(verifiedUser.profile_type)}
              {getProfileLabel(verifiedUser.profile_type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
              {/* break-all handles super long emails on tiny screens */}
              <p className="font-medium text-sm sm:text-base break-all">{verifiedUser.email}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium text-sm sm:text-base truncate">{verifiedUser.full_name}</p>
            </div>
            
            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md bg-background gap-3">
              <div>
                <p className="text-sm font-medium">Activate user</p>
                <p className="text-xs text-muted-foreground">
                  User has primary organization?
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/50 px-3 py-1.5 rounded-md">
                <Checkbox
                  checked={activateUser}
                  onCheckedChange={(checked) => {
                    const next = Boolean(checked);
                    setActivateUser(next);
                  }}
                  disabled={isLoading}
                />
                <span className="text-sm">
                  {activateUser ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Family Details Display - Using Grid for alignment */}
            {verifiedUser.profile_type === "student" &&
              verifiedUser.student_profile?.parent_links &&
              verifiedUser.student_profile.parent_links.length > 0 && (
                <div className="md:col-span-2 mt-2 pt-2 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    Parents / Guardians
                  </p>
                  <div className="space-y-2">
                    {verifiedUser.student_profile.parent_links.map(
                      (link: any, idx: number) => (
                        <div key={idx} className="text-sm grid grid-cols-[auto_1fr] gap-2 items-start">
                          <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium block truncate">
                              {link.parent_user?.full_name || "Unknown"}
                            </span>
                            <span className="text-muted-foreground text-xs block break-all">
                              {link.parent_user?.email} ({link.relationship})
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Step 2: Update Profile Form */}
          <form onSubmit={handleUpdateClick} className="space-y-4">
            <div className="flex items-center gap-2 mb-4 pt-2 border-t">
              <div className="bg-[#EF7B55]/10 p-1.5 rounded-full">
                <Edit className="h-4 w-4 text-[#EF7B55]" />
              </div>
              <h3 className="font-medium text-sm sm:text-base">
                Update {getProfileLabel(verifiedUser.profile_type)} Profile
              </h3>
            </div>

            {/* Student Fields */}
            {verifiedUser.profile_type === "student" && (
              <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionNo">Admission Number</Label>
                    <Input
                      id="admissionNo"
                      placeholder="e.g., ADM-2024-001"
                      value={admissionNo}
                      onChange={(e) => setAdmissionNo(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classroom">Current Classroom</Label>
                  <Select
                    value={classroomId}
                    onValueChange={setClassroomId}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem
                          key={classroom.id}
                          value={classroom.id.toString()}
                        >
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Teacher Fields */}
            {verifiedUser.profile_type === "teacher" && (
              <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-card">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Brief bio..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        const id = parseInt(value);
                        if (!selectedLanguages.includes(id)) {
                          setSelectedLanguages([...selectedLanguages, id]);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No languages found
                          </SelectItem>
                        ) : (
                          languages
                            .filter((lang) => !selectedLanguages.includes(lang.id))
                            .map((lang) => (
                              <SelectItem key={lang.id} value={lang.id.toString()}>
                                {lang.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedLanguages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedLanguages.map((id) => {
                          const lang = languages.find((l) => l.id === id);
                          return lang ? (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground pr-1"
                              onClick={() =>
                                setSelectedLanguages(
                                  selectedLanguages.filter((l) => l !== id)
                                )
                              }
                            >
                              {lang.name} <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Parent Fields */}
            {verifiedUser.profile_type === "parent" && (
              <div className="space-y-6">
                <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-card">
                  <h4 className="font-medium flex items-center gap-2 text-sm">
                    <UserCircle className="h-4 w-4" /> Parent Details
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="e.g., 123 Main St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Manage Children Section */}
                <div className="space-y-4 p-3 sm:p-4 border rounded-lg bg-card">
                  {/* FIX: Wrap this header on small screens */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-medium flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4" /> Manage Children
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAddStudentSearch(!showAddStudentSearch);
                      }}
                      className="h-8 gap-1 ml-auto"
                    >
                      {showAddStudentSearch ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      {showAddStudentSearch ? "Cancel" : "Add Child"}
                    </Button>
                  </div>

                  {/* Add Student Search Area */}
                  {showAddStudentSearch && (
                    <div className="p-3 border rounded-md bg-muted/30 animate-in fade-in slide-in-from-top-2 mb-4">
                      <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                        Search Student by Email
                      </Label>
                      {/* FIX: Stack input and search button */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="student@example.com"
                          value={studentSearchEmail}
                          onChange={(e) => setStudentSearchEmail(e.target.value)}
                          disabled={isSearchingStudent}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSearchStudent}
                          disabled={isSearchingStudent || !studentSearchEmail}
                          variant="secondary"
                          type="button"
                          className="sm:w-auto w-full"
                        >
                          {isSearchingStudent ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Found Student Result */}
                      {foundStudentToAdd && (
                        <div className="mt-3 p-3 border rounded-md bg-background grid grid-cols-[1fr_auto] gap-3 items-center">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-primary/10 p-2 rounded-full shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {foundStudentToAdd.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground break-all">
                                {foundStudentToAdd.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddClick(foundStudentToAdd);
                            }}
                            className="gap-1 shrink-0"
                          >
                            <Plus className="h-3 w-3" /> <span className="hidden xs:inline">Add</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* List Existing Children */}
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Linked Students</Label>

                    {verifiedUser.parent_profile?.children_links?.map(
                      (link: any) => (
                        <div
                          key={link.link_id}
                          // FIX: Grid layout to prevent overflow
                          className="grid grid-cols-[1fr_auto] gap-3 items-center p-3 rounded-md border bg-muted/50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-background p-2 rounded-full shrink-0">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {link.student_user?.full_name || "Unknown"}
                              </p>
                              {/* break-all prevents long emails from expanding container */}
                              <p className="text-xs text-muted-foreground break-all leading-tight">
                                {link.student_user?.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveClick(link.student_user);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}

                    {!verifiedUser.parent_profile?.children_links?.length && (
                      <p className="text-sm text-muted-foreground italic py-2">
                        No children linked yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#EF7B55] hover:bg-[#d96a47] w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )}

    {/* Confirmation Modals - No layout changes needed here typically */}
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent className="w-[95vw] max-w-lg rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Profile Update</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to update the profile details for{" "}
            <span className="break-all font-medium text-foreground">{verifiedUser?.email}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:gap-0">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmUpdate}
            className="bg-[#EF7B55] hover:bg-[#d96a47]"
          >
            Confirm Update
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog
      open={actionConfirmation.isOpen}
      onOpenChange={(open) =>
        setActionConfirmation({ ...actionConfirmation, isOpen: open })
      }
    >
      <AlertDialogContent className="w-[95vw] max-w-lg rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionConfirmation.type === "add"
              ? "Add Student"
              : "Remove Student"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to{" "}
            {actionConfirmation.type === "add" ? "add" : "remove"}
            <span className="font-semibold block my-1">
              {" "}
              {actionConfirmation.student?.full_name}{" "}
            </span>
            {actionConfirmation.type === "add" ? "to" : "from"} this parent's
            profile?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:gap-0">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmAction}
            className={
              actionConfirmation.type === "remove"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-[#EF7B55] hover:bg-[#d96a47]"
            }
          >
            Confirm {actionConfirmation.type === "add" ? "Add" : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
}
