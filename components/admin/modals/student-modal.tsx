// "use client";

// import type React from "react";

// import {useState, useEffect} from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {Button} from "@/components/ui/button";
// import {Input} from "@/components/ui/input";
// import {Label} from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface StudentModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   student?: {
//     id: number;
//     name: string;
//     email: string;
//     classroom: string;
//     admissionNo: string;
//     status: string;
//   };
//   classrooms: {id: number; name: string}[];
//   onSave: (data: any) => void;
// }

// export function StudentModal({
//   open,
//   onOpenChange,
//   student,
//   classrooms,
//   onSave,
// }: StudentModalProps) {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     classroom: "",
//     admissionNo: "",
//     status: "active",
//   });

//   useEffect(() => {
//     if (open) {
//       if (student) {
//         setFormData({
//           name: student.name,
//           email: student.email,
//           classroom: student.classroom,
//           admissionNo: student.admissionNo,
//           status: student.status,
//         });
//       } else {
//         setFormData({
//           name: "",
//           email: "",
//           classroom: "",
//           admissionNo: "",
//           status: "active",
//         });
//       }
//     }
//   }, [student, open]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave({...formData, id: student?.id});
//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <form onSubmit={handleSubmit}>
//           <DialogHeader>
//             <DialogTitle>
//               {student ? "Edit Student" : "Add New Student"}
//             </DialogTitle>
//             <DialogDescription>
//               {student
//                 ? "Update student information"
//                 : "Add a new student to your organization"}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 placeholder="e.g., John Doe"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({...formData, name: e.target.value})
//                 }
//                 required
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="email">Email Address</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="student@example.com"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({...formData, email: e.target.value})
//                 }
//                 required
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="admissionNo">Admission Number</Label>
//               <Input
//                 id="admissionNo"
//                 placeholder="e.g., STU001"
//                 value={formData.admissionNo}
//                 onChange={(e) =>
//                   setFormData({...formData, admissionNo: e.target.value})
//                 }
//                 required
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="classroom">Classroom</Label>
//               <Select
//                 value={formData.classroom}
//                 onValueChange={(value) =>
//                   setFormData({...formData, classroom: value})
//                 }>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select classroom" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {classrooms.map((classroom) => (
//                     <SelectItem key={classroom.id} value={classroom.name}>
//                       {classroom.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value) =>
//                   setFormData({...formData, status: value})
//                 }>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                   <SelectItem value="suspended">Suspended</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit">{student ? "Update" : "Add"} Student</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Spinner} from "@/components/ui/spinner";

interface StudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: {
    id: number;
    name: string;
    email: string;
    classroom: string;
    admissionNo: string;
    status: string;
    avatar?: string | null;
  };
  classrooms: {id: number; name: string}[];
  onSave: (data: any) => void;
  loading?: boolean; // Added loading prop
}

export function StudentModal({
  open,
  onOpenChange,
  student,
  classrooms,
  onSave,
  loading = false, // Default to false
}: StudentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    classroom: "",
    admissionNo: "",
    status: "active",
    avatarFile: null as File | null,
  });

  useEffect(() => {
    if (open) {
      if (student) {
        setFormData({
          name: student.name,
          email: student.email,
          classroom: student.classroom,
          admissionNo: student.admissionNo,
          status: student.status,
          avatarFile: null,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          classroom: "",
          admissionNo: "",
          status: "active",
          avatarFile: null,
        });
      }
    }
  }, [student, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({...formData, avatarFile: file});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({...formData, id: student?.id});
    // REMOVED: onOpenChange(false) - Parent handles closing on success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {student ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription>
              {student
                ? "Update student information"
                : "Add a new student to your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({...formData, name: e.target.value})
                }
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({...formData, email: e.target.value})
                }
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admissionNo">Admission Number</Label>
              <Input
                id="admissionNo"
                placeholder="e.g., STU001"
                value={formData.admissionNo}
                onChange={(e) =>
                  setFormData({...formData, admissionNo: e.target.value})
                }
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="space-y-2">
                {student?.avatar && !formData.avatarFile && (
                  <img
                    src={student.avatar}
                    alt="Current profile picture"
                    className="w-20 h-20 rounded object-cover"
                  />
                )}
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading} // Disable input
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="classroom">Classroom</Label>
              <Select
                value={formData.classroom}
                onValueChange={(value) =>
                  setFormData({...formData, classroom: value})
                }
                disabled={loading} // Disable select
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.name}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
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
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
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
                  {student ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{student ? "Update" : "Add"} Student</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}