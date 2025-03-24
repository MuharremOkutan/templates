import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  
  const variantStyles = {
    default: "bg-primary text-white hover:bg-primary-dark",
    outline: "border border-gray-600 bg-transparent hover:bg-gray-700 text-gray-300",
    ghost: "bg-transparent hover:bg-gray-700 text-gray-300",
    link: "bg-transparent underline-offset-4 hover:underline text-primary hover:text-primary-light p-0 h-auto",
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-md px-6",
    icon: "h-10 w-10",
  };
  
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return <button className={classes} {...props} />;
} 