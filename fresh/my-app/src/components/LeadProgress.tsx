import React from "react";

interface LeadProgressProps {
  currentStatus: string;
}

export function LeadProgress({ currentStatus }: LeadProgressProps) {
  const stages = ["Initiated", "Assigned", "Engaged", "Done"];
  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Lead Progress</h3>
      
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-700">
          <div 
            className="h-0.5 bg-primary transition-all" 
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
        
        {/* Progress steps */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={stage} className="flex flex-col items-center">
                <div 
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isCompleted 
                      ? "border-primary bg-primary text-white" 
                      : "border-gray-700 bg-gray-800 text-gray-500"
                  } ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-gray-900" : ""}`}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={`mt-2 text-sm ${
                    isCompleted ? "text-primary" : "text-gray-500"
                  } ${isCurrent ? "font-medium" : ""}`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end space-x-2 mt-8">
        <button className="btn-secondary">Move Back</button>
        <button className="btn-primary">Move Forward</button>
      </div>
    </div>
  );
} 