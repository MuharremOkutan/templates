import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function ApiSourcesManager() {
  const apiSources = useQuery(api.news.listApiSources) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [loadingSourceId, setLoadingSourceId] = useState(null);
  const [triggerResult, setTriggerResult] = useState(null);
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    url: "",
    apiKey: "",
    headers: "",
    active: true,
    refreshWeekdays: [1, 2, 3, 4, 5], // Default to weekdays
    refreshHour: 9, // Default to 9 AM
    refreshMinute: 0, // Default to on the hour
  });

  // Mutations
  const createApiSource = useMutation(api.news.createApiSource);
  const updateApiSource = useMutation(api.news.updateApiSource);
  const deleteApiSource = useMutation(api.news.deleteApiSource);
  const triggerApiSource = useAction(api.fetchNews.triggerNewsApiAndProcess);

  // Reset form for new source
  const openNewSourceModal = () => {
    setForm({
      name: "",
      url: "",
      apiKey: "",
      headers: "",
      active: true,
      refreshWeekdays: [1, 2, 3, 4, 5],
      refreshHour: 9,
      refreshMinute: 0,
    });
    setIsEditing(false);
    setEditingSource(null);
    setIsModalOpen(true);
  };

  // Edit existing source
  const openEditSourceModal = (source) => {
    setForm({
      name: source.name,
      url: source.url,
      apiKey: source.apiKey || "",
      headers: source.headers ? JSON.stringify(source.headers) : "",
      active: source.active,
      refreshWeekdays: source.refreshWeekdays,
      refreshHour: source.refreshHour,
      refreshMinute: source.refreshMinute,
    });
    setIsEditing(true);
    setEditingSource(source);
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle weekday selection changes
  const handleWeekdayChange = (dayValue) => {
    if (form.refreshWeekdays.includes(dayValue)) {
      setForm({
        ...form,
        refreshWeekdays: form.refreshWeekdays.filter((day) => day !== dayValue),
      });
    } else {
      setForm({
        ...form,
        refreshWeekdays: [...form.refreshWeekdays, dayValue].sort(),
      });
    }
  };

  // Save source (create or update)
  const handleSaveSource = async (e) => {
    e.preventDefault();
    
    try {
      // Parse headers if provided
      let parsedHeaders = undefined;
      if (form.headers.trim()) {
        try {
          parsedHeaders = JSON.parse(form.headers);
        } catch (error) {
          alert("Error parsing headers JSON: " + error.message);
          return;
        }
      }
      
      const sourceData = {
        name: form.name,
        url: form.url,
        apiKey: form.apiKey || undefined,
        headers: parsedHeaders,
        active: form.active,
        refreshWeekdays: form.refreshWeekdays,
        refreshHour: parseInt(form.refreshHour),
        refreshMinute: parseInt(form.refreshMinute),
      };
      
      if (isEditing && editingSource) {
        await updateApiSource({
          id: editingSource._id,
          ...sourceData,
        });
      } else {
        await createApiSource(sourceData);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving API source: " + error.message);
    }
  };

  // Delete source
  const handleDeleteSource = async (sourceId) => {
    if (window.confirm("Are you sure you want to delete this API source?")) {
      try {
        await deleteApiSource({ id: sourceId });
      } catch (error) {
        alert("Error deleting API source: " + error.message);
      }
    }
  };

  // Trigger API fetch - improved error handling
  const handleTriggerApi = async (sourceId) => {
    try {
      setLoadingSourceId(sourceId);
      setTriggerResult(null);
      
      // Call our reliable action
      const result = await triggerApiSource({ apiSourceId: sourceId });
      
      // Even if we get a result, check if there are errors
      if (!result.success || (result.errors && result.errors.length > 0)) {
        // API request failed or had errors
        const errorMessage = result.errors && result.errors.length > 0
          ? result.errors[0].message
          : "Failed to fetch news from API";
        
        setTriggerResult({
          sourceId,
          success: false,
          message: `Error: ${errorMessage}`,
        });
      } else {
        // Show success notification
        setTriggerResult({
          sourceId,
          success: true,
          message: `Successfully imported ${result.itemsImported} news items`,
        });
      }
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setTriggerResult(prev => prev?.sourceId === sourceId ? null : prev);
      }, 5000);
    } catch (error) {
      console.error("API fetch error:", error);
      
      // Extract the actual error message from the error object
      let errorMessage = "Failed to fetch from API";
      if (error instanceof Error) {
        // Try to extract the inner error message if available
        const match = error.message.match(/Failed to fetch from API: (.*)/);
        errorMessage = match ? match[1] : error.message;
      }
      
      setTriggerResult({
        sourceId,
        success: false,
        message: `Error: ${errorMessage}`,
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setTriggerResult(prev => prev?.sourceId === sourceId ? null : prev);
      }, 5000);
    } finally {
      setLoadingSourceId(null);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">News API Sources</h2>
        <button
          onClick={openNewSourceModal}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
        >
          Add API Source
        </button>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {apiSources.length === 0 ? (
          <div className="text-center py-8 glass-card">
            <p className="text-gray-400">No API sources configured</p>
            <button
              onClick={openNewSourceModal}
              className="mt-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
            >
              Add Your First API Source
            </button>
          </div>
        ) : (
          apiSources.map((source) => (
            <div key={source._id} className="glass-card p-6">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">{source.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        source.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {source.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{source.url}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerApi(source._id)}
                    disabled={loadingSourceId === source._id}
                    className={`${
                      loadingSourceId === source._id
                        ? "bg-primary/50 cursor-not-allowed"
                        : "bg-primary hover:bg-primary-dark"
                    } text-white px-3 py-1 rounded flex items-center gap-1`}
                  >
                    {loadingSourceId === source._id ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                        Fetching...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Trigger Now
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEditSourceModal(source)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSource(source._id)}
                    className="bg-red-800/50 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Display trigger result notification */}
              {triggerResult && triggerResult.sourceId === source._id && (
                <div 
                  className={`mt-2 p-2 rounded-md text-sm ${
                    triggerResult.success 
                      ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                      : "bg-red-500/20 border border-red-500/50 text-red-400"
                  }`}
                >
                  {triggerResult.message}
                </div>
              )}

              <div className="mt-4 border-t border-slate-700 pt-4">
                <h4 className="text-sm text-gray-400 mb-2">Refresh Schedule</h4>
                <div className="text-sm text-gray-300">
                  <p>
                    Days:{" "}
                    {source.refreshWeekdays
                      .map((day) => DAYS_OF_WEEK.find((d) => d.value === day)?.label)
                      .join(", ")}
                  </p>
                  <p>
                    Time: {source.refreshHour.toString().padStart(2, "0")}:
                    {source.refreshMinute.toString().padStart(2, "0")}
                  </p>
                  {source.lastRefreshed && (
                    <p className="mt-1 text-xs text-gray-400">
                      Last refreshed: {new Date(source.lastRefreshed).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">
              {isEditing ? "Edit API Source" : "Add New API Source"}
            </h2>
            
            <form onSubmit={handleSaveSource} className="space-y-6">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="My News API"
                  />
                </div>
                
                {/* URL */}
                <div>
                  <label className="block text-gray-400 mb-1">API URL</label>
                  <input
                    type="url"
                    name="url"
                    value={form.url}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="https://api.example.com/news"
                  />
                </div>
                
                {/* API Key */}
                <div>
                  <label className="block text-gray-400 mb-1">API Key (optional)</label>
                  <input
                    type="text"
                    name="apiKey"
                    value={form.apiKey}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="your-api-key"
                  />
                </div>
                
                {/* Headers */}
                <div>
                  <label className="block text-gray-400 mb-1">
                    Headers - JSON format (optional)
                  </label>
                  <textarea
                    name="headers"
                    value={form.headers}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder='{"X-Custom-Header": "value"}'
                  />
                </div>
                
                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="active" className="text-gray-400">
                    Active
                  </label>
                </div>
                
                {/* Refresh Schedule */}
                <fieldset className="border border-slate-700 rounded-lg p-4">
                  <legend className="text-gray-400 px-2">Refresh Schedule</legend>
                  
                  {/* Weekdays */}
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Days of Week</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleWeekdayChange(day.value)}
                          className={`rounded-full px-3 py-1 text-sm ${
                            form.refreshWeekdays.includes(day.value)
                              ? "bg-primary text-white"
                              : "bg-slate-800 text-gray-400"
                          }`}
                        >
                          {day.label.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-1">Hour (0-23)</label>
                      <input
                        type="number"
                        name="refreshHour"
                        value={form.refreshHour}
                        onChange={handleChange}
                        min="0"
                        max="23"
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Minute (0-59)</label>
                      <input
                        type="number"
                        name="refreshMinute"
                        value={form.refreshMinute}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
                >
                  {isEditing ? "Save Changes" : "Add Source"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiSourcesManager; 