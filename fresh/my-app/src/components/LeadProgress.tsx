import * as React from "react";
import { Button } from "./ui/button";

const leadStages = [
  {
    name: "Initiated",
    description: "Lead has been created and is ready for assignment",
  },
  {
    name: "Assigned",
    description: "Lead has been assigned to a team member",
  },
  {
    name: "Engaged",
    description: "Initial contact has been made with the lead",
  },
  {
    name: "Done",
    description: "Lead has been converted or closed",
  },
];

export interface LeadProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStatus: string;
  onStatusChange?: (status: string) => void;
}

export function LeadProgress({
  currentStatus,
  onStatusChange,
  className,
  ...props
}: LeadProgressProps) {
  const currentIndex = leadStages.findIndex(
    (stage) => stage.name === currentStatus
  );

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  return (
    <div className={`space-y-6 ${className || ""}`} {...props}>
      <div className="space-y-2">
        <p className="text-sm text-gray-400">
          Track and update the current status of this lead
        </p>
      </div>

      <div className="space-y-6">
        {leadStages.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={stage.name} className="flex">
              <div className="flex flex-col items-center">
                {isCompleted ? (
                  <svg 
                    className="h-6 w-6 shrink-0 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                ) : (
                  <svg 
                    className="h-6 w-6 shrink-0 text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m0 0V8m0 0h8m-8 0H4"></path>
                  </svg>
                )}
                {index < leadStages.length - 1 && (
                  <div
                    className={`w-[1.5px] grow my-1 ${
                      index < currentIndex
                        ? "bg-primary"
                        : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
              <div className="ml-4 pb-8 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-300">{stage.name}</p>
                    <p className="text-sm text-gray-500">
                      {stage.description}
                    </p>
                  </div>
                  {!isCompleted && onStatusChange && (
                    <Button
                      size="sm"
                      className="btn-primary"
                      onClick={() => handleStatusChange(stage.name)}
                    >
                      Set as Current
                    </Button>
                  )}
                  {isCurrent && (
                    <div className="bg-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded">
                      Current Stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 