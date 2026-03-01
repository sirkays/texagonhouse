"use client";

import {useEffect, useState} from "react";
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

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [role, setRole] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

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
    } catch {
      setError("Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${firstName} ${lastName}`.trim() || "User";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 lg:px-8">
    //   <div className="w-full max-w-5xl mx-auto">
    //     {/* Header */}
    //     <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
    //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    //         {/* Avatar + Name */}
    //         <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
    //           <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border border-[#ef7b55]/40 shadow-sm">
    //             <AvatarImage src="/avatar.png" />
    //             <AvatarFallback>
    //               {fullName.charAt(0).toUpperCase()}
    //             </AvatarFallback>
    //           </Avatar>

    //           <div>
    //             <h1 className="text-xl sm:text-2xl font-bold">{fullName}</h1>
    //             <p className="text-gray-600 capitalize text-sm sm:text-base">
    //               {role} at TechXagon Academy
    //             </p>
    //           </div>
    //         </div>

    //         <Badge className="capitalize bg-[#ef7b55] self-center sm:self-auto">
    //           {role}
    //         </Badge>
    //       </div>
    //     </div>

    //     {/* Navigation + Edit Controls */}
    //     <div className="flex justify-end sm:items-center gap-3 mb-6">
    //       {!isEditing ? (
    //         <Button
    //           onClick={() => setIsEditing(true)}
    //           variant="outline"
    //           className="w-full sm:w-auto">
    //           <Edit2 className="mr-2 h-4 w-4" />
    //           Edit Profile
    //         </Button>
    //       ) : (
    //         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    //           <Button
    //             onClick={handleSubmit}
    //             disabled={saving}
    //             className="w-full sm:w-auto bg-[#ef7b55] border-[#ef7b55] text-white hover:bg-[#ef7b55]/90">
    //             {saving ? (
    //               <Spinner size="sm" className="mr-2" />
    //             ) : (
    //               <Save className="mr-2 h-4 w-4" />
    //             )}
    //             Save Changes
    //           </Button>

    //           <Button
    //             variant="ghost"
    //             onClick={() => setIsEditing(false)}
    //             className="w-full sm:w-auto">
    //             <X className="mr-2 h-4 w-4" />
    //             Cancel
    //           </Button>
    //         </div>
    //       )}
    //     </div>

    //     {/* Alerts */}
    //     {error && (
    //       <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">
    //         {error}
    //       </div>
    //     )}

    //     {success && (
    //       <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center text-sm">
    //         {success}
    //       </div>
    //     )}

    //     {/* Personal Information */}
    //     <Card className="mb-6 rounded-2xl shadow-sm">
    //       <CardHeader>
    //         <CardTitle className="text-lg sm:text-xl">
    //           Personal Information
    //         </CardTitle>
    //       </CardHeader>

    //       <CardContent>
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //           <Input
    //             value={firstName}
    //             disabled={!isEditing}
    //             onChange={(e) => setFirstName(e.target.value)}
    //             placeholder="First Name"
    //           />

    //           <Input
    //             value={lastName}
    //             disabled={!isEditing}
    //             onChange={(e) => setLastName(e.target.value)}
    //             placeholder="Last Name"
    //           />

    //           <Input
    //             value={email}
    //             disabled={!isEditing}
    //             onChange={(e) => setEmail(e.target.value)}
    //             placeholder="Email"
    //             className="md:col-span-2"
    //           />

    //           <Input
    //             value={phone}
    //             disabled={!isEditing}
    //             onChange={(e) => setPhone(e.target.value)}
    //             placeholder="Phone"
    //             className="md:col-span-2"
    //           />
    //         </div>
    //       </CardContent>
    //     </Card>

    //     {/* Role Specific */}
    //     <Card className="rounded-2xl shadow-sm">
    //       <CardHeader>
    //         <CardTitle className="capitalize text-lg sm:text-xl">
    //           {role} Details
    //         </CardTitle>
    //       </CardHeader>

    //       <CardContent className="space-y-4">
    //         {role === "teacher" && (
    //           <>
    //             <Textarea
    //               value={bio}
    //               disabled={!isEditing}
    //               onChange={(e) => setBio(e.target.value)}
    //               placeholder="Professional Bio"
    //               className="min-h-[120px]"
    //             />

    //             <Input
    //               type="number"
    //               value={experience}
    //               disabled={!isEditing}
    //               onChange={(e) => setExperience(e.target.value)}
    //               placeholder="Years of Experience"
    //             />
    //           </>
    //         )}

    //         {role === "parent" && (
    //           <Textarea
    //             value={address}
    //             disabled={!isEditing}
    //             onChange={(e) => setAddress(e.target.value)}
    //             placeholder="Address"
    //             className="min-h-[120px]"
    //           />
    //         )}

    //         {role === "student" && (
    //           <p className="text-gray-600 text-sm">
    //             Students can update personal information above.
    //           </p>
    //         )}
    //       </CardContent>
    //     </Card>
    //   </div>
    // </div>

    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Glass Header Card */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/40 shadow-lg rounded-3xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Avatar + Name */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border border-white/50 shadow-md backdrop-blur-md">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>
                  {fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {fullName}
                </h1>
                <p className="text-slate-600 capitalize text-sm sm:text-base">
                  {role} at TechXagon Academy
                </p>
              </div>
            </div>

            <Badge className="capitalize bg-[#ef7b55]/80 hover:bg-[#ef7b55]/90 backdrop-blur-md text-white border border-white/30 shadow-md self-center sm:self-auto px-4 py-1.5">
              {role}
            </Badge>
          </div>
        </div>

        {/* Edit Controls */}
        <div className="flex justify-end gap-3 mb-8">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="backdrop-blur-md bg-[#ef7b55]/80 hover:bg-[#ef7b55]/90 border border-[#ef7b55]/40 transition rounded-xl shadow-md">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-[#ef7b55]/90 backdrop-blur-md border border-white/30 text-white hover:bg-[#ef7b55] shadow-lg rounded-xl">
                {saving ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>

              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="backdrop-blur-md bg-white/30 hover:bg-white/50 border border-white/40 rounded-xl">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="backdrop-blur-md bg-red-400/20 border border-red-300/30 text-red-700 p-4 rounded-2xl mb-6 text-center text-sm shadow-md">
            {error}
          </div>
        )}

        {success && (
          <div className="backdrop-blur-md bg-green-400/20 border border-green-300/30 text-green-700 p-4 rounded-2xl mb-6 text-center text-sm shadow-md">
            {success}
          </div>
        )}

        {/* Personal Information */}
        <Card className="mb-8 backdrop-blur-xl bg-white/40 border border-white/40 shadow-md rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">
              Personal Information
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                value={firstName}
                disabled={!isEditing}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="backdrop-blur-md bg-white/50 border border-white/40 focus:bg-white/70 rounded-xl"
              />

              <Input
                value={lastName}
                disabled={!isEditing}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="backdrop-blur-md bg-white/50 border border-white/40 focus:bg-white/70 rounded-xl"
              />

              <Input
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="md:col-span-2 backdrop-blur-md bg-white/50 border border-white/40 focus:bg-white/70 rounded-xl"
              />

              <Input
                value={phone}
                disabled={!isEditing}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="md:col-span-2 backdrop-blur-md bg-white/50 border border-white/40 focus:bg-white/70 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Specific */}
        <Card className="backdrop-blur-xl bg-white/40 border border-white/40 shadow-md rounded-3xl">
          <CardHeader>
            <CardTitle className="capitalize text-lg sm:text-xl font-semibold text-slate-900">
              {role} Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {role === "teacher" && (
              <>
                <Textarea
                  value={bio}
                  disabled={!isEditing}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Professional Bio"
                  className="min-h-[120px] backdrop-blur-md bg-white/50 border border-white/40 focus:bg-white/70 rounded-xl"
                />

                <Input
                  type="number"
                  value={experience}
                  disabled={!isEditing}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Years of Experience"
                  className="backdrop-blur-md bg-white/50 border border-white/40 focus:bg-white/70 rounded-xl"
                />
              </>
            )}

            {role === "parent" && (
              <Textarea
                value={address}
                disabled={!isEditing}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="min-h-[120px] backdrop-blur-md bg-white/50 border border-white/40 focus:bg-white/70 rounded-xl"
              />
            )}

            {role === "student" && (
              <p className="text-slate-600 text-sm">
                Students can update personal information above.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
