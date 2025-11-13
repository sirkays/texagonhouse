// Mock data for certificates
export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  issuedDate: string;
  verificationId: string;
  isVerified: boolean;
  isTested: boolean;
}

export interface StudentWithCertificates extends Student {
  certificates: Certificate[];
}

// Mock students data
export const mockStudents: StudentWithCertificates[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    certificates: [
      {
        id: "cert-1",
        studentId: "1",
        courseId: "course-1",
        courseName: "Advanced React Patterns",
        issuedDate: "2024-11-15",
        verificationId: "REACT-2024-001",
        isVerified: true,
        isTested: true,
      },
      {
        id: "cert-2",
        studentId: "1",
        courseId: "course-2",
        courseName: "TypeScript Mastery",
        issuedDate: "2024-10-20",
        verificationId: "TS-2024-002",
        isVerified: true,
        isTested: true,
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    certificates: [
      {
        id: "cert-3",
        studentId: "2",
        courseId: "course-3",
        courseName: "Next.js Full Stack Development",
        issuedDate: "2024-11-10",
        verificationId: "NEXTJS-2024-003",
        isVerified: false,
        isTested: true,
      },
      {
        id: "cert-4",
        studentId: "2",
        courseId: "course-4",
        courseName: "Web Performance Optimization",
        issuedDate: "2024-09-05",
        verificationId: "WPO-2024-004",
        isVerified: true,
        isTested: false,
      },
    ],
  },
  {
    id: "3",
    name: "Michael Rodriguez",
    email: "michael.r@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    certificates: [
      {
        id: "cert-5",
        studentId: "3",
        courseId: "course-5",
        courseName: "JavaScript ES6+ Fundamentals",
        issuedDate: "2024-08-12",
        verificationId: "JS-2024-005",
        isVerified: true,
        isTested: true,
      },
    ],
  },
];

export const getStudentById = (id: string) => {
  return mockStudents.find((student) => student.id === id);
};

export const getCertificateById = (certificateId: string) => {
  for (const student of mockStudents) {
    const cert = student.certificates.find((c) => c.id === certificateId);
    if (cert) {
      return {certificate: cert, student};
    }
  }
  return null;
};
