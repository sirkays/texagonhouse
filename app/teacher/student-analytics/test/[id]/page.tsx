import React from "react";
import { TestAnalyticsDetail } from "@/components/teacher/test-analytics-detail";

interface Props {
  params: { id: string };
}

const TestDetailPage = ({ params }: Props) => {
  return (
    <div>
      <TestAnalyticsDetail testId={params.id} />
    </div>
  );
};

export default TestDetailPage;
