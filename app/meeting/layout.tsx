import React from "react";

/**
 * Meeting layout - NO auth enforcement.
 * This route is accessible to both authenticated and guest users.
 * Auth checks happen at the page level instead.
 */
const MeetingLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default MeetingLayout;
