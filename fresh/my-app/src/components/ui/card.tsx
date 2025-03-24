import * as React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-900/60 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className = "", children }: CardHeaderProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className = "", children }: CardTitleProps) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className = "", children }: CardContentProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={`text-sm text-gray-400 ${className || ""}`}
      {...props}
    />
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={`flex items-center p-4 pt-0 ${className || ""}`}
      {...props}
    />
  );
} 