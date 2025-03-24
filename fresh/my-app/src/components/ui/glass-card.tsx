import React from "react";
import { cn } from "../../lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient";
  color?: "primary" | "secondary" | "accent" | "neutral";
};

export function GlassCard({
  children,
  className,
  variant = "default",
  color = "primary",
  ...props
}: GlassCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const colorStyles = {
    primary: "from-primary/10 to-primary-dark/5",
    secondary: "from-blue-500/10 to-cyan-500/5",
    accent: "from-purple-500/10 to-indigo-500/5",
    neutral: "from-slate-700/30 to-slate-800/30",
  };

  return (
    <div
      className={cn(
        "rounded-xl backdrop-blur-sm border overflow-hidden",
        variant === "default" 
          ? "bg-slate-800/50 border-slate-700/50" 
          : `bg-slate-800/40 border-slate-700/30 bg-gradient-to-b ${colorStyles[color]}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type GlassCardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCardHeader({
  children,
  className,
  ...props
}: GlassCardHeaderProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

type GlassCardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCardContent({
  children,
  className,
  ...props
}: GlassCardContentProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

type GlassCardFooterProps = {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
};

export function GlassCardFooter({
  children,
  className,
  bordered = false,
  ...props
}: GlassCardFooterProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 flex items-center",
        bordered && "border-t border-slate-700/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 