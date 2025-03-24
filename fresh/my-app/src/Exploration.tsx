import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";

// Date picker component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const _navigate = useNavigate();
  
  // State for UI
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<ExplorationJob | null>(null);
  
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
    
    // In a real app with proper authentication, this check would be:
    // return collection.userId === currentUser._id;
    
    // For now, let's trust that the collections returned by the API
    // already belong to the current user (they should be filtered server-side)
    return true;
  };
  
  // Check if a business context exists and belongs to the current user
  const checkBusinessContextAccess = (contextId: Id<"businessContexts">) => {
    const context = businessContexts.find(ctx => ctx._id === contextId);
    if (!context) {
      return false;
    }
    // In a real app, you would compare context.userId to the current user's ID
    // Here we're just checking if the context exists in the user's context list
    return true;
  };
  
  // Handle edit button click
  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setDescription(job.description || "");
    setSelectedBusinessContext(job.businessContextId);
    setSelectedCollection(job.collectionId);
    setDaysRange(job.endDate && job.startDate ? 
      Math.ceil((new Date(job.endDate).getTime() - new Date(job.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 
      7);
    setScheduleTime(job.scheduleHours && job.scheduleHours.length > 0 ? 
      `${job.scheduleHours[0].toString().padStart(2, '0')}:00` : 
      "09:00");
    setShowCreateForm(true);
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBusinessContext || !selectedCollection) {
      alert("Please select both a business context and a prompt collection");
      return;
    }
    
    // Check if the user has access to the selected collection and business context
    if (!checkCollectionAccess(selectedCollection)) {
      alert("You don't have permission to use the selected collection");
      return;
    }
    
    if (!checkBusinessContextAccess(selectedBusinessContext)) {
      alert("You don't have permission to use the selected business context");
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold gradient-text">Exploration Jobs</h1>
        
        {!showCreateForm && (
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create New Job
          </button>
        )}
      </div>

      {showCreateForm ? (
        <div className="glass-card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {editingJob ? 'Edit Exploration Job' : 'Create New Exploration Job'}
            </h2>
            <button 
              className="text-gray-400 hover:text-white transition-colors"
              onClick={handleCancelEdit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Column */}
            <div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-primary w-full"
                    placeholder="Job description"
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
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={!selectedBusinessContext || !selectedCollection}
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Preview Column */}
            <div className="glass-card gradient-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Job Preview</h3>
              
              {(!selectedBusinessContext || !selectedCollection) ? (
                <div className="text-center p-6">
                  <p className="text-gray-400">Select a business context and prompt collection to see the preview.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-300">Job Details</h4>
                    <p className="text-white text-lg font-semibold mt-1">
                      {`${selectedBusinessContextData?.title} - ${selectedCollectionData?.name}`}
                    </p>
                    {description && <p className="text-gray-400 mt-1">{description}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Business Context:</span>
                      <span className="text-gray-300 ml-2 font-medium">
                        {selectedBusinessContextData?.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Prompt Collection:</span>
                      <span className="text-gray-300 ml-2 font-medium">
                        {selectedCollectionData?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date Range:</span>
                      <span className="text-gray-300 ml-2 font-medium">
                        {formatDate(new Date())} - {formatDate(new Date(Date.now() + daysRange * 24 * 60 * 60 * 1000))}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Schedule Time:</span>
                      <span className="text-gray-300 ml-2 font-medium">
                        {scheduleTime}
                      </span>
                    </div>
                  </div>
                  
                  {selectedBusinessContextData && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-300 mb-2">Business Context Content</h4>
                      <div className="glass-card p-3 max-h-32 overflow-y-auto">
                        <p className="text-gray-300 text-sm whitespace-pre-line">
                          {selectedBusinessContextData.description || "No content available"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedCollectionData && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-300 mb-2">Prompts</h4>
                      <div className="glass-card p-3 max-h-32 overflow-y-auto">
                        <p className="text-gray-300 text-sm">
                          {selectedCollectionData.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Exploration Jobs List */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-6 text-white">Your Exploration Jobs</h2>
        
        {explorationJobs.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-400">No exploration jobs created yet.</p>
            <button 
              className="btn-primary mt-4"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {explorationJobs.map((job: any) => (
              <div key={job._id} className="glass-card gradient-border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{job.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{job.description}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      className={`text-xs px-3 py-1 mr-2 rounded ${job.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                      onClick={() => toggleJobStatus(job)}
                    >
                      {job.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      className="btn-secondary text-xs px-3 py-1 mr-2"
                      onClick={() => triggerExplorationJob({ jobId: job._id })}
                    >
                      Trigger Now
                    </button>
                    <button
                      className="btn-secondary text-xs px-3 py-1 mr-2"
                      onClick={() => handleEditJob(job)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => deleteExplorationJob({ jobId: job._id })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
                  <div>
                    <span className="text-gray-500">Business Context:</span>
                    <span className="text-gray-300 ml-2">
                      {job.businessContextId ? getBusinessContextName(job.businessContextId) : "None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Prompt Collection:</span>
                    <span className="text-gray-300 ml-2">
                      {job.collectionId ? getCollectionName(job.collectionId) : "None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date Range:</span>
                    <span className="text-gray-300 ml-2">
                      {formatDate(job.startDate)} - {formatDate(job.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-300 ml-2">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  <div className="text-xs text-gray-500">Days:</div>
                  {job.scheduleDays.map((day: number) => (
                    <span key={day} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                      {days.find(d => d.id === day)?.name.substring(0, 3)}
                    </span>
                  ))}
                  {job.scheduleDays.length === 0 && <span className="text-xs text-gray-400">None</span>}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  <div className="text-xs text-gray-500">Hours:</div>
                  {job.scheduleHours.map((hour: number) => (
                    <span key={hour} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  ))}
                  {job.scheduleHours.length === 0 && <span className="text-xs text-gray-400">None</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 