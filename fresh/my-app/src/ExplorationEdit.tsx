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
  const { data: exploration, isLoading, error } = useQuery(
    api.explorationFunctions.getExploration,
    isEditMode ? { id: id as Id<"explorationJobs"> } : "skip"
  );
  const { data: businessContexts } = useQuery(api.businessContextFunctions.listBusinessContexts);
  
  // Form state
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    status: 'draft',
    businessContextId: '',
    startDate: new Date(),
    estimatedDuration: '',
    additionalInformation: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Load exploration data when available
  useEffect(() => {
    if (exploration) {
      setFormState({
        name: exploration.name || '',
        description: exploration.description || '',
        status: exploration.status || 'draft',
        businessContextId: exploration.businessContextId || '',
        startDate: exploration.startDate ? new Date(exploration.startDate) : new Date(),
        estimatedDuration: exploration.estimatedDuration || '',
        additionalInformation: exploration.additionalInformation || '',
      });
    }
  }, [exploration]);
  
  // API mutations
  const createExploration = useMutation(api.explorationFunctions.createExplorationJob);
  const updateExploration = useMutation(api.explorationFunctions.updateExplorationJob);
  
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
  
  const handleDateChange = (date: Date) => {
    setFormState(prev => ({ ...prev, startDate: date }));
    
    // Clear error when field is edited
    if (formErrors.startDate) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        return newErrors;
      });
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
        await updateExploration({
          jobId: id as Id<"explorationJobs">,
          name: formState.name,
          description: formState.description,
          status: formState.status,
          businessContextId: formState.businessContextId as Id<"businessContexts">,
          startDate: formState.startDate.toISOString(),
          estimatedDuration: formState.estimatedDuration,
          additionalInformation: formState.additionalInformation
        });
      } else {
        await createExploration({
          name: formState.name,
          description: formState.description,
          status: formState.status,
          businessContextId: formState.businessContextId as Id<"businessContexts">,
          startDate: formState.startDate.toISOString(),
          estimatedDuration: formState.estimatedDuration,
          additionalInformation: formState.additionalInformation
        });
      }
      
      navigate('/exploration');
    } catch (err) {
      console.error('Error saving exploration:', err);
      setIsSaving(false);
    }
  };
  
  if (isEditMode && isLoading) {
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
  
  if (isEditMode && (error || !exploration)) {
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
              <div>
                <Input
                  label="Name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  error={formErrors.name}
                  placeholder="Enter exploration name"
                />
              </div>
              
              <div>
                <Textarea
                  label="Description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  error={formErrors.description}
                  placeholder="Enter a detailed description of this exploration"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <option key={context.id} value={context.id}>
                        {context.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.businessContextId && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.businessContextId}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formState.status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    selected={formState.startDate}
                    onChange={handleDateChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
                
                <div>
                  <Input
                    label="Estimated Duration"
                    name="estimatedDuration"
                    value={formState.estimatedDuration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 weeks, 3 days"
                  />
                </div>
              </div>
              
              <div>
                <Textarea
                  label="Additional Information"
                  name="additionalInformation"
                  value={formState.additionalInformation}
                  onChange={handleInputChange}
                  placeholder="Any other relevant details about this exploration"
                  rows={6}
                />
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