import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none";
  
  const variantStyles = {
    default: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "border border-gray-600 bg-transparent hover:bg-gray-800",
    ghost: "bg-transparent hover:bg-gray-800",
    link: "bg-transparent underline-offset-4 hover:underline text-primary",
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 