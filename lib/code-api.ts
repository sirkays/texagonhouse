// lib/api.ts
export async function fetchFilterOptions() {
  const res = await fetch("/api/teacher/code/submissions?page_size=100");
  if (!res.ok) throw new Error("Failed to fetch options");
  const data = await res.json();
  const submissions = data.results || [];

  const courses = [...new Set(submissions.map((s: any) => s.course_name).filter(Boolean))]
    .map(name => {
      const sub = submissions.find((s: any) => s.course_name === name);
      return { id: sub?.course?.id || sub?.course_id, name };
    })
    .filter(c => c.id);

  const classes = [...new Set(submissions.map((s: any) => s.class_name).filter(Boolean))]
    .map(name => {
      const sub = submissions.find((s: any) => s.class_name === name);
      return { id: sub?.classroom?.id || sub?.classroom_id, name };
    })
    .filter(c => c.id);

  return { courses, classes };
}