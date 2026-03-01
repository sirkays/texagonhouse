// // "use client";

// // import {useState, useEffect, useCallback} from "react";
// // import {useSession} from "next-auth/react";
// // import {useRouter} from "next/navigation";
// // import {
// //   Edit2,
// //   Save,
// //   X,
// //   Mail,
// //   Phone,
// //   User,
// //   MapPin,
// //   BookOpen,
// //   Briefcase,
// // } from "lucide-react";
// // import {Input} from "@/components/ui/input";
// // import {Button} from "@/components/ui/button";
// // import {Spinner} from "@/components/ui/spinner";
// // import {Textarea} from "@/components/ui/textarea";
// // import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

// // export default function ProfilePage() {
// //   const {data: session, status, update} = useSession();
// //   const router = useRouter();

// //   const [isEditing, setIsEditing] = useState(false);

// //   const [email, setEmail] = useState("");
// //   const [firstName, setFirstName] = useState("");
// //   const [lastName, setLastName] = useState("");
// //   const [phone, setPhone] = useState("");
// //   const [address, setAddress] = useState("");
// //   const [bio, setBio] = useState("");
// //   const [experience, setExperience] = useState<number | string>("");

// //   const [error, setError] = useState<string | null>(null);
// //   const [success, setSuccess] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(false);

// //   const role = session?.user?.role;

// //   /* ---------------------------------------
// //      APPLY PROFILE DATA TO STATE
// //   --------------------------------------- */
// //   const applyProfileToState = useCallback((profile: any) => {
// //     if (!profile) return;

// //     setEmail(profile.user?.email || "");
// //     setFirstName(profile.user?.first_name || "");
// //     setLastName(profile.user?.last_name || "");
// //     setPhone(profile.user?.phone || "");

// //     if (profile.account_type === "teacher") {
// //       setBio(profile.teacher_profile?.bio || "");
// //       setExperience(profile.teacher_profile?.experience || "");
// //     }

// //     if (profile.account_type === "parent") {
// //       setAddress(profile.parent_profile?.address || "");
// //     }
// //   }, []);

// //   /* ---------------------------------------
// //      LOAD INITIAL DATA FROM SESSION
// //   --------------------------------------- */
// //   useEffect(() => {
// //     if (!session?.user) return;

// //     applyProfileToState({
// //       account_type: role,
// //       user: session.user,
// //       teacher_profile: session.user.teacher_profile,
// //       parent_profile: session.user.parent_profile,
// //     });
// //   }, [session, role, applyProfileToState]);

// //   const validateEmailFormat = (e: string) =>
// //     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// //   /* ---------------------------------------
// //      HANDLE SUBMIT
// //   --------------------------------------- */
// //   const handleSubmit = async () => {
// //     setError(null);
// //     setSuccess(null);
// //     setLoading(true);

// //     if (email && !validateEmailFormat(email)) {
// //       setError("Please enter a valid email address.");
// //       setLoading(false);
// //       return;
// //     }

// //     const body: any = {};

// //     if (email !== session?.user?.email) body.email = email;
// //     if (firstName !== session?.user?.first_name) body.first_name = firstName;
// //     if (lastName !== session?.user?.last_name) body.last_name = lastName;
// //     if (phone !== session?.user?.phone) body.phone = phone;

// //     if (role === "teacher") {
// //       if (bio !== session?.user?.teacher_profile?.bio) body.bio = bio;

// //       if (
// //         experience !== "" &&
// //         Number(experience) !== session?.user?.teacher_profile?.experience
// //       ) {
// //         body.experience = Number(experience);
// //       }
// //     }

// //     if (role === "parent") {
// //       if (address !== session?.user?.parent_profile?.address)
// //         body.address = address;
// //     }

// //     if (Object.keys(body).length === 0) {
// //       setError("No changes to update.");
// //       setLoading(false);
// //       return;
// //     }

// //     try {
// //       const response = await fetch("/api/update-profile", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(body),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         setError(data?.detail || "Failed to update profile.");
// //         return;
// //       }

// //       /* ---------------------------------------
// //          🔥 APPLY FRESH PROFILE FROM SERVER
// //       --------------------------------------- */
// //       if (data?.profile) {
// //         applyProfileToState(data.profile);
// //       }

// //       setSuccess(data.detail || "Profile updated successfully!");
// //       setIsEditing(false);

// //       // Optional: sync NextAuth session
// //       await update();
// //     } catch (err: any) {
// //       console.error(err);
// //       setError(err?.message || "Network error. Please check your connection.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCancel = () => {
// //     setIsEditing(false);
// //     setError(null);
// //     setSuccess(null);
// //   };

// //   if (status === "loading") {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <Spinner size="lg" />
// //       </div>
// //     );
// //   }

// //   if (!session) {
// //     router.push("/login");
// //     return null;
// //   }

// //   const fullName = `${firstName} ${lastName}`.trim() || "User";

// //   return (
// //     <div className="min-h-screen bg-gray-100 py-8 px-4">
// //       <div className="max-w-3xl mx-auto">
// //         {error && (
// //           <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-center">
// //             {error}
// //           </div>
// //         )}

// //         {success && (
// //           <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-center">
// //             {success}
// //           </div>
// //         )}

// //         <Card>
// //           <CardHeader>
// //             <CardTitle>Personal Information</CardTitle>
// //           </CardHeader>
// //           <CardContent className="space-y-4">
// //             <div className="flex gap-2">
// //               <Input
// //                 value={firstName}
// //                 onChange={(e) => setFirstName(e.target.value)}
// //                 disabled={!isEditing || loading}
// //                 placeholder="First Name"
// //               />
// //               <Input
// //                 value={lastName}
// //                 onChange={(e) => setLastName(e.target.value)}
// //                 disabled={!isEditing || loading}
// //                 placeholder="Last Name"
// //               />
// //             </div>

// //             <Input
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               disabled={!isEditing || loading}
// //               placeholder="Email"
// //             />

// //             <Input
// //               value={phone}
// //               onChange={(e) => setPhone(e.target.value)}
// //               disabled={!isEditing || loading}
// //               placeholder="Phone"
// //             />

// //             {role === "teacher" && (
// //               <>
// //                 <Textarea
// //                   value={bio}
// //                   onChange={(e) => setBio(e.target.value)}
// //                   disabled={!isEditing || loading}
// //                   placeholder="Bio"
// //                 />
// //                 <Input
// //                   type="number"
// //                   value={experience}
// //                   onChange={(e) => setExperience(e.target.value)}
// //                   disabled={!isEditing || loading}
// //                   placeholder="Experience"
// //                 />
// //               </>
// //             )}

// //             {role === "parent" && (
// //               <Textarea
// //                 value={address}
// //                 onChange={(e) => setAddress(e.target.value)}
// //                 disabled={!isEditing || loading}
// //                 placeholder="Address"
// //               />
// //             )}

// //             {isEditing ? (
// //               <div className="flex gap-2">
// //                 <Button onClick={handleSubmit} disabled={loading}>
// //                   {loading ? <Spinner size="sm" /> : "Save Changes"}
// //                 </Button>
// //                 <Button
// //                   variant="ghost"
// //                   onClick={handleCancel}
// //                   disabled={loading}>
// //                   Cancel
// //                 </Button>
// //               </div>
// //             ) : (
// //               <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
// //             )}
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import {useMemo, useState, useEffect, useCallback} from "react";
// import {useSession} from "next-auth/react";
// import {useRouter} from "next/navigation";
// import {
//   Edit2,
//   Save,
//   X,
//   Mail,
//   Phone,
//   User,
//   MapPin,
//   BookOpen,
//   Briefcase,
// } from "lucide-react";

// import {Input} from "@/components/ui/input";
// import {Button} from "@/components/ui/button";
// import {Spinner} from "@/components/ui/spinner";
// import {Textarea} from "@/components/ui/textarea";
// import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// import {Badge} from "@/components/ui/badge";

// export default function ProfilePage() {
//   const {data: session, status, update} = useSession();
//   const router = useRouter();

//   const [isEditing, setIsEditing] = useState(false);

//   const [email, setEmail] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [phone, setPhone] = useState("");

//   // Role specific
//   const [address, setAddress] = useState(""); // parent
//   const [bio, setBio] = useState(""); // teacher
//   const [experience, setExperience] = useState<number | string>(""); // teacher

//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const role = session?.user?.role;
//   const sessionToken = useMemo(
//     () => session?.user?.sessionToken ?? null,
//     [session?.user?.sessionToken],
//   );

//   const fullName =
//     `${firstName} ${lastName}`.trim() || session?.user?.email || "User";

//   const headline = role
//     ? `${role.charAt(0).toUpperCase() + role.slice(1)} at TechXagon Academy`
//     : "";

//   // Reset form from session
//   const resetToSessionData = useCallback(() => {
//     if (!session?.user) return;

//     setEmail(session.user.email || "");
//     setFirstName(session.user.first_name || "");
//     setLastName(session.user.last_name || "");
//     setPhone(session.user.phone || "");

//     if (role === "teacher") {
//       setBio(session.user.teacher_profile?.bio || "");
//       setExperience(session.user.teacher_profile?.experience || "");
//     }

//     if (role === "parent") {
//       setAddress(session.user.parent_profile?.address || "");
//     }
//   }, [session, role]);

//   useEffect(() => {
//     resetToSessionData();
//   }, [resetToSessionData]);

//   const validateEmail = (value: string) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

//   const handleSubmit = async () => {
//     setError(null);
//     setSuccess(null);
//     setLoading(true);

//     if (email && !validateEmail(email)) {
//       setError("Please enter a valid email address.");
//       setLoading(false);
//       return;
//     }

//     if (role === "teacher" && experience !== "" && isNaN(Number(experience))) {
//       setError("Experience must be a valid number.");
//       setLoading(false);
//       return;
//     }

//     if (!sessionToken) {
//       setError("Session expired. Please login again.");
//       setLoading(false);
//       router.push("/login");
//       return;
//     }

//     const body: any = {};

//     // Optional but recommended
//     if (role) body.account_type = role;

//     // Only include changed fields
//     if (email !== session?.user?.email) body.email = email;
//     if (firstName !== session?.user?.first_name) body.first_name = firstName;
//     if (lastName !== session?.user?.last_name) body.last_name = lastName;
//     if (phone !== session?.user?.phone) body.phone = phone;

//     if (role === "teacher") {
//       if (bio !== session?.user?.teacher_profile?.bio) body.bio = bio;

//       if (
//         experience !== "" &&
//         Number(experience) !== session?.user?.teacher_profile?.experience
//       )
//         body.experience = Number(experience);
//     }

//     if (role === "parent") {
//       if (address !== session?.user?.parent_profile?.address)
//         body.address = address;
//     }

//     if (Object.keys(body).length <= 1) {
//       setError("No updatable fields supplied.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch("/api/update-profile", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       let data: any = {};
//       try {
//         data = await response.json();
//       } catch {
//         data = {detail: "Invalid server response."};
//       }

//       if (!response.ok) {
//         setError(data?.detail || "Failed to update profile. Please try again.");
//         return;
//       }

//       setSuccess(data.detail || "Profile updated successfully!");
//       setIsEditing(false);

//       if (update) {
//         await update();
//       }
//     } catch (err: any) {
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     resetToSessionData();
//     setError(null);
//     setSuccess(null);
//   };

//   if (status === "loading") {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <Spinner size="lg" />
//       </div>
//     );
//   }

//   if (!session) {
//     router.push("/login");
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-8 px-4">
//       <div className="max-w-3xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <Avatar className="h-16 w-16">
//                 <AvatarImage src="/avatar.png" />
//                 <AvatarFallback>
//                   {fullName.charAt(0).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <h1 className="text-2xl font-bold">{fullName}</h1>
//                 <p className="text-gray-600">{headline}</p>
//               </div>
//             </div>
//             <Badge variant="secondary" className="capitalize">
//               {role}
//             </Badge>
//           </div>
//         </div>

//         {/* Edit Controls */}
//         <div className="flex justify-end mb-4">
//           {!isEditing ? (
//             <Button onClick={() => setIsEditing(true)} variant="outline">
//               <Edit2 className="mr-2 h-4 w-4" />
//               Edit Profile
//             </Button>
//           ) : (
//             <div className="space-x-2">
//               <Button onClick={handleSubmit} disabled={loading}>
//                 {loading ? (
//                   <Spinner size="sm" className="mr-2" />
//                 ) : (
//                   <Save className="mr-2 h-4 w-4" />
//                 )}
//                 Save Changes
//               </Button>
//               <Button onClick={handleCancel} variant="ghost">
//                 <X className="mr-2 h-4 w-4" />
//                 Cancel
//               </Button>
//             </div>
//           )}
//         </div>

//         {/* Alerts */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
//             {error}
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
//             {success}
//           </div>
//         )}

//         {/* Personal Info */}
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Personal Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {/* Name */}
//             <div className="flex items-center space-x-2">
//               <User size={18} className="text-gray-400" />
//               {isEditing ? (
//                 <div className="flex space-x-2 flex-1">
//                   <Input
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                   />
//                   <Input
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                   />
//                 </div>
//               ) : (
//                 <span>{fullName}</span>
//               )}
//             </div>

//             {/* Email */}
//             <div className="flex items-center space-x-2">
//               <Mail size={18} className="text-gray-400" />
//               {isEditing ? (
//                 <Input
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               ) : (
//                 <span>{email}</span>
//               )}
//             </div>

//             {/* Phone */}
//             <div className="flex items-center space-x-2">
//               <Phone size={18} className="text-gray-400" />
//               {isEditing ? (
//                 <Input
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                 />
//               ) : (
//                 <span>{phone || "No phone provided"}</span>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Role Specific */}
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               {role === "teacher"
//                 ? "Professional Details"
//                 : role === "parent"
//                   ? "Parent Address"
//                   : "Student Information"}
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             {role === "teacher" && (
//               <>
//                 <div className="flex items-start space-x-2">
//                   <BookOpen size={18} className="text-gray-400 mt-1" />
//                   {isEditing ? (
//                     <Textarea
//                       value={bio}
//                       onChange={(e) => setBio(e.target.value)}
//                     />
//                   ) : (
//                     <span>{bio || "No bio provided"}</span>
//                   )}
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Briefcase size={18} className="text-gray-400" />
//                   {isEditing ? (
//                     <Input
//                       type="number"
//                       value={experience}
//                       onChange={(e) => setExperience(e.target.value)}
//                     />
//                   ) : (
//                     <span>
//                       {experience
//                         ? `${experience} years`
//                         : "No experience provided"}
//                     </span>
//                   )}
//                 </div>
//               </>
//             )}

//             {role === "parent" && (
//               <div className="flex items-start space-x-2">
//                 <MapPin size={18} className="text-gray-400 mt-1" />
//                 {isEditing ? (
//                   <Textarea
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                   />
//                 ) : (
//                   <span>{address || "No address provided"}</span>
//                 )}
//               </div>
//             )}

//             {role === "student" && (
//               <div className="text-gray-600">
//                 Students can update their personal information above.
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

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
