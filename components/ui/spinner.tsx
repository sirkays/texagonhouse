import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <Loader2 className={cn(`animate-spin ${sizeClasses[size]} text-orange-500`, className)} />
  );
}