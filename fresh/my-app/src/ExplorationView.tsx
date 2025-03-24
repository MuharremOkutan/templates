import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  const { data: exploration, isLoading, error } = useQuery(api.explorationFunctions.getExploration, 
    id ? { id: id as Id<"explorationJobs"> } : "skip"
  );
  const { data: creator } = useQuery(api.userFunctions.getUser, 
    exploration ? { id: exploration.userId as Id<"users"> } : "skip"
  );
  const { data: businessContext } = useQuery(api.businessContextFunctions.getBusinessContext, 
    exploration ? { id: exploration.businessContextId as Id<"businessContexts"> } : "skip"
  );
  const { data: runs } = useQuery(api.explorationFunctions.listExplorationRuns, 
    exploration ? { explorationId: exploration.id as Id<"explorationJobs"> } : "skip"
  );
  
  const deleteExploration = useMutation(api.explorationFunctions.deleteExplorationJob);

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this exploration?");
    if (confirm) {
      setIsDeleting(true);
      try {
        await deleteExploration.mutateAsync({ id: id as Id<"explorationJobs"> });
        navigate('/explorations');
      } catch (err) {
        console.error(err);
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BackIcon />}
            onClick={() => navigate('/explorations')}
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

  if (error || !exploration) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BackIcon />}
            onClick={() => navigate('/explorations')}
          >
            Back
          </Button>
        </div>
        
        <GlassCard>
          <GlassCardContent>
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-red-400 mb-2">Error Loading Exploration</h3>
              <p className="text-slate-400">
                The exploration could not be found or there was an error loading it.
              </p>
              <Button 
                variant="secondary"
                className="mt-6"
                onClick={() => navigate('/explorations')}
              >
                Return to Explorations
              </Button>
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
          onClick={() => navigate('/explorations')}
        >
          Back
        </Button>
        
        <div className="ml-auto space-x-2">
          <IconButton
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/explorations/${id}/edit`)}
            aria-label="Edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            aria-label="Delete"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
      
      <GlassCard variant="gradient" className="mb-8">
        <GlassCardHeader className="border-b border-slate-700/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">{exploration.name}</h1>
              <p className="text-slate-300 mb-4">{exploration.description}</p>
              
              <div className="flex items-center gap-4">
                <StatusBadge status={exploration.status} />
                
                {businessContext && (
                  <Link 
                    to={`/business-contexts/${businessContext.id}`}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>Business Context:</span>
                    <span className="font-medium">{businessContext.name}</span>
                  </Link>
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
                  <span className="text-slate-200">{formatDate(exploration.createdAt)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CalendarIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">Updated:</span>
                  <span className="text-slate-200">{formatDate(exploration.updatedAt)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <UserIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">Created by:</span>
                  <span className="text-slate-200">{creator?.name || 'Unknown'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <ClockIcon className="text-slate-400 mr-2" />
                  <span className="text-slate-400 w-24">Duration:</span>
                  <span className="text-slate-200">{exploration.estimatedDuration || 'Not specified'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Additional Information</h3>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-300 whitespace-pre-wrap">
                  {exploration.additionalInformation || 'No additional information provided.'}
                </p>
              </div>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Exploration Runs</h2>
        
        {runs && runs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {runs.map((run: any) => (
              <GlassCard key={run.id} className="h-full">
                <GlassCardHeader className="border-b border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white">{run.name || `Run #${run.runNumber}`}</h3>
                    <StatusBadge status={run.status} />
                  </div>
                </GlassCardHeader>
                
                <GlassCardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="text-slate-400 mr-2" />
                      <span className="text-slate-400 w-16">Started:</span>
                      <span className="text-slate-200">{formatDate(run.startedAt)}</span>
                    </div>
                    
                    {run.completedAt && (
                      <div className="flex items-center text-sm">
                        <ClockIcon className="text-slate-400 mr-2" />
                        <span className="text-slate-400 w-16">Duration:</span>
                        <span className="text-slate-200">
                          {Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 60000)} minutes
                        </span>
                      </div>
                    )}
                    
                    <p className="text-slate-300 text-sm mt-2">
                      {run.summary || 'No summary available.'}
                    </p>
                  </div>
                </GlassCardContent>
                
                <GlassCardFooter bordered className="justify-end">
                  <Button 
                    variant="primary" 
                    size="sm"
                    leftIcon={<PlayIcon />}
                    onClick={() => navigate(`/exploration-runs/${run.id}`)}
                  >
                    View Details
                  </Button>
                </GlassCardFooter>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard>
            <GlassCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Runs Yet</h3>
                <p className="text-slate-400 mb-6">
                  This exploration hasn't been run yet. Start a new run to collect results.
                </p>
                <Button 
                  variant="primary"
                  leftIcon={<PlayIcon />}
                  onClick={() => navigate(`/explorations/${id}/run`)}
                >
                  Start New Run
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
} 