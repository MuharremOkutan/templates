import React from "react";
import { cn } from "../../lib/utils";

type SkeletonProps = {
  className?: string;
  variant?: "default" | "button" | "card" | "text" | "avatar";
};

export function Skeleton({ 
  className,
  variant = "default",
  ...props 
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  const variantStyles = {
    default: "h-4 w-full",
    button: "h-10 w-24 rounded-md",
    card: "h-32 w-full",
    text: "h-4 w-2/3",
    avatar: "h-12 w-12 rounded-full"
  };

  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-700/50",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

// Skeleton text with multiple lines
interface SkeletonTextProps {
  className?: string;
  lines?: number;
  lastLineWidth?: "full" | "3/4" | "2/3" | "1/2" | "1/3" | "1/4";
}

export function SkeletonText({
  className = "",
  lines = 3,
  lastLineWidth = "2/3",
}: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} variant="text" className="w-full" />
      ))}
      <Skeleton variant="text" className={`w-${lastLineWidth}`} />
    </div>
  );
}

// Card skeleton with header and content
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card p-4 animate-pulse ${className}`}>
      <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
      </div>
      <div className="mt-4 flex justify-between">
        <div className="h-8 bg-slate-700/50 rounded w-24"></div>
        <div className="h-8 bg-slate-700/50 rounded w-24"></div>
      </div>
    </div>
  );
} 