import { cn } from "@/lib/utils";

export function Spinner({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <img
      src="/texagon-logo.png"
      alt="Texagon Logo"
      className={cn(
        `animate-bounce ${sizeClasses[size]} object-contain`,
        className
      )}
    />
  );
}