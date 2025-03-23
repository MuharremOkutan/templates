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
  
  // State for form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBusinessContext, setSelectedBusinessContext] = useState<Id<"businessContexts"> | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Id<"collections"> | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [scheduleHours, setScheduleHours] = useState<number[]>([]);
  
  // Query data
  const businessContexts = useQuery(api.businessContextFunctions.listBusinessContexts) || [];
  const collections = useQuery(api.promptFunctions.listCollections) || [];
  const explorationJobs = useQuery(api.explorationFunctions.listExplorationJobs) || [];
  
  // Mutations
  const createExplorationJob = useMutation(api.explorationFunctions.createExplorationJob);
  const triggerExplorationJob = useMutation(api.explorationFunctions.triggerExplorationJob);
  const deleteExplorationJob = useMutation(api.explorationFunctions.deleteExplorationJob);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createExplorationJob({
        name,
        description,
        businessContextId: selectedBusinessContext || undefined,
        collectionId: selectedCollection || undefined,
        startDate,
        endDate,
        scheduleDays,
        scheduleHours,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setSelectedBusinessContext(null);
      setSelectedCollection(null);
      setStartDate(new Date());
      setEndDate(new Date());
      setScheduleDays([]);
      setScheduleHours([]);
      
    } catch (error) {
      console.error("Failed to create exploration job:", error);
    }
  };

  // Handle day selection
  const toggleDay = (day: number) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter(d => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  // Handle hour selection
  const toggleHour = (hour: number) => {
    if (scheduleHours.includes(hour)) {
      setScheduleHours(scheduleHours.filter(h => h !== hour));
    } else {
      setScheduleHours([...scheduleHours, hour]);
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

  // Hours of the day
  const hours = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    name: `${i.toString().padStart(2, '0')}:00`,
  }));

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Exploration Job Form */}
        <div className="glass-card p-6 md:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-white">Create New Job</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-primary w-full"
                placeholder="Job name"
                required
              />
            </div>

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

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="input-primary w-full"
                  dateFormat="MM/dd/yyyy"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                  End Date
                </label>
                <DatePicker
                  id="endDate"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="input-primary w-full"
                  dateFormat="MM/dd/yyyy"
                  minDate={startDate || undefined}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule Days
              </label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      scheduleDays.includes(day.id)
                        ? "bg-primary text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {day.name.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule Hours
              </label>
              <div className="grid grid-cols-6 gap-2">
                {hours.map((hour) => (
                  <button
                    key={hour.id}
                    type="button"
                    onClick={() => toggleHour(hour.id)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      scheduleHours.includes(hour.id)
                        ? "bg-primary text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {hour.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary mt-4"
            >
              Create Job
            </button>
          </form>
        </div>

        {/* Exploration Jobs List */}
        <div className="glass-card p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-white">Your Exploration Jobs</h2>
          
          {explorationJobs.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-400">No exploration jobs created yet.</p>
              <p className="text-gray-500 text-sm mt-2">Create your first job using the form on the left.</p>
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
                        className="btn-secondary text-xs px-3 py-1 mr-2"
                        onClick={() => triggerExplorationJob({ jobId: job._id })}
                      >
                        Trigger Now
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
                    {job.scheduleHours.slice(0, 5).map((hour: number) => (
                      <span key={hour} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    ))}
                    {job.scheduleHours.length > 5 && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        +{job.scheduleHours.length - 5} more
                      </span>
                    )}
                    {job.scheduleHours.length === 0 && <span className="text-xs text-gray-400">None</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 