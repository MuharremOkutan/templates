import React, { useState } from "react";

interface LeadProgressProps {
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

export function LeadProgress({ currentStatus, onStatusChange }: LeadProgressProps) {
  console.log("LeadProgress component rendered with status:", currentStatus);
  const stages = ["Initiated", "Assigned", "Engaged", "Done"];
  const [status, setStatus] = useState(currentStatus);
  const currentIndex = stages.indexOf(status);

  const handleMoveForward = () => {
    if (currentIndex < stages.length - 1) {
      const newStatus = stages[currentIndex + 1];
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    }
  };

  const handleMoveBack = () => {
    if (currentIndex > 0) {
      const newStatus = stages[currentIndex - 1];
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    }
  };

  const handleStageClick = (clickedIndex: number) => {
    // Only allow moving to already completed stages or the next available stage
    if (clickedIndex <= currentIndex + 1 && clickedIndex !== currentIndex) {
      const newStatus = stages[clickedIndex];
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Lead Progress</h3>
      
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-700">
          <div 
            className="h-0.5 bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
        
        {/* Progress steps */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isClickable = index <= currentIndex + 1;
            
            return (
              <div 
                key={stage} 
                className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`} 
                onClick={() => handleStageClick(index)}
              >
                <div 
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? "border-primary bg-primary text-white" 
                      : "border-gray-700 bg-gray-800 text-gray-500"
                  } ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-gray-900" : ""}
                  ${isClickable && !isCurrent ? "hover:border-primary hover:bg-gray-900" : ""}`}
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
                  className={`mt-2 text-sm transition-colors ${
                    isCompleted ? "text-primary" : "text-gray-500"
                  } ${isCurrent ? "font-medium" : ""} ${isClickable && !isCurrent ? "group-hover:text-gray-300" : ""}`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage description */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
        <h4 className="text-primary font-medium mb-2">{stages[currentIndex]}</h4>
        <p className="text-sm text-gray-400">
          {currentIndex === 0 && "Lead has been initiated but not yet assigned to a team member."}
          {currentIndex === 1 && "Lead has been assigned to a team member for follow-up."}
          {currentIndex === 2 && "Team member has engaged with the lead and communication is ongoing."}
          {currentIndex === 3 && "Lead has been successfully converted or marked as completed."}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-gray-400">
          <span className="font-medium text-primary">{currentIndex + 1}</span> of {stages.length} stages
        </div>
        <div className="flex space-x-2">
          <button 
            className={`btn-secondary transition-all ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
            onClick={handleMoveBack}
            disabled={currentIndex === 0}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Previous Stage
          </button>
          <button 
            className={`btn-primary transition-all ${currentIndex === stages.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'}`}
            onClick={handleMoveForward}
            disabled={currentIndex === stages.length - 1}
          >
            Next Stage
            <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 