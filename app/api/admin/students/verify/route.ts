import {type NextRequest, NextResponse} from "next/server";

// Mock database of students - replace with actual database query
const mockStudents = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    admissionNo: "ADM001",
    classroom: "Class A",
    status: "active",
    avatar: "/diverse-students-studying.png",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    admissionNo: "ADM002",
    classroom: "Class B",
    status: "active",
    avatar: "/diverse-students-studying.png",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    admissionNo: "ADM003",
    classroom: "Class A",
    status: "inactive",
    avatar: "/diverse-students-studying.png",
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const admissionNo = searchParams.get("admissionNo");

    if (!admissionNo) {
      return NextResponse.json(
        {detail: "Admission number is required"},
        {status: 400}
      );
    }

    // Search for student in database
    const student = mockStudents.find(
      (s) => s.admissionNo.toLowerCase() === admissionNo.toLowerCase()
    );

    if (!student) {
      return NextResponse.json(
        {detail: "Student not found in school database"},
        {status: 404}
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error verifying student:", error);
    return NextResponse.json({detail: "Internal server error"}, {status: 500});
  }
}
