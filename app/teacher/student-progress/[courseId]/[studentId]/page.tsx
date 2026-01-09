import StudentProgressClient from "./ui/StudentProgressClient";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string; studentId: string }>;
}) {
  const { courseId, studentId } = await params;

  return (
    <StudentProgressClient
      courseId={Number(courseId)}
      studentId={Number(studentId)}
    />
  );
}
