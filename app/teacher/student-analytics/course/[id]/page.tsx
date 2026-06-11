import React from "react";
import { CourseAnalyticsDetail } from "@/components/teacher/course-analytics-detail";

interface Props {
  params: { id: string };
}

const CourseDetailPage = ({ params }: Props) => {
  return (
    <div>
      <CourseAnalyticsDetail courseId={params.id} />
    </div>
  );
};

export default CourseDetailPage;
