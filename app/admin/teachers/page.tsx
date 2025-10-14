// // "use client";

// // import {useState} from "react";
// // import DashboardLayout from "@/app/admin/layout";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import {Button} from "@/components/ui/button";
// // import {Badge} from "@/components/ui/badge";
// // import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// // import {Input} from "@/components/ui/input";
// // import {Plus, Search, Mail, BookOpen, Edit, Trash2, Eye} from "lucide-react";
// // import {TeacherModal} from "@/components/admin/modals/teacher-modal";
// // import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
// // import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
// // import {useToast} from "@/hooks/use-toast";

// // export default function TeachersPage() {
// //   const {toast} = useToast();
// //   const [teachers, setTeachers] = useState([
// //     {
// //       id: 1,
// //       name: "Dr. Robert Smith",
// //       email: "r.smith@edu.com",
// //       specialties: ["Mathematics", "Physics"],
// //       courses: 5,
// //       experience: 15,
// //     },
// //     {
// //       id: 2,
// //       name: "Prof. Maria Garcia",
// //       email: "m.garcia@edu.com",
// //       specialties: ["Chemistry", "Biology"],
// //       courses: 4,
// //       experience: 12,
// //     },
// //     {
// //       id: 3,
// //       name: "Dr. James Wilson",
// //       email: "j.wilson@edu.com",
// //       specialties: ["English", "Literature"],
// //       courses: 6,
// //       experience: 10,
// //     },
// //     {
// //       id: 4,
// //       name: "Ms. Lisa Anderson",
// //       email: "l.anderson@edu.com",
// //       specialties: ["History", "Geography"],
// //       courses: 4,
// //       experience: 8,
// //     },
// //     {
// //       id: 5,
// //       name: "Mr. David Lee",
// //       email: "d.lee@edu.com",
// //       specialties: ["Computer Science"],
// //       courses: 3,
// //       experience: 6,
// //     },
// //   ]);

// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [teacherModalOpen, setTeacherModalOpen] = useState(false);
// //   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
// //   const [viewModalOpen, setViewModalOpen] = useState(false);
// //   const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

// //   const filteredTeachers = teachers.filter(
// //     (teacher) =>
// //       teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       teacher.specialties.some((s) =>
// //         s.toLowerCase().includes(searchQuery.toLowerCase())
// //       )
// //   );

// //   const handleAddTeacher = () => {
// //     setSelectedTeacher(null);
// //     setTeacherModalOpen(true);
// //   };

// //   const handleEditTeacher = (teacher: any) => {
// //     setSelectedTeacher(teacher);
// //     setTeacherModalOpen(true);
// //   };

// //   const handleViewTeacher = (teacher: any) => {
// //     setSelectedTeacher(teacher);
// //     setViewModalOpen(true);
// //   };

// //   const handleDeleteTeacher = (teacher: any) => {
// //     setSelectedTeacher(teacher);
// //     setDeleteModalOpen(true);
// //   };

// //   const handleSaveTeacher = (teacher: any) => {
// //     if (teacher.id) {
// //       setTeachers(teachers.map((t) => (t.id === teacher.id ? teacher : t)));
// //       toast({
// //         title: "Teacher Updated",
// //         description: `${teacher.name} has been updated successfully.`,
// //       });
// //     } else {
// //       const newTeacher = {
// //         ...teacher,
// //         id: Math.max(...teachers.map((t) => t.id)) + 1,
// //         courses: 0,
// //       };
// //       setTeachers([...teachers, newTeacher]);
// //       toast({
// //         title: "Teacher Added",
// //         description: `${teacher.name} has been added successfully.`,
// //       });
// //     }
// //   };

// //   const confirmDelete = () => {
// //     setTeachers(teachers.filter((t) => t.id !== selectedTeacher.id));
// //     toast({
// //       title: "Teacher Deleted",
// //       description: `${selectedTeacher.name} has been removed from the system.`,
// //       variant: "destructive",
// //     });
// //     setDeleteModalOpen(false);
// //   };

// //   return (
// //     <>
// //       <div className="space-y-6">
// //         {/* Header */}
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h1 className="text-3xl font-bold tracking-tight text-foreground">
// //               Teachers
// //             </h1>
// //             <p className="text-muted-foreground mt-1">
// //               Manage teacher profiles and assignments
// //             </p>
// //           </div>
// //           <Button onClick={handleAddTeacher}>
// //             <Plus className="mr-2 h-4 w-4" />
// //             Add Teacher
// //           </Button>
// //         </div>

// //         <Card>
// //           <CardContent className="pt-6">
// //             <div className="flex gap-4">
// //               <div className="relative flex-1">
// //                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
// //                 <Input
// //                   placeholder="Search teachers..."
// //                   className="pl-9"
// //                   value={searchQuery}
// //                   onChange={(e) => setSearchQuery(e.target.value)}
// //                 />
// //               </div>
// //               <Button variant="outline">Filter</Button>
// //             </div>
// //           </CardContent>
// //         </Card>

// //         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
// //           {filteredTeachers.map((teacher) => (
// //             <Card
// //               key={teacher.id}
// //               className="hover:shadow-lg transition-shadow">
// //               <CardHeader>
// //                 <div className="flex flex-col items-center text-center space-y-3">
// //                   <Avatar className="h-20 w-20">
// //                     <AvatarImage
// //                       src={`/.jpg?height=80&width=80&query=${teacher.name}`}
// //                     />
// //                     <AvatarFallback className="text-lg">
// //                       {teacher.name
// //                         .split(" ")
// //                         .map((n) => n[0])
// //                         .join("")}
// //                     </AvatarFallback>
// //                   </Avatar>
// //                   <div>
// //                     <CardTitle className="text-lg">{teacher.name}</CardTitle>
// //                     <CardDescription className="flex items-center justify-center gap-1 mt-1">
// //                       <Mail className="h-3 w-3" />
// //                       {teacher.email}
// //                     </CardDescription>
// //                   </div>
// //                 </div>
// //               </CardHeader>
// //               <CardContent>
// //                 <div className="space-y-4">
// //                   <div>
// //                     <p className="text-xs text-muted-foreground mb-2">
// //                       Specialties
// //                     </p>
// //                     <div className="flex flex-wrap gap-2">
// //                       {teacher.specialties.map((specialty) => (
// //                         <Badge key={specialty} variant="secondary">
// //                           {specialty}
// //                         </Badge>
// //                       ))}
// //                     </div>
// //                   </div>
// //                   <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
// //                     <div className="flex items-center gap-2 text-muted-foreground">
// //                       <BookOpen className="h-4 w-4" />
// //                       <span>Courses</span>
// //                     </div>
// //                     <span className="font-semibold text-foreground">
// //                       {teacher.courses}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center justify-between text-sm">
// //                     <span className="text-muted-foreground">Experience</span>
// //                     <span className="font-semibold text-foreground">
// //                       {teacher.experience} years
// //                     </span>
// //                   </div>
// //                   <div className="flex gap-2 mt-4">
// //                     <Button
// //                       className="flex-1 bg-transparent"
// //                       variant="outline"
// //                       size="sm"
// //                       onClick={() => handleViewTeacher(teacher)}>
// //                       <Eye className="mr-1 h-3 w-3" />
// //                       View
// //                     </Button>
// //                     <Button
// //                       variant="outline"
// //                       size="sm"
// //                       onClick={() => handleEditTeacher(teacher)}>
// //                       <Edit className="h-3 w-3" />
// //                     </Button>
// //                     <Button
// //                       variant="outline"
// //                       size="sm"
// //                       onClick={() => handleDeleteTeacher(teacher)}>
// //                       <Trash2 className="h-3 w-3 text-destructive" />
// //                     </Button>
// //                   </div>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           ))}
// //         </div>
// //       </div>

// //       <TeacherModal
// //         open={teacherModalOpen}
// //         onOpenChange={setTeacherModalOpen}
// //         teacher={selectedTeacher}
// //         onSave={handleSaveTeacher}
// //       />
// //       <DeleteConfirmationModal
// //         open={deleteModalOpen}
// //         onOpenChange={setDeleteModalOpen}
// //         onConfirm={confirmDelete}
// //         title="Delete Teacher"
// //         description={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
// //       />
// //       <ViewDetailsModal
// //         open={viewModalOpen}
// //         onOpenChange={setViewModalOpen}
// //         title="Teacher Details"
// //         data={selectedTeacher}
// //         type="teacher"
// //       />
// //     </>
// //   );
// // }

// "use client";

// import {useState, useEffect} from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
// import {Input} from "@/components/ui/input";
// import {Label} from "@/components/ui/label";
// import {Textarea} from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Plus,
//   Search,
//   Mail,
//   Phone,
//   BookOpen,
//   Edit,
//   Trash2,
//   Eye,
// } from "lucide-react";
// import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
// import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
// import {useToast} from "@/hooks/use-toast";

// const specialtiesOptions = [
//   "Mathematics",
//   "Physics",
//   "Chemistry",
//   "Biology",
//   "English",
//   "Literature",
//   "History",
//   "Geography",
//   "Computer Science",
// ];

// interface Teacher {
//   id: number;
//   name: string;
//   email: string;
//   phone?: string;
//   specialties: string[];
//   courses: number;
//   experience: number;
//   bio?: string;
//   profilePicture?: string | null;
// }

// interface TeacherModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   teacher?: Teacher | null;
//   onSave: (teacher: Partial<Teacher>) => void;
// }

// function TeacherModal({
//   open,
//   onOpenChange,
//   teacher,
//   onSave,
// }: TeacherModalProps) {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     experience: 0,
//     bio: "",
//     specialties: [] as string[],
//     profilePicture: null as string | null,
//   });
//   const [preview, setPreview] = useState<string | null>(null);

//   useEffect(() => {
//     if (teacher && teacher.id) {
//       setFormData({
//         name: teacher.name,
//         email: teacher.email,
//         phone: teacher.phone || "",
//         experience: teacher.experience,
//         bio: teacher.bio || "",
//         specialties: teacher.specialties || [],
//         profilePicture: teacher.profilePicture || null,
//       });
//       setPreview(teacher.profilePicture || null);
//     } else {
//       setFormData({
//         name: "",
//         email: "",
//         phone: "",
//         experience: 0,
//         bio: "",
//         specialties: [],
//         profilePicture: null,
//       });
//       setPreview(null);
//     }
//   }, [teacher]);

//   const toggleSpecialty = (spec: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       specialties: prev.specialties.includes(spec)
//         ? prev.specialties.filter((s) => s !== spec)
//         : [...prev.specialties, spec],
//     }));
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const result = reader.result as string;
//         setFormData((prev) => ({...prev, profilePicture: result}));
//         setPreview(result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = () => {
//     if (
//       !formData.name.trim() ||
//       !formData.email.trim() ||
//       formData.specialties.length === 0 ||
//       formData.experience <= 0
//     ) {
//       // In a real app, show toast error here
//       return;
//     }
//     onSave({
//       ...formData,
//       name: formData.name.trim(),
//       email: formData.email.trim(),
//       phone: formData.phone.trim() || undefined,
//       bio: formData.bio.trim() || undefined,
//     });
//     onOpenChange(false);
//   };

//   const isEditing = !!teacher?.id;
//   const subtitle = !isEditing ? "Add a new teacher to the system" : undefined;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? "Edit Teacher" : "Add New Teacher"}
//           </DialogTitle>
//           {subtitle && (
//             <p className="text-sm text-muted-foreground">{subtitle}</p>
//           )}
//         </DialogHeader>
//         <div className="space-y-4 py-4">
//           {/* Profile Picture */}
//           <div className="space-y-2">
//             <Label htmlFor="profile-picture">Profile Picture</Label>
//             <Input
//               id="profile-picture"
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//             />
//             {preview && (
//               <div className="mt-2 flex justify-center">
//                 <img
//                   src={preview}
//                   alt="Preview"
//                   className="w-24 h-24 object-cover rounded border"
//                 />
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Full Name *</Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData((prev) => ({...prev, name: e.target.value}))
//                 }
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email *</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData((prev) => ({...prev, email: e.target.value}))
//                 }
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="phone">Phone Number</Label>
//               <Input
//                 id="phone"
//                 value={formData.phone}
//                 onChange={(e) =>
//                   setFormData((prev) => ({...prev, phone: e.target.value}))
//                 }
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="experience">Years of Experience *</Label>
//               <Input
//                 id="experience"
//                 type="number"
//                 min="0"
//                 value={formData.experience}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     experience: parseInt(e.target.value) || 0,
//                   }))
//                 }
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label>Specialties *</Label>
//             <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-background">
//               {specialtiesOptions.map((spec) => (
//                 <div key={spec} className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     id={spec}
//                     checked={formData.specialties.includes(spec)}
//                     onChange={() => toggleSpecialty(spec)}
//                     className="h-4 w-4 rounded"
//                   />
//                   <Label
//                     htmlFor={spec}
//                     className="text-sm cursor-pointer capitalize">
//                     {spec}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//             {formData.specialties.length === 0 && (
//               <p className="text-xs text-destructive">
//                 Please select at least one specialty.
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="bio">Bio</Label>
//             <Textarea
//               id="bio"
//               value={formData.bio}
//               onChange={(e) =>
//                 setFormData((prev) => ({...prev, bio: e.target.value}))
//               }
//               placeholder="Enter a brief bio..."
//             />
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit}>
//             {isEditing ? "Update Teacher" : "Add Teacher"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function TeachersPage() {
//   const {toast} = useToast();
//   const [teachers, setTeachers] = useState<Teacher[]>([
//     {
//       id: 1,
//       name: "Dr. Robert Smith",
//       email: "r.smith@edu.com",
//       phone: "",
//       specialties: ["Mathematics", "Physics"],
//       courses: 5,
//       experience: 15,
//       bio: "",
//       profilePicture: null,
//     },
//     {
//       id: 2,
//       name: "Prof. Maria Garcia",
//       email: "m.garcia@edu.com",
//       phone: "",
//       specialties: ["Chemistry", "Biology"],
//       courses: 4,
//       experience: 12,
//       bio: "",
//       profilePicture: null,
//     },
//     {
//       id: 3,
//       name: "Dr. James Wilson",
//       email: "j.wilson@edu.com",
//       phone: "",
//       specialties: ["English", "Literature"],
//       courses: 6,
//       experience: 10,
//       bio: "",
//       profilePicture: null,
//     },
//     {
//       id: 4,
//       name: "Ms. Lisa Anderson",
//       email: "l.anderson@edu.com",
//       phone: "",
//       specialties: ["History", "Geography"],
//       courses: 4,
//       experience: 8,
//       bio: "",
//       profilePicture: null,
//     },
//     {
//       id: 5,
//       name: "Mr. David Lee",
//       email: "d.lee@edu.com",
//       phone: "",
//       specialties: ["Computer Science"],
//       courses: 3,
//       experience: 6,
//       bio: "",
//       profilePicture: null,
//     },
//   ]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [teacherModalOpen, setTeacherModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

//   const filteredTeachers = teachers.filter(
//     (teacher) =>
//       teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (teacher.phone &&
//         teacher.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
//       teacher.specialties.some((s) =>
//         s.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//   );

//   const handleAddTeacher = () => {
//     setSelectedTeacher(null);
//     setTeacherModalOpen(true);
//   };

//   const handleEditTeacher = (teacher: Teacher) => {
//     setSelectedTeacher(teacher);
//     setTeacherModalOpen(true);
//   };

//   const handleViewTeacher = (teacher: Teacher) => {
//     setSelectedTeacher(teacher);
//     setViewModalOpen(true);
//   };

//   const handleDeleteTeacher = (teacher: Teacher) => {
//     setSelectedTeacher(teacher);
//     setDeleteModalOpen(true);
//   };

//   const handleSaveTeacher = (teacherData: Partial<Teacher>) => {
//     const fullTeacher = {
//       ...selectedTeacher,
//       ...teacherData,
//       courses: selectedTeacher?.courses ?? 0,
//     } as Teacher;

//     if (selectedTeacher?.id) {
//       setTeachers(
//         teachers.map((t) => (t.id === selectedTeacher.id ? fullTeacher : t))
//       );
//       toast({
//         title: "Teacher Updated",
//         description: `${fullTeacher.name} has been updated successfully.`,
//       });
//     } else {
//       const newTeacher: Teacher = {
//         ...fullTeacher,
//         id: Math.max(...teachers.map((t) => t.id)) + 1,
//         courses: 0,
//       };
//       setTeachers([...teachers, newTeacher]);
//       toast({
//         title: "Teacher Added",
//         description: `${newTeacher.name} has been added successfully.`,
//       });
//     }
//   };

//   const confirmDelete = () => {
//     if (selectedTeacher) {
//       setTeachers(teachers.filter((t) => t.id !== selectedTeacher.id));
//       toast({
//         title: "Teacher Deleted",
//         description: `${selectedTeacher.name} has been removed from the system.`,
//         variant: "destructive",
//       });
//     }
//     setDeleteModalOpen(false);
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Teachers
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage teacher profiles and assignments
//             </p>
//           </div>
//           <Button onClick={handleAddTeacher}>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Teacher
//           </Button>
//         </div>

//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex gap-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search teachers..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Button variant="outline">Filter</Button>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {filteredTeachers.map((teacher) => (
//             <Card
//               key={teacher.id}
//               className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <div className="flex flex-col items-center text-center space-y-3">
//                   <Avatar className="h-20 w-20">
//                     <AvatarImage
//                       src={
//                         teacher.profilePicture ||
//                         `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                           teacher.name
//                         )}&size=80&background=007bff&color=fff`
//                       }
//                     />
//                     <AvatarFallback className="text-lg">
//                       {teacher.name
//                         .split(" ")
//                         .map((n) => n[0])
//                         .join("")}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <CardTitle className="text-lg">{teacher.name}</CardTitle>
//                     <div className="space-y-1">
//                       <CardDescription className="flex items-center justify-center gap-1">
//                         <Mail className="h-3 w-3" />
//                         {teacher.email}
//                       </CardDescription>
//                       {teacher.phone && (
//                         <CardDescription className="flex items-center justify-center gap-1">
//                           <Phone className="h-3 w-3" />
//                           {teacher.phone}
//                         </CardDescription>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-xs text-muted-foreground mb-2">
//                       Specialties
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       {teacher.specialties.map((specialty) => (
//                         <Badge key={specialty} variant="secondary">
//                           {specialty}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
//                     <div className="flex items-center gap-2 text-muted-foreground">
//                       <BookOpen className="h-4 w-4" />
//                       <span>Courses</span>
//                     </div>
//                     <span className="font-semibold text-foreground">
//                       {teacher.courses}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-muted-foreground">Experience</span>
//                     <span className="font-semibold text-foreground">
//                       {teacher.experience} years
//                     </span>
//                   </div>
//                   <div className="flex gap-2 mt-4">
//                     <Button
//                       className="flex-1 bg-transparent"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleViewTeacher(teacher)}>
//                       <Eye className="mr-1 h-3 w-3" />
//                       View
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleEditTeacher(teacher)}>
//                       <Edit className="h-3 w-3" />
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleDeleteTeacher(teacher)}>
//                       <Trash2 className="h-3 w-3 text-destructive" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       <TeacherModal
//         open={teacherModalOpen}
//         onOpenChange={setTeacherModalOpen}
//         teacher={selectedTeacher}
//         onSave={handleSaveTeacher}
//       />
//       <DeleteConfirmationModal
//         open={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         onConfirm={confirmDelete}
//         title="Delete Teacher"
//         description={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
//       />
//       <ViewDetailsModal
//         open={viewModalOpen}
//         onOpenChange={setViewModalOpen}
//         title="Teacher Details"
//         data={selectedTeacher}
//         type="teacher"
//       />
//     </>
//   );
// }

"use client";

import {useState, useEffect} from "react";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Mail,
  Phone,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Upload,
  Camera,
} from "lucide-react";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {useToast} from "@/hooks/use-toast";

const specialtiesOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Literature",
  "History",
  "Geography",
  "Computer Science",
];

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  courses: number;
  experience: number;
  bio?: string;
  profilePicture?: string | null;
}

interface TeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Teacher | null;
  onSave: (teacher: Partial<Teacher>) => void;
}

function TeacherModal({
  open,
  onOpenChange,
  teacher,
  onSave,
}: TeacherModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: 0,
    bio: "",
    specialties: [] as string[],
    profilePicture: null as string | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState({} as Record<string, string>);

  useEffect(() => {
    if (teacher && teacher.id) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || "",
        experience: teacher.experience,
        bio: teacher.bio || "",
        specialties: teacher.specialties || [],
        profilePicture: teacher.profilePicture || null,
      });
      setPreview(teacher.profilePicture || null);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        experience: 0,
        bio: "",
        specialties: [],
        profilePicture: null,
      });
      setPreview(null);
    }
    setErrors({});
  }, [teacher]);

  const toggleSpecialty = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s !== spec)
        : [...prev.specialties, spec],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({...prev, profilePicture: result}));
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid.";
    if (formData.specialties.length === 0)
      newErrors.specialties = "At least one specialty is required.";
    if (formData.experience <= 0)
      newErrors.experience = "Years of experience must be greater than 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      bio: formData.bio.trim() || undefined,
    });
    onOpenChange(false);
  };

  const isEditing = !!teacher?.id;
  const subtitle = !isEditing ? "Add a new teacher to the system" : undefined;

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
      w-[95vw] sm:w-full max-w-md sm:max-w-lg p-0 
      h-[90vh] sm:h-auto max-h-[95vh] 
      overflow-hidden rounded-xl
    ">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            {isEditing ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="px-4 sm:px-6 py-4 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[calc(95vh-160px)]">
          {/* Profile Picture Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Profile Picture</Label>
            <div className="flex flex-col items-center space-y-2">
              <label
                htmlFor="profile-picture"
                className={`
              relative cursor-pointer rounded-full border-2 border-dashed transition-all duration-200 flex items-center justify-center
              ${
                preview
                  ? "w-24 h-24 sm:w-28 sm:h-28 border-gray-200 bg-white"
                  : "w-20 h-20 sm:w-24 sm:h-24 border-gray-300 bg-gray-50 hover:bg-gray-100"
              }
            `}>
                {preview ? (
                  <>
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={preview}
                        className="rounded-full object-cover"
                      />
                      <AvatarFallback className="text-base font-semibold bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 space-y-1">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs font-medium">Upload</span>
                  </div>
                )}
              </label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 2MB (optional)
              </p>
            </div>
          </div>

          {/* Name and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({...prev, name: e.target.value}))
                }
                className={
                  errors.name
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({...prev, email: e.target.value}))
                }
                className={
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone and Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({...prev, phone: e.target.value}))
                }
                placeholder="e.g., +234 812 345 6789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium">
                Years of Experience *
              </Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experience: parseInt(e.target.value) || 0,
                  }))
                }
                className={
                  errors.experience
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.experience && (
                <p className="text-xs text-destructive">{errors.experience}</p>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Specialties *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-3 border rounded-md bg-background">
              {specialtiesOptions.map((spec) => (
                <div
                  key={spec}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer">
                  <input
                    type="checkbox"
                    id={spec}
                    checked={formData.specialties.includes(spec)}
                    onChange={() => toggleSpecialty(spec)}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-primary"
                  />
                  <Label
                    htmlFor={spec}
                    className="text-sm cursor-pointer capitalize flex-1">
                    {spec}
                  </Label>
                </div>
              ))}
            </div>
            {errors.specialties && (
              <p className="text-xs text-destructive">{errors.specialties}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2 mb-10">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({...prev, bio: e.target.value}))
              }
              placeholder="Enter a brief bio about the teacher..."
              rows={3}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter
          className="
    sticky bottom-0 left-0 right-0 
    px-4 sm:px-6 py-4 
    border-t bg-background/95 backdrop-blur-sm
    flex flex-col-reverse sm:flex-row 
    gap-3 sm:gap-2 
    sm:justify-end sm:items-center
    z-10
  ">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="
      w-full sm:w-auto 
      text-sm font-medium 
      border-gray-300 hover:bg-muted
      transition-all duration-200
    ">
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            className="
      w-full sm:w-auto 
      text-sm font-semibold 
      bg-primary hover:bg-primary/90 
      text-primary-foreground
      transition-all duration-200
    ">
            {isEditing ? "Update Teacher" : "Add Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ViewDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data?: Teacher | null;
  type: string;
}

function ViewDetailsModal({
  open,
  onOpenChange,
  title,
  data,
  type,
}: ViewDetailsModalProps) {
  if (!data) return null;

  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={data.profilePicture || undefined}
                className="rounded-full"
              />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{data.name}</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{data.email}</span>
            </div>
            {data.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{data.phone}</span>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Specialties</p>
              <div className="flex flex-wrap gap-1">
                {data.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Experience: </span>
              <span className="font-medium">{data.experience} years</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Courses</span>
              <span className="font-medium">{data.courses}</span>
            </div>
            {data.bio && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">{data.bio}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TeachersPage() {
  const {toast} = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 1,
      name: "Dr. Robert Smith",
      email: "r.smith@edu.com",
      phone: "",
      specialties: ["Mathematics", "Physics"],
      courses: 5,
      experience: 15,
      bio: "",
      profilePicture: null,
    },
    {
      id: 2,
      name: "Prof. Maria Garcia",
      email: "m.garcia@edu.com",
      phone: "",
      specialties: ["Chemistry", "Biology"],
      courses: 4,
      experience: 12,
      bio: "",
      profilePicture: null,
    },
    {
      id: 3,
      name: "Dr. James Wilson",
      email: "j.wilson@edu.com",
      phone: "",
      specialties: ["English", "Literature"],
      courses: 6,
      experience: 10,
      bio: "",
      profilePicture: null,
    },
    {
      id: 4,
      name: "Ms. Lisa Anderson",
      email: "l.anderson@edu.com",
      phone: "",
      specialties: ["History", "Geography"],
      courses: 4,
      experience: 8,
      bio: "",
      profilePicture: null,
    },
    {
      id: 5,
      name: "Mr. David Lee",
      email: "d.lee@edu.com",
      phone: "",
      specialties: ["Computer Science"],
      courses: 3,
      experience: 6,
      bio: "",
      profilePicture: null,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.phone &&
        teacher.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teacher.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setTeacherModalOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherModalOpen(true);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewModalOpen(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteModalOpen(true);
  };

  const handleSaveTeacher = (teacherData: Partial<Teacher>) => {
    const fullTeacher = {
      ...selectedTeacher,
      ...teacherData,
      courses: selectedTeacher?.courses ?? 0,
    } as Teacher;

    if (selectedTeacher?.id) {
      setTeachers(
        teachers.map((t) => (t.id === selectedTeacher.id ? fullTeacher : t))
      );
      toast({
        title: "Teacher Updated",
        description: `${fullTeacher.name} has been updated successfully.`,
      });
    } else {
      const newTeacher: Teacher = {
        ...fullTeacher,
        id: Math.max(...teachers.map((t) => t.id)) + 1,
        courses: 0,
      };
      setTeachers([...teachers, newTeacher]);
      toast({
        title: "Teacher Added",
        description: `${newTeacher.name} has been added successfully.`,
      });
    }
  };

  const confirmDelete = () => {
    if (selectedTeacher) {
      setTeachers(teachers.filter((t) => t.id !== selectedTeacher.id));
      toast({
        title: "Teacher Deleted",
        description: `${selectedTeacher.name} has been removed from the system.`,
        variant: "destructive",
      });
    }
    setDeleteModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Teachers
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage teacher profiles and assignments
            </p>
          </div>
          <Button onClick={handleAddTeacher}>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => {
            const initials = teacher.name
              .split(" ")
              .map((n) => n[0])
              .join("");
            return (
              <Card
                key={teacher.id}
                className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={teacher.profilePicture || undefined}
                        className="rounded-full"
                      />
                      <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{teacher.name}</CardTitle>
                      <div className="space-y-1">
                        <CardDescription className="flex items-center justify-center gap-1">
                          <Mail className="h-3 w-3" />
                          {teacher.email}
                        </CardDescription>
                        {teacher.phone && (
                          <CardDescription className="flex items-center justify-center gap-1">
                            <Phone className="h-3 w-3" />
                            {teacher.phone}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Specialties
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>Courses</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {teacher.courses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-semibold text-foreground">
                        {teacher.experience} years
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1 bg-transparent"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTeacher(teacher)}>
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTeacher(teacher)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTeacher(teacher)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <TeacherModal
        open={teacherModalOpen}
        onOpenChange={setTeacherModalOpen}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
      />
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Teacher Details"
        data={selectedTeacher}
        type="teacher"
      />
    </>
  );
}
