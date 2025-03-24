import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px]",
    secondary: "bg-slate-800/70 text-gray-200 border border-gray-700/70 hover:bg-slate-700/80 hover:border-gray-600 hover:text-white",
    outline: "bg-transparent border border-gray-700 text-gray-300 hover:bg-slate-800/70 hover:text-white hover:border-gray-600",
    ghost: "bg-transparent hover:bg-slate-800/50 text-gray-300 hover:text-white",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px]",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px]",
  };
  
  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };
  
  const disabledStyles = disabled || isLoading
    ? "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
    : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}

// IconButton component for icon-only buttons 
interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  "aria-label": string;
}

export function IconButton({
  icon,
  className = "",
  variant = "ghost",
  size = "md",
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={`${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
} 