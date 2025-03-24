import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  Button,
  GlassCard,
  GlassCardHeader,
  GlassCardContent,
  GlassCardFooter,
  Input,
  Textarea,
  Skeleton
} from "./components";

// Icons
const BackIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SaveIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

export default function BusinessContextEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  
  // Convert string id to Id type
  const typedId = id ? Id.from(id) : null;
  
  // Fetch the business context
  const context = useQuery(
    api.businessContextFunctions.getBusinessContext,
    typedId ? { id: typedId } : "skip"
  );
  
  // Mutations
  const updateBusinessContext = useMutation(api.businessContextFunctions.updateBusinessContext);
  
  // Populate form with context data when it's loaded
  useEffect(() => {
    if (context) {
      setTitle(context.title);
      setDescription(context.description);
    }
  }, [context]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setTitleError(null);
    setDescriptionError(null);
    
    // Validate title
    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    } else if (title.length < 3) {
      setTitleError("Title must be at least 3 characters");
      isValid = false;
    } else if (title.length > 100) {
      setTitleError("Title must be less than 100 characters");
      isValid = false;
    }
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError("Description is required");
      isValid = false;
    } else if (description.length < 10) {
      setDescriptionError("Description must be at least 10 characters");
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!typedId) {
      setError("Invalid business context ID");
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateBusinessContext({
        id: typedId,
        title: title.trim(),
        description: description.trim(),
      });
      
      navigate("/business-context");
    } catch (err) {
      console.error("Error updating business context:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (typedId && context === undefined) {
    return (
      <div className="max-w-3xl mx-auto">
        <GlassCard>
          <GlassCardHeader>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-full mt-2" />
          </GlassCardHeader>
          <GlassCardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </GlassCardContent>
          <GlassCardFooter className="justify-end">
            <Skeleton className="h-10 w-28" />
          </GlassCardFooter>
        </GlassCard>
      </div>
    );
  }
  
  // Show error if context not found
  if (typedId && context === null) {
    return (
      <GlassCard className="max-w-3xl mx-auto p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-medium mb-2 text-white">Business Context Not Found</h3>
        <p className="text-gray-400 mb-6">
          The business context you're trying to edit does not exist or has been deleted.
        </p>
        <Link to="/business-context">
          <Button>Back to Business Contexts</Button>
        </Link>
      </GlassCard>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard>
          <GlassCardHeader className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text">Edit Business Context</h2>
              <Link to="/business-context">
                <Button 
                  variant="secondary" 
                  leftIcon={<BackIcon />}
                  size="sm"
                >
                  Back to List
                </Button>
              </Link>
            </div>
            <p className="text-gray-400">
              Update the business context details to better align with your organization's needs.
            </p>
          </GlassCardHeader>
          
          <GlassCardContent className="space-y-6">
            {error && (
              <div className="p-4 mb-4 text-sm rounded-lg bg-red-900/30 text-red-400 border border-red-800/50">
                <div className="flex">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                type="text"
                label="Title"
                placeholder="e.g., Customer Support Guidelines"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={titleError}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Textarea
                label="Description"
                placeholder="Describe the business context in detail. Include key terms, policies, tone, and specific requirements for your organization."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={descriptionError}
                rows={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Detailed descriptions help create more accurate and relevant prompts aligned with your business needs.
              </p>
            </div>
          </GlassCardContent>
          
          <GlassCardFooter bordered className="justify-end">
            <div className="flex space-x-3">
              <Link to="/business-context">
                <Button variant="secondary" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                leftIcon={<SaveIcon />}
                isLoading={isSubmitting}
                loadingText="Updating..."
              >
                Update Context
              </Button>
            </div>
          </GlassCardFooter>
        </GlassCard>
      </form>
    </div>
  );
} 