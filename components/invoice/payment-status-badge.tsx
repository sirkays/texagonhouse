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
      icon: CheckCircle,
      dotColor: "bg-emerald-500",
      className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15 dark:text-emerald-400",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      dotColor: "bg-amber-500 animate-pulse",
      className: "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/15 dark:text-amber-400",
    },
    overdue: {
      label: "Overdue",
      icon: AlertTriangle,
      dotColor: "bg-rose-500 animate-pulse",
      className: "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/15 dark:text-rose-400",
    },
    failed: {
      label: "Failed",
      icon: XCircle,
      dotColor: "bg-red-500",
      className: "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/15 dark:text-red-400",
    },
    open: {
      label: "Open",
      icon: Clock,
      dotColor: "bg-blue-500",
      className: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/15 dark:text-blue-400",
    },
    void: {
      label: "Void",
      icon: XCircle,
      dotColor: "bg-slate-400",
      className: "bg-slate-400/10 text-slate-600 border-slate-400/20 hover:bg-slate-400/15 dark:text-slate-400",
    },
    uncollectible: {
      label: "Uncollectible",
      icon: XCircle,
      dotColor: "bg-slate-400",
      className: "bg-slate-400/10 text-slate-600 border-slate-400/20 hover:bg-slate-400/15 dark:text-slate-400",
    },
    active: {
      label: "Active",
      icon: CheckCircle,
      dotColor: "bg-emerald-500",
      className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15 dark:text-emerald-400",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-[11px] h-5 px-2 gap-1.5",
    md: "text-xs h-6 px-2.5 gap-1.5",
    lg: "text-sm h-7 px-3 gap-2",
  }

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  }

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} font-semibold tracking-wide transition-all duration-200 inline-flex items-center rounded-full ${className}`}
    >
      <span className={`${config.dotColor} ${dotSizes[size]} rounded-full shrink-0`} />
      {config.label}
    </Badge>
  )
}
