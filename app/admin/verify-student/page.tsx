// "use client";

// import React, {useState} from "react";

// import {useToast} from "@/hooks/use-toast";
// import {Button} from "@/components/ui/button";
// import {AlertCircle, Badge, RefreshCcw, Search} from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Input} from "@/components/ui/input";
// import {Avatar, AvatarFallback} from "@/components/ui/avatar";
// import {AvatarImage} from "@radix-ui/react-avatar";
// import {AlertDialog} from "@radix-ui/react-alert-dialog";
// import {
//   AlertDialogAction,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// interface StudentData {
//   id: string;
//   name: string;
//   email: string;
//   admissionNo: string;
//   classroom: string;
//   status: string;
//   avatar?: string;
// }

// export default function VerifyStudent() {
//   const {toast} = useToast();
//   const [admissionNumber, setAdmissionNumber] = useState("");
//   const [student, setStudent] = useState<StudentData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showNotFoundAlert, setShowNotFoundAlert] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);

//   const handleVerifyStudent = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!admissionNumber.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter an admission number",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);
//     setHasSearched(true);

//     try {
//       const res = await fetch(
//         `/api/admin/students/verify?admissionNo=${encodeURIComponent(
//           admissionNumber
//         )}`
//       );

//       if (res.status === 404) {
//         setStudent(null);
//         setShowNotFoundAlert(true);
//         return;
//       }

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.detail || "Failed to verify student");
//       }

//       const data = await res.json();
//       setStudent(data);
//       setShowNotFoundAlert(false);
//       toast({
//         title: "Success",
//         description: "Student found in database",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to verify student",
//         variant: "destructive",
//       });
//       setStudent(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setAdmissionNumber("");
//     setStudent(null);
//     setHasSearched(false);
//     setShowNotFoundAlert(false);
//   };
//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Student Verifier
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Verify student enrollment by admission number
//             </p>
//           </div>
//           {hasSearched && (
//             <Button variant="outline" onClick={handleReset}>
//               <RefreshCcw className="mr-2 h-4 w-4" />
//               Reset
//             </Button>
//           )}
//         </div>

//         {/* Search Section */}
//         <Card>
//           <CardContent className="pt-6">
//             <form onSubmit={handleVerifyStudent}>
//               <div className="flex flex-col md:flex-row gap-4">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                   <Input
//                     placeholder="Enter admission number (e.g., ADM001)"
//                     className="pl-9"
//                     value={admissionNumber}
//                     onChange={(e) => setAdmissionNumber(e.target.value)}
//                     disabled={isLoading}
//                   />
//                 </div>
//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading ? "Verifying..." : "Verify"}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Results */}
//         {hasSearched && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Verification Result</CardTitle>
//               <CardDescription>
//                 {student
//                   ? "Student verification successful"
//                   : "No record found for the provided admission number"}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {student ? (
//                 <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
//                   <div className="flex items-center gap-4">
//                     <Avatar className="h-12 w-12">
//                       <AvatarImage src={student.avatar || "/placeholder.svg"} />
//                       <AvatarFallback>
//                         {student.name
//                           .split(" ")
//                           .map((n) => n[0])
//                           .join("")}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <h3 className="font-semibold text-foreground">
//                         {student.name}
//                       </h3>
//                       <div className="flex items-center gap-4 mt-1">
//                         <Badge variant="outline" className="text-xs">
//                           {student.admissionNo}
//                         </Badge>
//                         <p className="text-sm text-muted-foreground">
//                           {student.email}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-sm font-medium text-foreground">
//                       {student.classroom}
//                     </p>
//                     <Badge
//                       variant={
//                         student.status === "active" ? "default" : "secondary"
//                       }
//                       className="mt-1">
//                       {student.status}
//                     </Badge>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="py-12 text-center">
//                   <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
//                   <p className="text-amber-900 font-medium">No student found</p>
//                   <p className="text-amber-800 text-sm mt-1">
//                     Try a different admission number
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Not Found Alert Dialog */}
//       <AlertDialog open={showNotFoundAlert} onOpenChange={setShowNotFoundAlert}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle className="flex items-center gap-2">
//               <AlertCircle className="h-5 w-5 text-destructive" />
//               Student Not Found
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               The admission number "{admissionNumber}" is not found in the
//               school database. Please verify the admission number and try again.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogAction onClick={() => setShowNotFoundAlert(false)}>
//             Try Again
//           </AlertDialogAction>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }

"use client";

import React, {useState} from "react";

import {useToast} from "@/hooks/use-toast";
import {Button} from "@/components/ui/button";
import {AlertCircle, RefreshCcw, Search} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {AvatarImage} from "@radix-ui/react-avatar";
import {AlertDialog} from "@radix-ui/react-alert-dialog";
import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StudentData {
  id: string;
  name: string;
  email: string;
  admissionNo: string;
  classroom: string;
  status: string;
  avatar?: string;
}

export default function VerifyStudent() {
  const {toast} = useToast();
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotFoundAlert, setShowNotFoundAlert] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter an admission number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/admin/students/verify?admissionNo=${encodeURIComponent(
          admissionNumber
        )}`
      );

      if (res.status === 404) {
        setStudent(null);
        setShowNotFoundAlert(true);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to verify student");
      }

      const data = await res.json();
      setStudent(data);
      setShowNotFoundAlert(false);
      toast({
        title: "Success",
        description: "Student found in database",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify student",
        variant: "destructive",
      });
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAdmissionNumber("");
    setStudent(null);
    setHasSearched(false);
    setShowNotFoundAlert(false);
  };
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Student Verifier
            </h1>
            <p className="text-muted-foreground mt-1">
              Verify student enrollment by admission number
            </p>
          </div>
          {hasSearched && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Search Section */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleVerifyStudent}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter admission number (e.g., ADM001)"
                    className="pl-9"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Result</CardTitle>
              <CardDescription>
                {student
                  ? "Student verification successful"
                  : "No record found for the provided admission number"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student ? (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {student.admissionNo}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {student.classroom}
                    </p>
                    <Badge
                      variant={
                        student.status === "active" ? "default" : "secondary"
                      }
                      className="mt-1">
                      {student.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                  <p className="text-amber-900 font-medium">No student found</p>
                  <p className="text-amber-800 text-sm mt-1">
                    Try a different admission number
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Not Found Alert Dialog */}
      <AlertDialog open={showNotFoundAlert} onOpenChange={setShowNotFoundAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Student Not Found
            </AlertDialogTitle>
            <AlertDialogDescription>
              The admission number "{admissionNumber}" is not found in the
              school database. Please verify the admission number and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowNotFoundAlert(false)}>
            Try Again
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
