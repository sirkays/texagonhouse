// "use client"

// import type React from "react"

// import { useState } from "react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// interface CourseModalProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   course?: any
//   onSave: (course: any) => void
// }

// export function CourseModal({ open, onOpenChange, course, onSave }: CourseModalProps) {
//   const [formData, setFormData] = useState({
//     name: course?.name || "",
//     subject: course?.subject || "",
//     teacher: course?.teacher || "",
//     classroom: course?.classroom || "",
//     description: course?.description || "",
//     status: course?.status || "active",
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     onSave({
//       ...course,
//       ...formData,
//     })
//     onOpenChange(false)
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
//           <DialogDescription>{course ? "Update course information" : "Create a new course"}</DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit}>
//           <div className="grid gap-4 py-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Course Name *</Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 required
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="subject">Subject *</Label>
//                 <Select
//                   value={formData.subject}
//                   onValueChange={(value) => setFormData({ ...formData, subject: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select subject" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Mathematics">Mathematics</SelectItem>
//                     <SelectItem value="Physics">Physics</SelectItem>
//                     <SelectItem value="Chemistry">Chemistry</SelectItem>
//                     <SelectItem value="Biology">Biology</SelectItem>
//                     <SelectItem value="English">English</SelectItem>
//                     <SelectItem value="History">History</SelectItem>
//                     <SelectItem value="Computer Science">Computer Science</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="classroom">Classroom *</Label>
//                 <Select
//                   value={formData.classroom}
//                   onValueChange={(value) => setFormData({ ...formData, classroom: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select classroom" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Grade 10A">Grade 10A</SelectItem>
//                     <SelectItem value="Grade 10B">Grade 10B</SelectItem>
//                     <SelectItem value="Grade 11A">Grade 11A</SelectItem>
//                     <SelectItem value="Grade 11B">Grade 11B</SelectItem>
//                     <SelectItem value="Grade 12A">Grade 12A</SelectItem>
//                     <SelectItem value="Grade 12B">Grade 12B</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="teacher">Teacher *</Label>
//                 <Select
//                   value={formData.teacher}
//                   onValueChange={(value) => setFormData({ ...formData, teacher: value })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select teacher" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Dr. Robert Smith">Dr. Robert Smith</SelectItem>
//                     <SelectItem value="Prof. Maria Garcia">Prof. Maria Garcia</SelectItem>
//                     <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
//                     <SelectItem value="Ms. Lisa Anderson">Ms. Lisa Anderson</SelectItem>
//                     <SelectItem value="Mr. David Lee">Mr. David Lee</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="status">Status *</Label>
//                 <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="active">Active</SelectItem>
//                     <SelectItem value="inactive">Inactive</SelectItem>
//                     <SelectItem value="archived">Archived</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 rows={4}
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit">{course ? "Update" : "Create"} Course</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

"use client";

import type React from "react";
import {useState, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Spinner} from "@/components/ui/spinner";

interface Options {
  subjects: {id: number; name: string}[];
  classrooms: {id: number; name: string}[];
  teachers: {id: number; name: string; email: string}[];
}

interface CourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: any;
  onSave: (course: any) => Promise<void>;
  options: Options;
  loading?: boolean; // Added loading prop
}

export function CourseModal({
  open,
  onOpenChange,
  course,
  onSave,
  options,
  loading = false, // Default to false
}: CourseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    teacher: "",
    classroom: "",
    description: "",
    status: "active",
  });

  // Sync state with props when modal opens or course changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: course?.name || "",
        subject: course?.subject || "",
        teacher: course?.teacher || "",
        classroom: course?.classroom || "",
        description: course?.description || "",
        status: course?.status || "active",
      });
    }
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const saveData = {
      name: formData.name,
      subject: formData.subject,
      classroom: formData.classroom || null,
      teacher: formData.teacher,
      description: formData.description || undefined,
      is_active: formData.status === "active",
    };
    await onSave(saveData);
    // REMOVED: onOpenChange(false) - Parent handles closing on success
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {course ? "Edit Course" : "Create New Course"}
          </DialogTitle>
          <DialogDescription>
            {course ? "Update course information" : "Create a new course"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({...formData, name: e.target.value})
                }
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({...formData, subject: value})
                  }
                  disabled={loading} // Disable select
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.name}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroom">Classroom <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select
                  value={formData.classroom}
                  onValueChange={(value) =>
                    setFormData({...formData, classroom: value === "__none__" ? "" : value})
                  }
                  disabled={loading} // Disable select
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No Classroom —</SelectItem>
                    {options.classrooms.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher *</Label>
                <Select
                  value={formData.teacher}
                  onValueChange={(value) =>
                    setFormData({...formData, teacher: value})
                  }
                  disabled={loading} // Disable select
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.teachers.map((tch) => (
                      <SelectItem key={tch.id} value={tch.name}>
                        {tch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({...formData, status: value})
                  }
                  disabled={loading} // Disable select
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({...formData, description: e.target.value})
                }
                rows={4}
                disabled={loading} // Disable input
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading} // Disable cancel
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {course ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{course ? "Update" : "Create"} Course</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}