// "use client";

// import {useState} from "react";
// import DashboardLayout from "@/app/admin/layout";
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
// import {
//   Plus,
//   Search,
//   Users,
//   BookOpen,
//   Clock,
//   Edit,
//   Trash2,
//   Eye,
// } from "lucide-react";
// import {CourseModal} from "@/components/admin/modals/course-modal";
// import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
// import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
// import {useToast} from "@/hooks/use-toast";

// export default function CoursesPage() {
//   const {toast} = useToast();
//   const [courses, setCourses] = useState([
//     {
//       id: 1,
//       name: "Advanced Mathematics",
//       subject: "Mathematics",
//       teacher: "Dr. Robert Smith",
//       classroom: "Grade 12A",
//       students: 27,
//       modules: 12,
//       status: "active",
//       progress: 65,
//     },
//     {
//       id: 2,
//       name: "Quantum Physics",
//       subject: "Physics",
//       teacher: "Prof. Maria Garcia",
//       classroom: "Grade 11A",
//       students: 25,
//       modules: 10,
//       status: "active",
//       progress: 45,
//     },
//     {
//       id: 3,
//       name: "Organic Chemistry",
//       subject: "Chemistry",
//       teacher: "Prof. Maria Garcia",
//       classroom: "Grade 11B",
//       students: 23,
//       modules: 8,
//       status: "active",
//       progress: 72,
//     },
//     {
//       id: 4,
//       name: "English Literature",
//       subject: "English",
//       teacher: "Dr. James Wilson",
//       classroom: "Grade 10A",
//       students: 32,
//       modules: 15,
//       status: "active",
//       progress: 38,
//     },
//     {
//       id: 5,
//       name: "Web Development",
//       subject: "Computer Science",
//       teacher: "Mr. David Lee",
//       classroom: "Grade 12B",
//       students: 24,
//       modules: 20,
//       status: "active",
//       progress: 55,
//     },
//     {
//       id: 6,
//       name: "World History",
//       subject: "History",
//       teacher: "Ms. Lisa Anderson",
//       classroom: "Grade 10B",
//       students: 28,
//       modules: 14,
//       status: "active",
//       progress: 80,
//     },
//   ]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [courseModalOpen, setCourseModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState<any>(null);

//   const filteredCourses = courses.filter(
//     (course) =>
//       course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       course.teacher.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleAddCourse = () => {
//     setSelectedCourse(null);
//     setCourseModalOpen(true);
//   };

//   const handleEditCourse = (course: any) => {
//     setSelectedCourse(course);
//     setCourseModalOpen(true);
//   };

//   const handleViewCourse = (course: any) => {
//     setSelectedCourse(course);
//     setViewModalOpen(true);
//   };

//   const handleDeleteCourse = (course: any) => {
//     setSelectedCourse(course);
//     setDeleteModalOpen(true);
//   };

//   const handleSaveCourse = (course: any) => {
//     if (course.id) {
//       setCourses(courses.map((c) => (c.id === course.id ? course : c)));
//       toast({
//         title: "Course Updated",
//         description: `${course.name} has been updated successfully.`,
//       });
//     } else {
//       const newCourse = {
//         ...course,
//         id: Math.max(...courses.map((c) => c.id)) + 1,
//         students: 0,
//         modules: 0,
//         progress: 0,
//       };
//       setCourses([...courses, newCourse]);
//       toast({
//         title: "Course Created",
//         description: `${course.name} has been created successfully.`,
//       });
//     }
//   };

//   const confirmDelete = () => {
//     setCourses(courses.filter((c) => c.id !== selectedCourse.id));
//     toast({
//       title: "Course Deleted",
//       description: `${selectedCourse.name} has been removed from the system.`,
//       variant: "destructive",
//     });
//     setDeleteModalOpen(false);
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Courses
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage courses and learning content
//             </p>
//           </div>
//           <Button onClick={handleAddCourse}>
//             <Plus className="mr-2 h-4 w-4" />
//             Create Course
//           </Button>
//         </div>

//         <div className="grid gap-4 md:grid-cols-4">
//           <Card className="md:col-span-2">
//             <CardContent className="pt-6">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search courses..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Active Courses
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">156</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Total Enrollments
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">3,421</div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           {filteredCourses.map((course) => (
//             <Card key={course.id} className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <CardTitle className="text-xl">{course.name}</CardTitle>
//                     <CardDescription className="mt-1">
//                       <Badge variant="secondary">{course.subject}</Badge>
//                     </CardDescription>
//                   </div>
//                   <Badge
//                     variant={
//                       course.status === "active" ? "default" : "secondary"
//                     }>
//                     {course.status}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {/* Teacher Info */}
//                   <div className="flex items-center gap-3 pb-3 border-b border-border">
//                     <Avatar className="h-10 w-10">
//                       <AvatarImage
//                         src={`/.jpg?height=40&width=40&query=${course.teacher}`}
//                       />
//                       <AvatarFallback>
//                         {course.teacher
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="text-sm font-medium text-foreground">
//                         {course.teacher}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {course.classroom}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Course Stats */}
//                   <div className="grid grid-cols-3 gap-4 text-sm">
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <Users className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.students}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Students
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.modules}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Modules
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <Clock className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.progress}%
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Progress
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button
//                       className="flex-1 bg-transparent"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleViewCourse(course)}>
//                       <Eye className="mr-1 h-3 w-3" />
//                       View
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleEditCourse(course)}>
//                       <Edit className="h-3 w-3" />
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleDeleteCourse(course)}>
//                       <Trash2 className="h-3 w-3 text-destructive" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       <CourseModal
//         open={courseModalOpen}
//         onOpenChange={setCourseModalOpen}
//         course={selectedCourse}
//         onSave={handleSaveCourse}
//       />
//       <DeleteConfirmationModal
//         open={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         onConfirm={confirmDelete}
//         title="Delete Course"
//         description={`Are you sure you want to delete ${selectedCourse?.name}? This action cannot be undone.`}
//       />
//       <ViewDetailsModal
//         open={viewModalOpen}
//         onOpenChange={setViewModalOpen}
//         title="Course Details"
//         data={selectedCourse}
//         type="course"
//       />
//     </>
//   );
// }

// "use client";

// import {useEffect, useState} from "react";
// import DashboardLayout from "@/app/admin/layout";
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
// import {
//   Plus,
//   Search,
//   Users,
//   BookOpen,
//   Clock,
//   Edit,
//   Trash2,
//   Eye,
// } from "lucide-react";
// import {CourseModal} from "@/components/admin/modals/course-modal";
// import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
// import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
// import {useToast} from "@/hooks/use-toast";

// const BASE_URL = "https://texagonbackend.epichouse.online/orgs";

// export default function CoursesPage() {
//   const {toast} = useToast();
//   const [courses, setCourses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [courseModalOpen, setCourseModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState<any>(null);

//   const apiKey = process.env.NEXT_PUBLIC_API_KEY;
//   const sessionToken = process.env.NEXT_PUBLIC_SESSION_TOKEN;

//   // Fetch all courses
//   useEffect(() => {
//     async function fetchCourses() {
//       try {
//         const response = await fetch(`${BASE_URL}/courses/`, {
//           headers: {
//             Authorization: `Bearer ${sessionToken}`,
//             "X-API-Key": apiKey,
//           },
//         });

//         if (!response.ok) throw new Error("Failed to load courses");
//         const data = await response.json();
//         setCourses(data?.results || data);
//       } catch (error: any) {
//         toast({
//           title: "Error Loading Courses",
//           description: error.message,
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchCourses();
//   }, []);

//   // Filter courses
//   const filteredCourses = courses.filter(
//     (course) =>
//       course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       course.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       course.teacher?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Create or Update course
//   const handleSaveCourse = async (course: any) => {
//     try {
//       const method = course.id ? "PUT" : "POST";
//       const url = course.id
//         ? `${BASE_URL}/courses/${course.id}/`
//         : `${BASE_URL}/courses/`;

//       const response = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionToken}`,
//           "X-API-Key": apiKey,
//         },
//         body: JSON.stringify(course),
//       });

//       if (!response.ok) throw new Error("Failed to save course");
//       const savedCourse = await response.json();

//       setCourses((prev) =>
//         course.id
//           ? prev.map((c) => (c.id === course.id ? savedCourse : c))
//           : [...prev, savedCourse]
//       );

//       toast({
//         title: course.id ? "Course Updated" : "Course Created",
//         description: `${savedCourse.name} saved successfully.`,
//       });
//       setCourseModalOpen(false);
//     } catch (error: any) {
//       toast({
//         title: "Error Saving Course",
//         description: error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   // Delete course
//   const confirmDelete = async () => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/courses/${selectedCourse.id}/`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${sessionToken}`,
//             "X-API-Key": apiKey,
//           },
//         }
//       );

//       if (!response.ok) throw new Error("Failed to delete course");
//       setCourses(courses.filter((c) => c.id !== selectedCourse.id));

//       toast({
//         title: "Course Deleted",
//         description: `${selectedCourse.name} has been removed.`,
//         variant: "destructive",
//       });
//       setDeleteModalOpen(false);
//     } catch (error: any) {
//       toast({
//         title: "Error Deleting Course",
//         description: error.message,
//         variant: "destructive",
//       });
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-96">
//         <p className="text-muted-foreground text-lg">Loading courses...</p>
//       </div>
//     );

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Courses
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage all courses in the organization
//             </p>
//           </div>
//           <Button onClick={() => setCourseModalOpen(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             Create Course
//           </Button>
//         </div>

//         {/* Search and Stats */}
//         <div className="grid gap-4 md:grid-cols-4">
//           <Card className="md:col-span-2">
//             <CardContent className="pt-6">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search courses..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Total Courses
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">
//                 {courses.length}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Course Cards */}
//         <div className="grid gap-6 md:grid-cols-2">
//           {filteredCourses.map((course) => (
//             <Card key={course.id} className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <CardTitle className="text-xl">{course.name}</CardTitle>
//                     <CardDescription className="mt-1">
//                       <Badge variant="secondary">
//                         {course.subject || "Unassigned"}
//                       </Badge>
//                     </CardDescription>
//                   </div>
//                   <Badge variant="default">Active</Badge>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {/* Teacher Info */}
//                   <div className="flex items-center gap-3 pb-3 border-b border-border">
//                     <Avatar className="h-10 w-10">
//                       <AvatarFallback>
//                         {course.teacher?.slice(0, 2).toUpperCase() || "NA"}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="text-sm font-medium text-foreground">
//                         {course.teacher || "Unassigned"}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {course.classroom || "No classroom"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Course Stats */}
//                   <div className="grid grid-cols-3 gap-4 text-sm">
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <Users className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.students_count || 0}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Students
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.modules_count || 0}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Modules
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <Clock className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.progress || 0}%
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Progress
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button
//                       className="flex-1 bg-transparent"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedCourse(course);
//                         setViewModalOpen(true);
//                       }}>
//                       <Eye className="mr-1 h-3 w-3" />
//                       View
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedCourse(course);
//                         setCourseModalOpen(true);
//                       }}>
//                       <Edit className="h-3 w-3" />
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedCourse(course);
//                         setDeleteModalOpen(true);
//                       }}>
//                       <Trash2 className="h-3 w-3 text-destructive" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Modals */}
//       <CourseModal
//         open={courseModalOpen}
//         onOpenChange={setCourseModalOpen}
//         course={selectedCourse}
//         onSave={handleSaveCourse}
//       />
//       <DeleteConfirmationModal
//         open={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         onConfirm={confirmDelete}
//         title="Delete Course"
//         description={`Are you sure you want to delete ${selectedCourse?.name}? This action cannot be undone.`}
//       />
//       <ViewDetailsModal
//         open={viewModalOpen}
//         onOpenChange={setViewModalOpen}
//         title="Course Details"
//         data={selectedCourse}
//         type="course"
//       />
//     </>
//   );
// }

// "use client";

// import {useState, useEffect} from "react";
// import DashboardLayout from "@/app/admin/layout";
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
// import {
//   Plus,
//   Search,
//   Users,
//   BookOpen,
//   Clock,
//   Edit,
//   Trash2,
//   Eye,
//   Loader2,
// } from "lucide-react";
// import {CourseModal} from "@/components/admin/modals/course-modal";
// import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
// import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
// import {useToast} from "@/hooks/use-toast";

// interface Course {
//   id: number;
//   name: string;
//   subject: string;
//   teacher: string;
//   classroom: string;
//   students: number;
//   modules: number;
//   status: "active" | "inactive";
//   progress: number;
// }

// interface Options {
//   subjects: {id: number; name: string}[];
//   classrooms: {id: number; name: string}[];
//   teachers: {id: number; name: string; email: string}[];
// }

// interface Stats {
//   active_courses: number;
//   total_enrollments: number;
// }

// export default function CoursesPage() {
//   const {toast} = useToast();
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [stats, setStats] = useState<Stats>({
//     active_courses: 0,
//     total_enrollments: 0,
//   });
//   const [options, setOptions] = useState<Options>({
//     subjects: [],
//     classrooms: [],
//     teachers: [],
//   });
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [courseModalOpen, setCourseModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

//   const fetchStats = async () => {
//     try {
//       const res = await fetch("/api/admin/courses/stats");
//       if (res.ok) {
//         const data = await res.json();
//         setStats(data);
//       } else {
//         toast({
//           title: "Error",
//           description: "Failed to fetch course stats.",
//           variant: "destructive",
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching stats:", err);
//       toast({
//         title: "Error",
//         description: "Failed to fetch course stats.",
//         variant: "destructive",
//       });
//     }
//   };

//   const fetchOptions = async () => {
//     try {
//       const res = await fetch("/api/admin/courses/options");
//       if (res.ok) {
//         const data = await res.json();
//         setOptions(data);
//       }
//     } catch (err) {
//       console.error("Error fetching options:", err);
//     }
//   };

//   const fetchCourses = async (
//     search = "",
//     status = "",
//     page = 1,
//     page_size = 100
//   ) => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({
//         search,
//         status,
//         page: page.toString(),
//         page_size: page_size.toString(),
//       });
//       const res = await fetch(`/api/admin/courses?${params}`);
//       if (res.ok) {
//         const data = await res.json();
//         setCourses(data.results || []);
//       } else {
//         const errData = await res.json();
//         toast({
//           title: "Error",
//           description: errData.detail || "Failed to fetch courses.",
//           variant: "destructive",
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching courses:", err);
//       toast({
//         title: "Error",
//         description: "Failed to fetch courses.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats();
//     fetchOptions();
//     fetchCourses(searchQuery);
//   }, []);

//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       fetchCourses(searchQuery);
//     }, 300);
//     return () => clearTimeout(timeoutId);
//   }, [searchQuery]);

//   const handleAddCourse = () => {
//     setSelectedCourse(null);
//     setCourseModalOpen(true);
//   };

//   const handleEditCourse = (course: Course) => {
//     setSelectedCourse(course);
//     setCourseModalOpen(true);
//   };

//   const handleViewCourse = async (course: Course) => {
//     try {
//       const res = await fetch(`/api/admin/courses/${course.id}`);
//       if (res.ok) {
//         const data = await res.json();
//         setSelectedCourse(data);
//         setViewModalOpen(true);
//       } else {
//         const errData = await res.json();
//         toast({
//           title: "Error",
//           description: errData.detail || "Failed to fetch course details.",
//           variant: "destructive",
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching course details:", err);
//       toast({
//         title: "Error",
//         description: "Failed to fetch course details.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDeleteCourse = (course: Course) => {
//     setSelectedCourse(course);
//     setDeleteModalOpen(true);
//   };

//   const handleSaveCourse = async (course: Course) => {
//     try {
//       let res;
//       if (course.id) {
//         res = await fetch(`/api/admin/courses/${course.id}/update`, {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(course),
//         });
//         toast({
//           title: "Course Updated",
//           description: `${course.name} has been updated successfully.`,
//         });
//       } else {
//         res = await fetch("/api/admin/courses", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(course),
//         });
//         toast({
//           title: "Course Created",
//           description: `${course.name} has been created successfully.`,
//         });
//       }
//       if (!res.ok) {
//         const errData = await res.json();
//         toast({
//           title: "Error",
//           description: errData.detail || "Failed to save course.",
//           variant: "destructive",
//         });
//         return;
//       }
//       fetchCourses(searchQuery);
//     } catch (err) {
//       console.error("Error saving course:", err);
//       toast({
//         title: "Error",
//         description: "Failed to save course.",
//         variant: "destructive",
//       });
//     }
//     setCourseModalOpen(false);
//   };

//   const confirmDelete = async () => {
//     if (!selectedCourse) return;
//     try {
//       const res = await fetch(
//         `/api/admin/courses/${selectedCourse.id}/delete`,
//         {
//           method: "DELETE",
//         }
//       );
//       if (res.ok) {
//         const data = await res.json();
//         toast({
//           title: "Course Deleted",
//           description:
//             data.detail ||
//             `${selectedCourse.name} has been removed from the system.`,
//         });
//         fetchCourses(searchQuery);
//       } else {
//         const errData = await res.json();
//         toast({
//           title: res.status === 400 ? "Cannot Delete" : "Error",
//           description: errData.detail || "Failed to delete course.",
//           variant: "destructive",
//         });
//       }
//     } catch (err) {
//       console.error("Error deleting course:", err);
//       toast({
//         title: "Error",
//         description: "Failed to delete course.",
//         variant: "destructive",
//       });
//     }
//     setDeleteModalOpen(false);
//   };

//   if (loading && courses.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Courses
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage courses and learning content
//             </p>
//           </div>
//           <Button onClick={handleAddCourse}>
//             <Plus className="mr-2 h-4 w-4" />
//             Create Course
//           </Button>
//         </div>

//         <div className="grid gap-4 md:grid-cols-4">
//           <Card className="md:col-span-2">
//             <CardContent className="pt-6">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search courses..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Active Courses
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">
//                 {stats.active_courses}
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Total Enrollments
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">
//                 {stats.total_enrollments}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           {courses.map((course) => (
//             <Card key={course.id} className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <CardTitle className="text-xl">{course.name}</CardTitle>
//                     <CardDescription className="mt-1">
//                       <Badge variant="secondary">{course.subject}</Badge>
//                     </CardDescription>
//                   </div>
//                   <Badge
//                     variant={
//                       course.status === "active" ? "default" : "secondary"
//                     }>
//                     {course.status}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {/* Teacher Info */}
//                   <div className="flex items-center gap-3 pb-3 border-b border-border">
//                     <Avatar className="h-10 w-10">
//                       <AvatarImage
//                         src={`/.jpg?height=40&width=40&query=${course.teacher}`}
//                       />
//                       <AvatarFallback>
//                         {course.teacher
//                           .split(" ")
//                           .map((n: string) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="text-sm font-medium text-foreground">
//                         {course.teacher}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {course.classroom}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Course Stats */}
//                   <div className="grid grid-cols-3 gap-4 text-sm">
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <Users className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.students}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Students
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.modules}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Modules
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
//                       <Clock className="h-4 w-4 text-muted-foreground mb-1" />
//                       <span className="font-semibold text-foreground">
//                         {course.progress}%
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         Progress
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button
//                       className="flex-1 bg-transparent"
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleViewCourse(course)}>
//                       <Eye className="mr-1 h-3 w-3" />
//                       View
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleEditCourse(course)}>
//                       <Edit className="h-3 w-3" />
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleDeleteCourse(course)}>
//                       <Trash2 className="h-3 w-3 text-destructive" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//           {loading && courses.length > 0 && (
//             <div className="col-span-full flex justify-center py-8">
//               <Loader2 className="h-6 w-6 animate-spin" />
//             </div>
//           )}
//           {courses.length === 0 && !loading && (
//             <div className="col-span-full text-center py-8 text-muted-foreground">
//               No courses found.
//             </div>
//           )}
//         </div>
//       </div>

//       <CourseModal
//         open={courseModalOpen}
//         onOpenChange={setCourseModalOpen}
//         course={selectedCourse}
//         onSave={handleSaveCourse}
//       />
//       <DeleteConfirmationModal
//         open={deleteModalOpen}
//         onOpenChange={setDeleteModalOpen}
//         onConfirm={confirmDelete}
//         title="Delete Course"
//         description={`Are you sure you want to delete ${selectedCourse?.name}? This action cannot be undone.`}
//       />
//       <ViewDetailsModal
//         open={viewModalOpen}
//         onOpenChange={setViewModalOpen}
//         title="Course Details"
//         data={selectedCourse}
//         type="course"
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
import {
  Plus,
  Search,
  Users,
  BookOpen,
  Clock,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import {CourseModal} from "@/components/admin/modals/course-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
import {useToast} from "@/hooks/use-toast";

interface Course {
  id: number;
  name: string;
  subject: string;
  teacher: string;
  classroom: string;
  students: number;
  modules: number;
  status: "active" | "inactive";
  progress: number;
  description?: string;
}

interface Options {
  subjects: {id: number; name: string}[];
  classrooms: {id: number; name: string}[];
  teachers: {id: number; name: string; email: string}[];
}

interface Stats {
  active_courses: number;
  total_enrollments: number;
}

export default function CoursesPage() {
  const {toast} = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    active_courses: 0,
    total_enrollments: 0,
  });
  const [options, setOptions] = useState<Options>({
    subjects: [],
    classrooms: [],
    teachers: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/courses/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch course stats.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast({
        title: "Error",
        description: "Failed to fetch course stats.",
        variant: "destructive",
      });
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch("/api/admin/courses/options");
      if (res.ok) {
        const data = await res.json();
        setOptions(data);
      }
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

  const fetchCourses = async (
    search = "",
    status = "",
    page = 1,
    page_size = 100
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        page: page.toString(),
        page_size: page_size.toString(),
      });
      const res = await fetch(`/api/admin/courses?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.results || []);
      } else {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.detail || "Failed to fetch courses.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast({
        title: "Error",
        description: "Failed to fetch courses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchOptions();
    fetchCourses(searchQuery);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCourses(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseModalOpen(true);
  };

  const handleViewCourse = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCourse(data);
        setViewModalOpen(true);
      } else {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.detail || "Failed to fetch course details.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      toast({
        title: "Error",
        description: "Failed to fetch course details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setDeleteModalOpen(true);
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      let res;
      if (selectedCourse?.id) {
        res = await fetch(`/api/admin/courses/${selectedCourse.id}/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        });
        toast({
          title: "Course Updated",
          description: `${courseData.name} has been updated successfully.`,
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        });
        toast({
          title: "Course Created",
          description: `${courseData.name} has been created successfully.`,
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.detail || "Failed to save course.",
          variant: "destructive",
        });
        return;
      }
      fetchCourses(searchQuery);
    } catch (err) {
      console.error("Error saving course:", err);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive",
      });
    }
    setCourseModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;
    try {
      const res = await fetch(
        `/api/admin/courses/${selectedCourse.id}/delete`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Course Deleted",
          description:
            data.detail ||
            `${selectedCourse.name} has been removed from the system.`,
        });
        fetchCourses(searchQuery);
      } else {
        const errData = await res.json();
        toast({
          title: res.status === 400 ? "Cannot Delete" : "Error",
          description: errData.detail || "Failed to delete course.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    }
    setDeleteModalOpen(false);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Courses
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage courses and learning content
            </p>
          </div>
          <Button onClick={handleAddCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.active_courses}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.total_enrollments}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="secondary">{course.subject}</Badge>
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      course.status === "active" ? "default" : "secondary"
                    }>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Teacher Info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`/.jpg?height=40&width=40&query=${course.teacher}`}
                      />
                      <AvatarFallback>
                        {course.teacher
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {course.teacher}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.classroom}
                      </p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {course.students}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Students
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {course.modules}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Modules
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {course.progress}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Progress
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCourse(course)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCourse(course)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourse(course)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {loading && courses.length > 0 && (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {courses.length === 0 && !loading && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No courses found.
            </div>
          )}
        </div>
      </div>

      <CourseModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        course={selectedCourse}
        onSave={handleSaveCourse}
        options={options}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete ${selectedCourse?.name}? This action cannot be undone.`}
      />
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Course Details"
        data={selectedCourse}
        type="course"
      />
    </>
  );
}
