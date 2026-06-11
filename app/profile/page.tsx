"use client";

import {useEffect, useState} from "react";
import { useStudentTheme } from "@/components/student/useStudentTheme";
import {
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  User,
  MapPin,
  BookOpen,
  Briefcase,
} from "lucide-react";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";

export default function ProfilePage() {
  const router = useRouter();
  const { update } = useSession();
  const { theme, setTheme } = useStudentTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [role, setRole] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameSuccess, setNicknameSuccess] = useState<string | null>(null);

  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState<number | string>("");
  const [address, setAddress] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 🔄 FETCH PROFILE
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fetch-profile");
      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Failed to fetch profile.");
        return;
      }

      setRole(data.account_type);
      setEmail(data.user?.email || "");
      setFirstName(data.user?.first_name || "");
      setLastName(data.user?.last_name || "");
      setPhone(data.user?.phone || "");
      setNickname(data.user?.nickname || data.user?.username || "");

      if (data.account_type === "teacher") {
        setBio(data.teacher_profile?.bio || "");
        setExperience(data.teacher_profile?.experience || "");
      }

      if (data.account_type === "parent") {
        setAddress(data.parent_profile?.address || "");
      }
    } catch {
      setError("Network error while fetching profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 💾 UPDATE PROFILE
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const body: any = {
      account_type: role,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      nickname,
    };

    if (role === "teacher") {
      body.bio = bio;
      body.experience = Number(experience);
    }

    if (role === "parent") {
      body.address = address;
    }

    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || "Failed to update profile.");
        return;
      }

      setSuccess(data?.detail || "Profile updated successfully.");
      setIsEditing(false);

      // 🔄 Refetch fresh profile after update
      await fetchProfile();
      
      // Update session locally to reflect potential nickname/name changes
      await update({
        nickname: nickname,
        hasNickname: true,
        name: firstName || lastName ? `${firstName} ${lastName}`.trim() : undefined
      });
    } catch {
      setError("Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${firstName} ${lastName}`.trim() || "User";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Spinner size="lg" className="text-[#EF7B55]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-1 sm:p-2">
      {/* Premium Gradient Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl dark:shadow-none">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-white/20 shrink-0 shadow-md">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-[#EF7B55]/20 text-[#ffae91] font-black text-2xl rounded-2xl">
                {fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
                {fullName}
              </h1>
              <p className="text-slate-350 capitalize text-sm sm:text-base font-semibold">
                {role} at TechXagon Academy
              </p>
            </div>
          </div>
          
          <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 hover:bg-[#EF7B55]/30 px-4 py-1.5 font-bold text-xs capitalize tracking-wide rounded-full shadow-sm">
            {role} Account
          </Badge>
        </div>
      </div>

      {/* Edit Controls */}
      <div className="flex justify-end gap-3">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-[#EF7B55] to-orange-500 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:opacity-90 flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-[#EF7B55] to-orange-500 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:opacity-90 flex items-center gap-2"
            >
              {saving ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="backdrop-blur-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-450 p-4 rounded-xl text-center text-sm shadow-sm font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-450 p-4 rounded-xl text-center text-sm shadow-sm font-bold">
          {success}
        </div>
      )}

      {/* Personal Information */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <User className="h-5 w-5 text-[#EF7B55]" />
            Personal Information
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">First Name</label>
              <Input
                value={firstName}
                disabled={!isEditing}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Last Name</label>
              <Input
                value={lastName}
                disabled={!isEditing}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
              <Input
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</label>
              <Input
                value={phone}
                disabled={!isEditing}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nickname / Username Card */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#EF7B55]" />
            Nickname / Username
          </CardTitle>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold mt-1">
            This is the unique name you can use to log in instead of your email.
            It must be unique, at least 3 characters, and contain no spaces.
          </p>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Unique Nickname</label>
            <Input
              value={nickname}
              disabled={!isEditing}
              onChange={(e) => {
                setNickname(e.target.value.trim());
                setNicknameError(null);
                setNicknameSuccess(null);
              }}
              placeholder="e.g. john_doe123"
              className="bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold"
            />
          </div>

          {nicknameError && (
            <p className="text-xs text-rose-600 font-bold mt-2">{nicknameError}</p>
          )}
          {nicknameSuccess && (
            <p className="text-xs text-emerald-600 font-bold mt-2">{nicknameSuccess}</p>
          )}
        </CardContent>
      </Card>

      {/* Role Specific Details */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <CardTitle className="capitalize text-lg sm:text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#EF7B55]" />
            {role} Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5">
          {role === "teacher" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Professional Bio</label>
                <Textarea
                  value={bio}
                  disabled={!isEditing}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Professional Bio"
                  className="min-h-[120px] bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Years of Experience</label>
                <Input
                  type="number"
                  value={experience}
                  disabled={!isEditing}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Years of Experience"
                  className="bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {role === "parent" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Residential Address</label>
              <Textarea
                value={address}
                disabled={!isEditing}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="min-h-[120px] bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl transition-all font-semibold"
              />
            </div>
          )}

          {role === "student" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100/50">
                <p className="text-slate-650 dark:text-slate-400 font-semibold text-xs xs:text-sm">
                  Students can update personal information above. Under the "Dashboard Visual Style" section below, you can choose your preferred portal appearance.
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
                <h4 className="text-xs xs:text-sm font-bold text-slate-700 dark:text-slate-350">
                  Dashboard Visual Style
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Classic Minimalist Option */}
                  <div
                    onClick={() => setTheme("classic-minimalist")}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[140px] ${
                      theme === "classic-minimalist"
                        ? "border-[#EF7B55] bg-orange-500/5 shadow-md shadow-orange-50/20"
                        : "border-slate-200/80 dark:border-slate-800 bg-white/50 hover:bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-slate-850 dark:text-white">
                          Classic Minimalist
                        </span>
                        {theme === "classic-minimalist" && (
                          <span className="h-4 w-4 rounded-full bg-[#EF7B55] flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        The original, neat, high-performance interface with clean layouts and standard white panels.
                      </p>
                    </div>
                  </div>

                  {/* Aero Premium Option */}
                  <div
                    onClick={() => setTheme("aero-premium")}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[140px] ${
                      theme === "aero-premium"
                        ? "border-[#EF7B55] bg-orange-500/5 shadow-md shadow-orange-50/20"
                        : "border-slate-200/80 dark:border-slate-800 bg-white/50 hover:bg-slate-50/50 hover:border-slate-300"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#EF7B55]/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-1.5">
                          Aero Premium 
                          <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Glossy</span>
                        </span>
                        {theme === "aero-premium" && (
                          <span className="h-4 w-4 rounded-full bg-[#EF7B55] flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                        Frosted-glass panels, soft ambient gradients, subtle shadows, and premium smooth interactive dynamics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
