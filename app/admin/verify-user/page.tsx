"use client";

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

type ProfileType = "student" | "teacher" | "parent";

interface VerifyResponse {
    user_id: number;
    email: string;
    profile_type: ProfileType;
    organization_id: number;
    organization_name: string;
}

interface Classroom {
    id: number;
    name: string;
}

// ========== MOCK MODE ==========
// Set to true to test with mock data, false to use real API
const MOCK_MODE = true;

// Mock data for testing
const MOCK_USERS: Record<string, VerifyResponse & { profile?: any }> = {
    "student@test.com": {
        user_id: 101,
        email: "student@test.com",
        profile_type: "student",
        organization_id: 1,
        organization_name: "Texagon Academy",
        profile: {
            admission_no: "ADM-2024-001",
            dob: "2010-05-15",
            current_classroom_id: 2,
        },
    },
    "teacher@test.com": {
        user_id: 102,
        email: "teacher@test.com",
        profile_type: "teacher",
        organization_id: 1,
        organization_name: "Texagon Academy",
        profile: {
            bio: "Senior Software Development Instructor with 5 years of experience in teaching programming.",
            experience: 5,
            language_ids: [1, 3],
            specialty_ids: [1, 2],
        },
    },
    "parent@test.com": {
        user_id: 103,
        email: "parent@test.com",
        profile_type: "parent",
        organization_id: 1,
        organization_name: "Texagon Academy",
        profile: {
            address: "123 Main Street, Lagos, Nigeria",
        },
    },
};

const MOCK_CLASSROOMS: Classroom[] = [
    { id: 1, name: "JSS 1A" },
    { id: 2, name: "JSS 1B" },
    { id: 3, name: "JSS 2A" },
    { id: 4, name: "SSS 1A" },
    { id: 5, name: "SSS 2B" },
];

interface Language {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
}

const MOCK_LANGUAGES: Language[] = [
    { id: 1, name: "python" },
    { id: 2, name: "java" },
    { id: 3, name: "Javascript" },
    { id: 4, name: "ruby" },
    { id: 5, name: "C++" }
];

const MOCK_SUBJECTS: Subject[] = [
    { id: 1, name: "web" },
    { id: 2, name: "Mobile development" },
    { id: 3, name: "Seo" },

];
// ================================

export default function VerifyUserPage() {
    const { toast } = useToast();

    // Flow state
    const [step, setStep] = useState<"search" | "verified" | "updating">("search");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<VerifyResponse | null>(null);

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

    // Confirmation dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Fetch data when user is verified
    useEffect(() => {
        if (verifiedUser?.profile_type === "student") {
            fetchClassrooms();
        }
        if (verifiedUser?.profile_type === "teacher") {
            fetchLanguages();
            fetchSubjects();
        }
    }, [verifiedUser]);

    const fetchClassrooms = async () => {
        if (MOCK_MODE) {
            setClassrooms(MOCK_CLASSROOMS);
            return;
        }
        try {
            const res = await fetch("/api/admin/classrooms");
            const data = await res.json();
            if (data.classrooms) {
                setClassrooms(data.classrooms);
            }
        } catch (error) {
            console.error("Failed to fetch classrooms:", error);
        }
    };

    const fetchLanguages = async () => {
        if (MOCK_MODE) {
            setLanguages(MOCK_LANGUAGES);
            return;
        }

        setLanguages(MOCK_LANGUAGES);
    };

    const fetchSubjects = async () => {
        if (MOCK_MODE) {
            setSubjects(MOCK_SUBJECTS);
            return;
        }
        try {
            const res = await fetch("/api/admin/subjects");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSubjects(data.map((s: any) => ({ id: s.id, name: s.name })));
            }
        } catch (error) {
            console.error("Failed to fetch subjects:", error);
            setSubjects(MOCK_SUBJECTS);
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
    };

    // Step 1: Verify user by email (no profile data)
    const handleVerifyUser = async (e: React.FormEvent) => {
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
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            const mockUser = MOCK_USERS[email.trim().toLowerCase()];

            if (mockUser) {
                setVerifiedUser(mockUser);
                setStep("verified");

                // Pre-populate form fields with existing profile data
                if (mockUser.profile) {
                    const p = mockUser.profile;
                    // Student fields
                    if (p.admission_no) setAdmissionNo(p.admission_no);
                    if (p.dob) setDob(p.dob);
                    if (p.current_classroom_id) setClassroomId(p.current_classroom_id.toString());
                    // Teacher fields
                    if (p.bio) setBio(p.bio);
                    if (p.experience) setExperience(p.experience.toString());
                    if (p.language_ids) setSelectedLanguages(p.language_ids);
                    if (p.specialty_ids) setSelectedSubjects(p.specialty_ids);
                    // Parent fields
                    if (p.address) setAddress(p.address);
                }

                toast({
                    title: "User Found (Mock)",
                    description: `${mockUser.email} is a ${mockUser.profile_type}. You can now update their profile.`,
                });
            } else {
                toast({
                    title: "User Not Found",
                    description: "Try: student@test.com, teacher@test.com, or parent@test.com",
                    variant: "destructive",
                });
            }
            setIsLoading(false);
            return;
        }

        try {
            // First call: just verify the user exists and get their profile type
            const res = await fetch("/api/admin/verify-user", {
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
            setStep("verified");
            toast({
                title: "User Found",
                description: `${data.email} is a ${data.profile_type}. You can now update their profile.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to verify user",
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

        // MOCK MODE: Simulate successful update
        if (MOCK_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            toast({
                title: "✅ Update Successful",
                description: `${verifiedUser.email}'s profile has been updated successfully.`,
            });
            setIsLoading(false);
            return;
        }

        try {
            const payload: any = { email: verifiedUser.email };
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

            setVerifiedUser(data);
            toast({
                title: "✅ Update Successful",
                description: `Profile updated and attached to ${data.organization_name}`,
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
                if (classroomId) studentProfile.current_classroom_id = parseInt(classroomId);
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
                return parentProfile;

            default:
                return {};
        }
    };

    const handleApiError = (status: number, data: any) => {
        if (status === 404) {
            toast({
                title: "User Not Found",
                description: "User with this email does not exist.",
                variant: "destructive",
            });
        } else if (status === 403) {
            toast({
                title: "Access Denied",
                description: "You do not have AdminAccess.",
                variant: "destructive",
            });
        } else if (data.detail?.includes("Classroom")) {
            toast({
                title: "Classroom Error",
                description: "Classroom not found in your selected organization.",
                variant: "destructive",
            });
        } else if (data.detail?.includes("profile")) {
            toast({
                title: "Profile Error",
                description: data.detail,
                variant: "destructive",
            });
        } else if (data.detail?.includes("selected_organization")) {
            toast({
                title: "No Organization",
                description: "No selected_organization set on your AdminAccess.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Error",
                description: data.detail || "An error occurred",
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
        }
    };

    const getProfileLabel = (type: ProfileType) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Verify & Update User
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {verifiedUser ? (
                            <>
                                User attached to{" "}
                                <span className="font-semibold text-[#EF7B55]">
                                    {verifiedUser.organization_name}
                                </span>
                            </>
                        ) : (
                            "Enter an email to find and verify a user."
                        )}
                    </p>
                </div>
                {(email || verifiedUser) && (
                    <Button variant="outline" onClick={resetForm}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                )}
            </div>

            {/* Step 1: Email Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-[#EF7B55]" />
                        Step 1: Find User
                    </CardTitle>
                    <CardDescription>
                        Enter the user's email to verify and detect their profile type.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerifyUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading || step !== "search"}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || step !== "search"}
                                    className="bg-[#EF7B55] hover:bg-[#d96a47]"
                                >
                                    {isLoading && step === "search" ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Step 2: User Verified - Show Profile Info & Update Form */}
            {verifiedUser && (
                <Card className="border-[#EF7B55]/30">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    User Verified
                                </CardTitle>
                                <CardDescription>
                                    User found! Update their profile details below.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                {getProfileIcon(verifiedUser.profile_type)}
                                {getProfileLabel(verifiedUser.profile_type)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* User Info Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">User ID</p>
                                <p className="font-medium">{verifiedUser.user_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{verifiedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Organization</p>
                                <p className="font-medium text-[#EF7B55]">{verifiedUser.organization_name}</p>
                            </div>
                        </div>

                        {/* Step 2: Update Profile Form */}
                        <form onSubmit={handleUpdateClick} className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Edit className="h-4 w-4 text-[#EF7B55]" />
                                <h3 className="font-medium">
                                    Step 2: Update {getProfileLabel(verifiedUser.profile_type)} Profile
                                </h3>
                            </div>

                            {/* Student Fields */}
                            {verifiedUser.profile_type === "student" && (
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="admissionNo">Admission Number</Label>
                                            <Input
                                                id="admissionNo"
                                                placeholder="e.g., ADM-12345"
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
                                        <Label htmlFor="classroom">Classroom</Label>
                                        <Select
                                            value={classroomId}
                                            onValueChange={setClassroomId}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a classroom" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classrooms.map((classroom) => (
                                                    <SelectItem key={classroom.id} value={classroom.id.toString()}>
                                                        {classroom.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Only classrooms in your organization are shown.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Teacher Fields */}
                            {verifiedUser.profile_type === "teacher" && (
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            placeholder="e.g., Senior Mathematics Teacher"
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
                                                placeholder="e.g., 5"
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
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select languages..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {languages
                                                        .filter(lang => !selectedLanguages.includes(lang.id))
                                                        .map((lang) => (
                                                            <SelectItem key={lang.id} value={lang.id.toString()}>
                                                                {lang.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedLanguages.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {selectedLanguages.map(id => {
                                                        const lang = languages.find(l => l.id === id);
                                                        return lang ? (
                                                            <Badge
                                                                key={id}
                                                                variant="secondary"
                                                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                                                onClick={() => setSelectedLanguages(selectedLanguages.filter(l => l !== id))}
                                                            >
                                                                {lang.name} ×
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Specialties/Subjects</Label>
                                        <Select
                                            value=""
                                            onValueChange={(value) => {
                                                const id = parseInt(value);
                                                if (!selectedSubjects.includes(id)) {
                                                    setSelectedSubjects([...selectedSubjects, id]);
                                                }
                                            }}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subjects..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects
                                                    .filter(subj => !selectedSubjects.includes(subj.id))
                                                    .map((subject) => (
                                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                                            {subject.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedSubjects.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {selectedSubjects.map(id => {
                                                    const subject = subjects.find(s => s.id === id);
                                                    return subject ? (
                                                        <Badge
                                                            key={id}
                                                            variant="secondary"
                                                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={() => setSelectedSubjects(selectedSubjects.filter(s => s !== id))}
                                                        >
                                                            {subject.name} ×
                                                        </Badge>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Parent Fields */}
                            {verifiedUser.profile_type === "parent" && (
                                <div className="space-y-4 p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            placeholder="e.g., 123 Test Street, Lagos"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            disabled={isLoading}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[#EF7B55] hover:bg-[#d96a47]"
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

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Profile Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to update the profile for {verifiedUser?.email}?
                            This action will save the changes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmUpdate} className="bg-[#EF7B55] hover:bg-[#d96a47]">
                            Confirm Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
