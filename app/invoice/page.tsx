"use client";
import {AnimatedDashboard} from "@/components/invoice/animated-dashboard";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-3 sm:p-4 pt-0">
      <AnimatedDashboard />
    </div>
  );
}
