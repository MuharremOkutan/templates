import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
  variant?: "default" | "filled" | "outline";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  helperText?: string;
}

export function Input({
  className = "",
  type = "text",
  variant = "default",
  size = "md",
  leftIcon,
  rightIcon,
  error,
  label,
  helperText,
  ...props
}: InputProps) {
  const baseStyles = "w-full rounded focus:outline-none transition-all duration-200";
  
  const variantStyles = {
    default: "bg-slate-900/30 border border-gray-700 text-white focus:border-primary hover:border-gray-600 focus:ring-1 focus:ring-primary/30",
    filled: "bg-slate-800/80 border border-transparent text-white focus:border-primary hover:bg-slate-800 focus:ring-1 focus:ring-primary/30",
    outline: "bg-transparent border border-gray-700 text-white focus:border-primary hover:border-gray-600 focus:ring-1 focus:ring-primary/30",
  };
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" : "";
  
  const iconPaddingLeft = leftIcon ? "pl-10" : "";
  const iconPaddingRight = rightIcon ? "pr-10" : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${errorStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? "text-red-400" : "text-gray-400"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  variant?: "default" | "filled" | "outline";
  error?: string;
  label?: string;
  helperText?: string;
}

export function Textarea({
  className = "",
  variant = "default",
  error,
  label,
  helperText,
  ...props
}: TextareaProps) {
  const baseStyles = "w-full rounded focus:outline-none transition-all duration-200";
  
  const variantStyles = {
    default: "bg-slate-900/30 border border-gray-700 text-white focus:border-primary hover:border-gray-600 focus:ring-1 focus:ring-primary/30",
    filled: "bg-slate-800/80 border border-transparent text-white focus:border-primary hover:bg-slate-800 focus:ring-1 focus:ring-primary/30",
    outline: "bg-transparent border border-gray-700 text-white focus:border-primary hover:border-gray-600 focus:ring-1 focus:ring-primary/30",
  };

  const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`${baseStyles} ${variantStyles[variant]} px-4 py-2 ${errorStyles} ${className}`}
        {...props}
      />
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? "text-red-400" : "text-gray-400"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
