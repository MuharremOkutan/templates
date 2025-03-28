import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { 
  Button, 
  IconButton,
  GlassCard, 
  GlassCardHeader, 
  GlassCardContent, 
  GlassCardFooter, 
  StatusBadge,
  Skeleton
} from './components/ui';

// Icons
const BackIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EditIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ClockIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ExplorationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the exploration job
  const job = useQuery(api.explorationFunctions.getExplorationJob, 
    id ? { jobId: id as Id<"explorationJobs"> } : "skip"
  );
  
  // Get business context if available
  const businessContext = useQuery(
    api.businessContextFunctions.getBusinessContext, 
    job?.businessContextId ? { id: job.businessContextId as Id<"businessContexts"> } : "skip"
  );
  
  const deleteExplorationJob = useMutation(api.explorationFunctions.deleteExplorationJob);

  const handleDelete = async () => {
    if (!id) return;
    
    const confirm = window.confirm("Are you sure you want to delete this job?");
    if (confirm) {
      setIsDeleting(true);
      try {
        await deleteExplorationJob({ jobId: id as Id<"explorationJobs"> });
        navigate('/exploration');
      } catch (err) {
        console.error(err);
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  // Helper function to ensure status is a valid StatusType
  const getValidStatus = (status?: string): "active" | "inactive" | "pending" | "completed" | "failed" => {
    if (!status) return "inactive";
    
    const validStatuses = ["active", "inactive", "pending", "completed", "failed", "draft", "in-progress", "canceled", "approved", "rejected"];
    return validStatuses.includes(status) 
      ? status as "active" | "inactive" | "pending" | "completed" | "failed" 
      : "inactive";
  };
  
  // Loading state
  if (!job) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BackIcon />}
            onClick={() => navigate('/exploration')}
          >
            Back
          </Button>
        </div>
        
        <GlassCard variant="gradient">
          <GlassCardHeader>
            <Skeleton className="h-8 w-3/4" />
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<BackIcon />}
          onClick={() => navigate('/exploration')}
        >
          Back
        </Button>
        
        <div className="ml-auto space-x-2">
          <IconButton
            variant="secondary"
            size="sm"
            icon={<EditIcon />}
            onClick={() => navigate(`/exploration/${id}/edit`)}
            aria-label="Edit"
          />
          <IconButton
            variant="danger"
            size="sm"
            icon={<DeleteIcon />}
            onClick={handleDelete}
            isLoading={isDeleting}
            aria-label="Delete"
          />
        </div>
      </div>
      
      <GlassCard variant="gradient" className="mb-8">
        <GlassCardHeader className="border-b border-slate-700/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">{job.name}</h1>
              <p className="text-slate-300 mb-4">{job.description}</p>
              
              <div className="flex items-center gap-4">
                <StatusBadge status={getValidStatus(job.status)} />
                
                {businessContext && (
                  <div 
                    className="text-sm text-cyan-400 flex items-center gap-1.5"
                  >
                    <span>Business Context:</span>
                    <span className="font-medium">{businessContext.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCardHeader>
        
        <GlassCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-3">Exploration Details</h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">Created:</span>
                  <span className="text-slate-200">{formatDate(job.createdAt)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CalendarIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">Updated:</span>
                  <span className="text-slate-200">{formatDate(job.updatedAt)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <UserIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">Last Run:</span>
                  <span className="text-slate-200">{formatDate(job.lastRun)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-3">Schedule Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">Start Date:</span>
                  <span className="text-slate-200">
                    {job.startDate ? new Date(job.startDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CalendarIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">End Date:</span>
                  <span className="text-slate-200">
                    {job.endDate ? new Date(job.endDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                
                <div className="flex flex-col text-sm">
                  <div className="flex items-center mb-1">
                    <ClockIcon className="text-slate-400 mr-2" />
                    <span className="text-slate-400 w-24">Schedule:</span>
                  </div>
                  
                  <div className="ml-6 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-slate-400">Days:</span>
                      {job.scheduleDays && job.scheduleDays.map((day: number) => (
                        <span key={day} className="text-xs bg-slate-800/50 px-2 py-0.5 rounded-full text-slate-300">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-slate-400">Hours:</span>
                      {job.scheduleHours && job.scheduleHours.map((hour: number) => (
                        <span key={hour} className="text-xs bg-slate-800/50 px-2 py-0.5 rounded-full text-slate-300">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {businessContext && (
            <div className="mt-8">
              <GlassCard variant="gradient" color="accent">
                <GlassCardHeader>
                  <h3 className="text-lg font-medium text-white">Business Context</h3>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="prose prose-invert max-w-none">
                    <h4>{businessContext.title}</h4>
                    <p>{businessContext.description}</p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          )}
        </GlassCardContent>
        
        <GlassCardFooter>
          <Button
            variant="primary"
            leftIcon={<PlayIcon />}
            onClick={() => navigate('/exploration')}
          >
            Back to Explorations
          </Button>
        </GlassCardFooter>
      </GlassCard>
    </div>
  );
} 