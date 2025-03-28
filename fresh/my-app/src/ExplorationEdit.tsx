import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Button, 
  IconButton,
  Input,
  Textarea,
  GlassCard, 
  GlassCardHeader, 
  GlassCardContent, 
  GlassCardFooter,
  Skeleton
} from './components/ui';

// Icons
const BackIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SaveIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

export default function ExplorationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Fetch data
  const job = useQuery(
    api.explorationFunctions.getExplorationJob,
    isEditMode ? { jobId: id as Id<"explorationJobs"> } : "skip"
  );
  const businessContexts = useQuery(api.businessContextFunctions.listBusinessContexts);
  const collections = useQuery(api.promptFunctions.listCollections);
  
  const isLoading = !collections || (isEditMode && !job);
  
  // Form state
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    businessContextId: '',
    collectionId: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    scheduleDays: [0, 1, 2, 3, 4, 5, 6], // All days by default
    scheduleHours: [9], // 9 AM by default
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Load exploration data when available
  useEffect(() => {
    if (job && isEditMode) {
      const startDate = job.startDate ? new Date(job.startDate) : new Date();
      const endDate = job.endDate ? new Date(job.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      setFormState({
        name: job.name || '',
        description: job.description || '',
        businessContextId: job.businessContextId || '',
        collectionId: job.collectionId || '',
        startDate,
        endDate,
        scheduleDays: job.scheduleDays || [0, 1, 2, 3, 4, 5, 6],
        scheduleHours: job.scheduleHours || [9],
      });
    }
  }, [job, isEditMode]);
  
  // API mutations
  const createExplorationJob = useMutation(api.explorationFunctions.createExplorationJob);
  const updateExplorationJob = useMutation(api.explorationFunctions.updateExplorationJob);
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleDateChange = (field: string, date: Date | null) => {
    if (date) {
      setFormState(prev => ({ ...prev, [field]: date }));
      
      // Clear error when field is edited
      if (formErrors[field]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formState.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formState.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formState.businessContextId) {
      errors.businessContextId = 'Business context is required';
    }
    
    if (!formState.collectionId) {
      errors.collectionId = 'Collection is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isEditMode && id) {
        await updateExplorationJob({
          jobId: id as Id<"explorationJobs">,
          name: formState.name,
          description: formState.description,
          businessContextId: formState.businessContextId as Id<"businessContexts"> || undefined,
          collectionId: formState.collectionId as Id<"collections"> || undefined,
          startDate: formState.startDate.toISOString(),
          endDate: formState.endDate.toISOString(),
          scheduleDays: formState.scheduleDays,
          scheduleHours: formState.scheduleHours
        });
      } else {
        await createExplorationJob({
          name: formState.name,
          description: formState.description,
          businessContextId: formState.businessContextId as Id<"businessContexts"> || undefined,
          collectionId: formState.collectionId as Id<"collections"> || undefined,
          startDate: formState.startDate.toISOString(),
          endDate: formState.endDate.toISOString(),
          scheduleDays: formState.scheduleDays,
          scheduleHours: formState.scheduleHours
        });
      }
      
      navigate('/exploration');
    } catch (err) {
      console.error('Error saving exploration:', err);
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
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
        
        <GlassCard>
          <GlassCardHeader>
            <Skeleton className="h-8 w-3/4" />
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }
  
  if (isEditMode && !job) {
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
                onClick={() => navigate('/exploration')}
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
          onClick={() => navigate('/exploration')}
        >
          Back
        </Button>
        
        <h1 className="text-2xl font-semibold text-white ml-4">
          {isEditMode ? 'Edit Exploration' : 'Create Exploration'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <GlassCard variant="gradient" className="mb-8">
          <GlassCardHeader className="border-b border-slate-700/50">
            <h2 className="text-xl font-medium text-white">
              Exploration Details
            </h2>
          </GlassCardHeader>
          
          <GlassCardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="Enter exploration name"
                  error={formErrors.name}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Collection
                  </label>
                  <select
                    name="collectionId"
                    value={formState.collectionId}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-800/50 border ${
                      formErrors.collectionId 
                        ? 'border-red-500/50 focus:border-red-500' 
                        : 'border-slate-700 focus:border-primary'
                    } rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary`}
                  >
                    <option value="">Select a collection</option>
                    {collections?.map((collection: any) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.collectionId && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.collectionId}</p>
                  )}
                </div>
              </div>
              
              <Textarea
                label="Description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                placeholder="Enter a description for this exploration"
                rows={4}
                error={formErrors.description}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Business Context
                </label>
                <select
                  name="businessContextId"
                  value={formState.businessContextId}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-800/50 border ${
                    formErrors.businessContextId 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-slate-700 focus:border-primary'
                  } rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary`}
                >
                  <option value="">Select a business context</option>
                  {businessContexts?.map((context: any) => (
                    <option key={context._id} value={context._id}>
                      {context.title}
                    </option>
                  ))}
                </select>
                {formErrors.businessContextId && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.businessContextId}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    selected={formState.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    End Date
                  </label>
                  <DatePicker
                    selected={formState.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Schedule Days
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`px-3 py-1.5 rounded-md text-sm border ${
                          formState.scheduleDays.includes(index)
                            ? 'bg-primary/20 border-primary/50 text-primary-foreground'
                            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
                        }`}
                        onClick={() => {
                          const newDays = formState.scheduleDays.includes(index)
                            ? formState.scheduleDays.filter(d => d !== index)
                            : [...formState.scheduleDays, index];
                          setFormState(prev => ({ ...prev, scheduleDays: newDays }));
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Schedule Hours
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        className={`px-3 py-1.5 rounded-md text-sm border ${
                          formState.scheduleHours.includes(hour)
                            ? 'bg-primary/20 border-primary/50 text-primary-foreground'
                            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50'
                        }`}
                        onClick={() => {
                          const newHours = formState.scheduleHours.includes(hour)
                            ? formState.scheduleHours.filter(h => h !== hour)
                            : [...formState.scheduleHours, hour];
                          setFormState(prev => ({ ...prev, scheduleHours: newHours }));
                        }}
                      >
                        {hour}:00
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCardContent>
          
          <GlassCardFooter className="border-t border-slate-700/50 flex justify-end">
            <Button
              variant="secondary"
              className="mr-3"
              onClick={() => navigate('/exploration')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<SaveIcon />}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              {isEditMode ? 'Save Changes' : 'Create Exploration'}
            </Button>
          </GlassCardFooter>
        </GlassCard>
      </form>
    </div>
  );
} 