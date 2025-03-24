import * as React from "react";

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

export function Avatar({ className = "", children }: AvatarProps) {
  return <div className={`relative h-10 w-10 overflow-hidden rounded-full ${className}`}>{children}</div>;
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function AvatarImage({ src, alt, ...props }: AvatarImageProps) {
  return <img src={src} alt={alt} className="h-full w-full object-cover" {...props} />;
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

export function AvatarFallback({ className = "", children }: AvatarFallbackProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gray-700 ${className}`}>
      {children}
    </div>
  );
} 