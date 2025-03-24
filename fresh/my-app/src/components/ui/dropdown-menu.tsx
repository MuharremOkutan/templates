import * as React from "react";

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: () => setIsOpen(!isOpen),
            isOpen,
          });
        }
        if (React.isValidElement(child) && child.type === DropdownMenuContent) {
          return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
            onItemClick: () => setIsOpen(false),
          }) : null;
        }
        return child;
      })}
    </div>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
  isOpen?: boolean;
}

export function DropdownMenuTrigger({ children, asChild, onClick, isOpen }: DropdownMenuTriggerProps) {
  if (asChild) {
    return React.cloneElement(React.Children.only(children) as React.ReactElement<any>, {
      onClick,
      "aria-expanded": isOpen,
    });
  }
  return <button onClick={onClick} aria-expanded={isOpen}>{children}</button>;
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  onItemClick?: () => void;
}

export function DropdownMenuContent({ 
  children, 
  align = "center", 
  className = "",
  onItemClick,
  ...props 
}: DropdownMenuContentProps) {
  // Dynamic positioning based on alignment
  const alignmentClass = 
    align === "start" ? "left-0" : 
    align === "end" ? "right-0" : 
    "left-1/2 -translate-x-1/2";
    
  return (
    <div 
      className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-gray-800 p-1 shadow-md ${alignmentClass} ${className}`}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
              if (child.props.onClick) {
                child.props.onClick(e);
              }
              if (onItemClick) {
                onItemClick();
              }
            },
          });
        }
        return child;
      })}
    </div>
  );
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function DropdownMenuItem({ 
  children, 
  className = "",
  ...props 
}: DropdownMenuItemProps) {
  return (
    <button 
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-700 hover:text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 