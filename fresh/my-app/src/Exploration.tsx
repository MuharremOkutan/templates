import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { 
  Button, 
  IconButton, 
  GlassCard, 
  GlassCardHeader, 
  GlassCardContent, 
  GlassCardFooter,
  StatusBadge,
  Skeleton,
  SkeletonCard
} from "./components";

// Date picker component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Icons
const PlusIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EditIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlayIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface ExplorationJob {
  _id?: Id<"explorationJobs">;
  name: string;
  description: string;
  businessContextId: Id<"businessContexts"> | null;
  collectionId: Id<"collections"> | null;
  startDate: Date | null;
  endDate: Date | null;
  scheduleDays: number[];
  scheduleHours: number[];
  createdAt: number;
  userId: Id<"users">;
  status?: string;
  lastRun?: number;
}

export default function Exploration() {
  const navigate = useNavigate();
  
  // State for UI
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<ExplorationJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for form
  const [description, setDescription] = useState("");
  const [selectedBusinessContext, setSelectedBusinessContext] = useState<Id<"businessContexts"> | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Id<"collections"> | null>(null);
  const [daysRange, setDaysRange] = useState(7); // Default 7 days
  const [scheduleTime, setScheduleTime] = useState("09:00"); // Default 9 AM
  
  // Query data
  const businessContexts = useQuery(api.businessContextFunctions.listBusinessContexts) || [];
  const collections = useQuery(api.promptFunctions.listCollections) || [];
  const explorationJobs = useQuery(api.explorationFunctions.listExplorationJobs) || [];
  
  // Get selected business context and collection data
  const selectedBusinessContextData = businessContexts.find(ctx => ctx._id === selectedBusinessContext);
  const selectedCollectionData = collections.find(col => col._id === selectedCollection);
  
  // Mutations
  const createExplorationJob = useMutation(api.explorationFunctions.createExplorationJob);
  const triggerExplorationJob = useMutation(api.explorationFunctions.triggerExplorationJob);
  const deleteExplorationJob = useMutation(api.explorationFunctions.deleteExplorationJob);
  const updateExplorationJob = useMutation(api.explorationFunctions.updateExplorationJob);
  const initializeSystem = useMutation(api.explorationFunctions.initializeExplorationSystem);
  
  // For demo purposes, assuming first user is admin (in real app, check admin status)
  const isAdmin = true;

  // Initialize the exploration system
  const handleInitializeSystem = async () => {
    try {
      const result = await initializeSystem();
      alert(`System initialized. Scheduler ID: ${result}`);
    } catch (error) {
      console.error("Failed to initialize system:", error);
      alert(`Failed to initialize system: ${error}`);
    }
  };
  
  // Check if a collection exists and belongs to the current user
  const checkCollectionAccess = (collectionId: Id<"collections">) => {
    const collection = collections.find(col => col._id === collectionId);
    if (!collection) {
      return false;
    }
    return true;
  };
  
  // Check if a business context exists and belongs to the current user
  const checkBusinessContextAccess = (contextId: Id<"businessContexts">) => {
    const context = businessContexts.find(ctx => ctx._id === contextId);
    if (!context) {
      return false;
    }
    return true;
  };
  
  // Handle edit button click
  const handleEditJob = (job: any) => {
    navigate(`/exploration/${job._id}/edit`);
  };
  
  // Handle form cancellation
  const handleCancelEdit = () => {
    setEditingJob(null);
    setDescription("");
    setSelectedBusinessContext(null);
    setSelectedCollection(null);
    setDaysRange(7);
    setScheduleTime("09:00");
    setShowCreateForm(false);
  };
  
  // Handle activating/deactivating a job
  const toggleJobStatus = async (job: any) => {
    try {
      const newStatus = job.status === "active" ? "inactive" : "active";
      await updateExplorationJob({
        jobId: job._id,
        status: newStatus
      });
    } catch (error) {
      console.error("Failed to update job status:", error);
      alert(`Error updating job status: ${error}`);
    }
  };
  
  // Handle triggering a job
  const handleTriggerJob = async (jobId: Id<"explorationJobs">) => {
    setIsLoading(true);
    try {
      await triggerExplorationJob({ jobId });
    } catch (error) {
      console.error("Failed to trigger job:", error);
      alert(`Error triggering job: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle deleting a job
  const handleDeleteJob = async (jobId: Id<"explorationJobs">) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteExplorationJob({ jobId });
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert(`Error deleting job: ${error}`);
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!selectedBusinessContext || !selectedCollection) {
      alert("Please select both a business context and a prompt collection");
      setIsLoading(false);
      return;
    }
    
    // Check if the user has access to the selected collection and business context
    if (!checkCollectionAccess(selectedCollection)) {
      alert("You don't have permission to use the selected collection");
      setIsLoading(false);
      return;
    }
    
    if (!checkBusinessContextAccess(selectedBusinessContext)) {
      alert("You don't have permission to use the selected business context");
      setIsLoading(false);
      return;
    }
    
    try {
      // Convert schedule time string to hours array
      const hour = parseInt(scheduleTime.split(':')[0]);
      const scheduleHours = [hour];
      
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysRange);
      
      if (editingJob) {
        // Update existing job
        await updateExplorationJob({
          jobId: editingJob._id!,
          description,
          businessContextId: selectedBusinessContext,
          collectionId: selectedCollection,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          scheduleDays: [0, 1, 2, 3, 4, 5, 6], // All days by default
          scheduleHours,
        });
      } else {
        // Generate name based on selected business context and collection
        const jobName = `${selectedBusinessContextData?.title || 'Unnamed'} - ${selectedCollectionData?.name || 'Unnamed'}`;
        
        // Create new job
        await createExplorationJob({
          name: jobName,
          description,
          businessContextId: selectedBusinessContext,
          collectionId: selectedCollection,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          scheduleDays: [0, 1, 2, 3, 4, 5, 6], // All days by default
          scheduleHours,
        });
      }
      
      // Reset form
      setEditingJob(null);
      setDescription("");
      setSelectedBusinessContext(null);
      setSelectedCollection(null);
      setDaysRange(7);
      setScheduleTime("09:00");
      
      // Hide the create form
      setShowCreateForm(false);
      
    } catch (error) {
      console.error("Failed to save exploration job:", error);
      alert(`Error saving job: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Days of the week
  const days = [
    { id: 0, name: "Sunday" },
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
  ];

  // Get business context name by ID
  const getBusinessContextName = (id: Id<"businessContexts">) => {
    const context = businessContexts.find(ctx => ctx._id === id);
    return context ? context.title : "Unknown";
  };

  // Get collection name by ID
  const getCollectionName = (id: Id<"collections">) => {
    const collection = collections.find(col => col._id === id);
    return collection ? collection.name : "Unknown";
  };

  // Format date for display
  const formatDate = (date: Date | null | string) => {
    if (!date) return "N/A";
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  // Add this near the top of the component
  const handleCreateNew = () => {
    navigate('/exploration/create');
  };

  // Loading state
  if (explorationJobs === undefined || businessContexts === undefined || collections === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold gradient-text">Exploration Jobs</h1>
          <Skeleton variant="button" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-text">Exploration Jobs</h1>
        
        {!showCreateForm && (
          <Button
            leftIcon={<PlusIcon />}
            onClick={handleCreateNew}
          >
            Create New Exploration
          </Button>
        )}
      </div>

      {showCreateForm ? (
        <GlassCard variant="gradient" className="mb-8 overflow-visible">
          <GlassCardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {editingJob ? 'Edit Exploration Job' : 'Create New Exploration Job'}
            </h2>
            <IconButton
              icon={<CloseIcon />}
              variant="ghost"
              aria-label="Close"
              onClick={handleCancelEdit}
            />
          </GlassCardHeader>
          
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Column */}
              <div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-primary w-full"
                      placeholder="Enter job description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="businessContext" className="block text-sm font-medium text-gray-300 mb-1">
                      Business Context
                    </label>
                    <select
                      id="businessContext"
                      value={selectedBusinessContext || ""}
                      onChange={(e) => setSelectedBusinessContext(e.target.value ? e.target.value as Id<"businessContexts"> : null)}
                      className="input-primary w-full"
                      required
                    >
                      <option value="">Select Business Context</option>
                      {businessContexts.map((context) => (
                        <option key={context._id} value={context._id}>
                          {context.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="collection" className="block text-sm font-medium text-gray-300 mb-1">
                      Prompt Collection
                    </label>
                    <select
                      id="collection"
                      value={selectedCollection || ""}
                      onChange={(e) => setSelectedCollection(e.target.value ? e.target.value as Id<"collections"> : null)}
                      className="input-primary w-full"
                      required
                    >
                      <option value="">Select Prompt Collection</option>
                      {collections.map((collection) => (
                        <option key={collection._id} value={collection._id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="daysRange" className="block text-sm font-medium text-gray-300 mb-1">
                      Days Range: {daysRange} days
                    </label>
                    <input
                      id="daysRange"
                      type="range"
                      min="0"
                      max="30"
                      value={daysRange}
                      onChange={(e) => setDaysRange(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0 days</span>
                      <span>15 days</span>
                      <span>30 days</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-300 mb-1">
                      Schedule Time
                    </label>
                    <input
                      id="scheduleTime"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="input-primary w-full"
                      required
                    />
                  </div>

                  <div className="flex gap-4 mt-4">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      type="submit"
                      isLoading={isLoading}
                      disabled={!selectedBusinessContext || !selectedCollection || isLoading}
                    >
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </Button>
                  </div>
                </form>
              </div>
              
              {/* Preview Column */}
              <GlassCard variant="gradient" color="accent" className="h-full">
                <GlassCardHeader>
                  <h3 className="text-lg font-semibold text-white">Job Preview</h3>
                </GlassCardHeader>
                
                <GlassCardContent>
                  {(!selectedBusinessContext || !selectedCollection) ? (
                    <div className="text-center p-6">
                      <p className="text-gray-400">Select a business context and prompt collection to see the preview.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-md font-medium text-gray-300">Job Details</h4>
                        <p className="text-white text-lg font-semibold mt-1">
                          {`${selectedBusinessContextData?.title} - ${selectedCollectionData?.name}`}
                        </p>
                        {description && <p className="text-gray-400 mt-1">{description}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 text-sm">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">Business Context:</span>
                          <span className="text-gray-300 font-medium">
                            {selectedBusinessContextData?.title}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-2">Prompt Collection:</span>
                          <span className="text-gray-300 font-medium">
                            {selectedCollectionData?.name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon />
                          <span className="text-gray-500 ml-2 mr-2">Date Range:</span>
                          <span className="text-gray-300 font-medium">
                            {formatDate(new Date())} - {formatDate(new Date(Date.now() + daysRange * 24 * 60 * 60 * 1000))}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon />
                          <span className="text-gray-500 ml-2 mr-2">Schedule Time:</span>
                          <span className="text-gray-300 font-medium">
                            {scheduleTime}
                          </span>
                        </div>
                      </div>
                      
                      {selectedBusinessContextData && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-300 mb-2">Business Context Preview</h4>
                          <div className="glass-card p-3 max-h-32 overflow-y-auto">
                            <p className="text-gray-300 text-sm whitespace-pre-line">
                              {selectedBusinessContextData.description || "No content available"}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedCollectionData && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-300 mb-2">Prompt Collection Preview</h4>
                          <div className="glass-card p-3 max-h-32 overflow-y-auto">
                            <p className="text-gray-300 text-sm">
                              {selectedCollectionData.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>
          </GlassCardContent>
        </GlassCard>
      ) : null}

      {/* Exploration Jobs List */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your Exploration Jobs</h2>
              <p className="text-gray-400 text-sm">Manage your automated exploration jobs to discover news and insights.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusIcon />}
              onClick={handleCreateNew}
            >
              New Exploration
            </Button>
          </div>
        </GlassCardHeader>
        
        <GlassCardContent>
          {explorationJobs.length === 0 ? (
            <div className="text-center p-8 my-4">
              <svg 
                className="w-16 h-16 mx-auto text-gray-600 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <p className="text-gray-400 mb-4">No exploration jobs created yet.</p>
              <Button
                variant="primary"
                leftIcon={<PlusIcon />}
                onClick={handleCreateNew}
              >
                Create Your First Job
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {explorationJobs.map((job: any) => (
                <GlassCard 
                  key={job._id} 
                  variant="gradient" 
                  className="h-full flex flex-col"
                  color={job.status === 'active' ? 'primary' : 'neutral'}
                >
                  <GlassCardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{job.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{job.description || "No description"}</p>
                      </div>
                      <StatusBadge 
                        status={job.status === 'active' ? 'active' : 'inactive'} 
                        className="ml-2 mt-1"
                      />
                    </div>
                  </GlassCardHeader>
                  
                  <GlassCardContent className="py-3 flex-1">
                    <div className="grid grid-cols-1 gap-y-3 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-36">Business Context:</span>
                        <span className="text-gray-300 truncate">
                          {job.businessContextId ? getBusinessContextName(job.businessContextId) : "None"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-36">Prompt Collection:</span>
                        <span className="text-gray-300 truncate">
                          {job.collectionId ? getCollectionName(job.collectionId) : "None"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-36">Date Range:</span>
                        <span className="text-gray-300">
                          {formatDate(job.startDate)} - {formatDate(job.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-36">Created:</span>
                        <span className="text-gray-300">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1 items-center mb-2">
                        <span className="text-xs text-gray-500 mr-1">Days:</span>
                        {job.scheduleDays.map((day: number) => (
                          <span key={day} className="text-xs bg-gray-800/70 text-gray-300 px-2 py-0.5 rounded-full">
                            {days.find(d => d.id === day)?.name.substring(0, 3)}
                          </span>
                        ))}
                        {job.scheduleDays.length === 0 && <span className="text-xs text-gray-400">None</span>}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-xs text-gray-500 mr-1">Hours:</span>
                        {job.scheduleHours.map((hour: number) => (
                          <span key={hour} className="text-xs bg-gray-800/70 text-gray-300 px-2 py-0.5 rounded-full">
                            {hour.toString().padStart(2, '0')}:00
                          </span>
                        ))}
                        {job.scheduleHours.length === 0 && <span className="text-xs text-gray-400">None</span>}
                      </div>
                    </div>
                  </GlassCardContent>
                  
                  <GlassCardFooter className="pt-4 justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleJobStatus(job)}
                      >
                        {job.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<PlayIcon />}
                        onClick={() => navigate(`/exploration/${job._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <IconButton
                        icon={<PlayIcon />}
                        variant="secondary"
                        size="sm"
                        aria-label="Trigger now"
                        onClick={() => handleTriggerJob(job._id)}
                      />
                      <IconButton
                        icon={<EditIcon />}
                        variant="secondary"
                        size="sm"
                        aria-label="Edit"
                        onClick={() => handleEditJob(job)}
                      />
                      <IconButton
                        icon={<TrashIcon />}
                        variant="ghost"
                        size="sm"
                        aria-label="Delete"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => handleDeleteJob(job._id)}
                      />
                    </div>
                  </GlassCardFooter>
                </GlassCard>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
} 