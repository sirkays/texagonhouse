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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>
                {fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <p className="text-gray-600 capitalize">
                {role} at TechXagon Academy
              </p>
            </div>
          </div>
          <Badge className="capitalize">{role}</Badge>
        </div>

        {/* Edit Controls */}
        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="space-x-2">
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
            {success}
          </div>
        )}

        {/* Personal Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={firstName}
              disabled={!isEditing}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
            <Input
              value={lastName}
              disabled={!isEditing}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
            <Input
              value={email}
              disabled={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <Input
              value={phone}
              disabled={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
          </CardContent>
        </Card>

        {/* Role Specific */}
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{role} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {role === "teacher" && (
              <>
                <Textarea
                  value={bio}
                  disabled={!isEditing}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Professional Bio"
                />
                <Input
                  type="number"
                  value={experience}
                  disabled={!isEditing}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Years of Experience"
                />
              </>
            )}

            {role === "parent" && (
              <Textarea
                value={address}
                disabled={!isEditing}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
              />
            )}

            {role === "student" && (
              <p className="text-gray-600">
                Students can update personal information above.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
