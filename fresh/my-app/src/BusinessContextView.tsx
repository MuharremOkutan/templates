import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  Button,
  IconButton,
  GlassCard,
  GlassCardHeader,
  GlassCardContent,
  GlassCardFooter,
  Skeleton
} from "./components";

// Icons
const BackIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

export default function BusinessContextView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Convert string id to Id type
  const typedId = id ? Id.from(id) : null;
  
  // Fetch the business context
  const context = useQuery(
    api.businessContextFunctions.getBusinessContext,
    typedId ? { id: typedId } : "skip"
  );
  
  // Get the user info
  const user = useQuery(api.users.getUser);
  
  // Fetch exploration jobs that use this context
  const relatedExplorations = useQuery(
    api.explorationJobFunctions.listExplorationJobsByBusinessContext,
    typedId ? { businessContextId: typedId } : "skip"
  );
  
  // Delete mutation
  const deleteBusinessContext = useMutation(api.businessContextFunctions.deleteBusinessContext);
  
  // Handle delete
  const handleDelete = async () => {
    if (!typedId) return;
    
    if (relatedExplorations && relatedExplorations.length > 0) {
      if (!window.confirm(`This business context is used by ${relatedExplorations.length} exploration job(s). Deleting it may affect these jobs. Are you sure you want to proceed?`)) {
        return;
      }
    } else if (!window.confirm("Are you sure you want to delete this business context?")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteBusinessContext({ id: typedId });
      navigate("/business-context");
    } catch (error) {
      console.error("Error deleting context:", error);
      alert("Failed to delete context");
      setIsDeleting(false);
    }
  };
  
  // Format date nicely
  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (err) {
      return "Unknown date";
    }
  };
  
  // Is this context owned by the current user?
  const isOwner = user && context ? user._id === context.userId : false;
  
  // Show loading state
  if (typedId && context === undefined) {
    return (
      <div className="max-w-4xl mx-auto">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-20" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-4">
              <Skeleton className="h-6 w-40" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }
  
  // Show error if context not found
  if (typedId && context === null) {
    return (
      <GlassCard className="max-w-4xl mx-auto p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-medium mb-2 text-white">Business Context Not Found</h3>
        <p className="text-gray-400 mb-6">
          The business context you're trying to view does not exist or has been deleted.
        </p>
        <Link to="/business-context">
          <Button>Back to Business Contexts</Button>
        </Link>
      </GlassCard>
    );
  }
  
  if (!context) return null;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard>
        <GlassCardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link to="/business-context">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    leftIcon={<BackIcon />}
                    className="text-gray-400 hover:text-white"
                  >
                    Back
                  </Button>
                </Link>
                <h4 className="text-xs text-gray-500 uppercase tracking-wider">Business Context</h4>
              </div>
              <h1 className="text-2xl font-bold gradient-text">{context.title}</h1>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Link to={`/business-context/edit/${context._id}`}>
                  <Button 
                    variant="secondary" 
                    leftIcon={<EditIcon />}
                    size="sm"
                  >
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="danger"
                  leftIcon={<DeleteIcon />}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  size="sm"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </GlassCardHeader>
        
        <GlassCardContent>
          <div className="space-y-6">
            {/* Description */}
            <div className="prose prose-slate prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-200">
              <p className="whitespace-pre-line">{context.description}</p>
            </div>
            
            {/* Metadata */}
            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-lg font-medium mb-3 text-gray-200">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-800/50 p-4 border border-gray-700/50">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <CalendarIcon />
                    <span className="ml-2">Created</span>
                  </div>
                  <div className="text-gray-300">{formatDate(context.createdAt)}</div>
                </div>
                
                <div className="rounded-lg bg-slate-800/50 p-4 border border-gray-700/50">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <CalendarIcon />
                    <span className="ml-2">Updated</span>
                  </div>
                  <div className="text-gray-300">{formatDate(context.updatedAt)}</div>
                </div>
              </div>
            </div>
            
            {/* Related Explorations */}
            {relatedExplorations !== undefined && (
              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-lg font-medium mb-3 text-gray-200">
                  Related Exploration Jobs
                  <span className="ml-2 inline-flex items-center justify-center text-xs font-medium text-gray-500 bg-gray-800 rounded-full w-6 h-6">
                    {relatedExplorations.length}
                  </span>
                </h3>
                
                {relatedExplorations.length > 0 ? (
                  <div className="space-y-3">
                    {relatedExplorations.map(job => (
                      <div 
                        key={job._id} 
                        className="rounded-lg border border-gray-700/50 p-3 bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
                      >
                        <Link to={`/exploration/job/${job._id}`} className="block">
                          <div className="font-medium text-primary hover:text-primary/80 transition-colors">
                            {job.name}
                          </div>
                          <div className="text-sm text-gray-400 line-clamp-1 mt-1">
                            {job.description}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm italic">
                    This business context is not used by any exploration jobs yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCardContent>
        
        <GlassCardFooter bordered>
          <Link to="/business-context" className="mr-auto">
            <Button variant="secondary" size="sm">
              Back to List
            </Button>
          </Link>
        </GlassCardFooter>
      </GlassCard>
    </div>
  );
} 