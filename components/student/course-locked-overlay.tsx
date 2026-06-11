"use client";

import React from "react";
import { Lock } from "lucide-react";

interface CourseLockedOverlayProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export const CourseLockedOverlay = ({
  message = "Course access has expired.",
  subMessage = "Please renew your subscription",
  className = "",
}: CourseLockedOverlayProps) => {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/65 backdrop-blur-[3px] text-white p-4 text-center rounded-lg transition-all duration-300 hover:backdrop-blur-[5px] ${className}`}
    >
      <div className="p-3 bg-orange-500/90 rounded-full mb-3 shadow-lg shadow-orange-500/20 animate-pulse">
        <Lock className="h-5 w-5 text-white" />
      </div>
      <h4 className="text-sm font-semibold tracking-wide text-white uppercase sm:text-base">
        {message}
      </h4>
      <p className="text-xs text-slate-300 mt-1 max-w-[240px] leading-relaxed">
        {subMessage}
      </p>
    </div>
  );
};
