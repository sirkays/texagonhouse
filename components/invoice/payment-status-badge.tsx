import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"

interface PaymentStatusBadgeProps {
  status: "paid" | "pending" | "overdue" | "failed" | "open" | "void"  | "uncollectible" | "active"
  className?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export function PaymentStatusBadge({ status, className, showIcon = true, size = "md" }: PaymentStatusBadgeProps) {
  const statusConfig = {
    paid: {
      label: "Paid",
      variant: "default" as const,
      icon: CheckCircle,
      className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
    },
    pending: {
      label: "Pending",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
    },
    overdue: {
      label: "Overdue",
      variant: "destructive" as const,
      icon: AlertTriangle,
      className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
    },
    failed: {
      label: "Failed",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
    },
    open: {
      label: "Open",
      variant: "outline" as const,
      icon: Clock,
      className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    },
    void: {
      label: "Void",
      variant: "outline" as const,  
      icon: XCircle,
      className: "bg-muted/10 text-muted border-muted/20 hover:bg-muted/20",
    },
    uncollectible: {
      label: "Uncollectible",
      variant: "outline" as const,  
      icon: XCircle,
      className: "bg-muted/10 text-muted border-muted/20 hover:bg-muted/20",
    },
    active: {
      label: "Active",
      variant: "outline" as const, 
      icon: CheckCircle,
      className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs h-5 px-2",
    md: "text-sm h-6 px-3",
    lg: "text-base h-7 px-4",
  }

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} font-medium transition-all duration-200 ${className}`}
    >
      {showIcon && <Icon className={`${size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3 w-3"} mr-1.5`} />}
      {config.label}
    </Badge>
  )
}
