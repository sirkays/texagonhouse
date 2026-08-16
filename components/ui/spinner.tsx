import { cn } from "@/lib/utils";
import { getBrandConfig } from "@/lib/brand";

export function Spinner({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const brand = getBrandConfig();
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <img
      src={brand.logo}
      alt={brand.logoAlt}
      className={cn(
        `animate-bounce ${sizeClasses[size]} object-contain`,
        className
      )}
    />
  );
}