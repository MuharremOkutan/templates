import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
}

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-primary text-white",
    secondary: "bg-gray-700 text-gray-200",
    outline: "border border-gray-700 text-gray-200",
    destructive: "bg-red-900/20 text-red-400 border-red-800/30 border",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
} 