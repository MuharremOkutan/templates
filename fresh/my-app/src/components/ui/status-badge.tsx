import React from "react";
import { cn } from "../../lib/utils";

type StatusType = "draft" | "pending" | "in-progress" | "completed" | "failed" | "canceled" | "approved" | "rejected" | "active" | "inactive";

type StatusBadgeProps = {
  status: StatusType;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function StatusBadge({ status, className, size = "md", ...props }: StatusBadgeProps) {
  const statusColors = {
    "draft": "bg-slate-600/40 text-slate-200 border-slate-500/30",
    "pending": "bg-amber-500/20 text-amber-200 border-amber-500/30",
    "in-progress": "bg-blue-500/20 text-blue-200 border-blue-500/30",
    "completed": "bg-green-500/20 text-green-200 border-green-500/30",
    "failed": "bg-red-500/20 text-red-200 border-red-500/30",
    "canceled": "bg-slate-600/40 text-slate-200 border-slate-500/30",
    "approved": "bg-green-500/20 text-green-200 border-green-500/30",
    "rejected": "bg-red-500/20 text-red-200 border-red-500/30",
    "active": "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
    "inactive": "bg-slate-600/40 text-slate-200 border-slate-500/30",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const displayText = {
    "draft": "Draft",
    "pending": "Pending",
    "in-progress": "In Progress",
    "completed": "Completed",
    "failed": "Failed",
    "canceled": "Canceled",
    "approved": "Approved",
    "rejected": "Rejected",
    "active": "Active",
    "inactive": "Inactive",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        statusColors[status],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {displayText[status]}
    </span>
  );
} 