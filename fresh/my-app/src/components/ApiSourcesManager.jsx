import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
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

export default function ApiSourcesManager() {
  const apiSources = useQuery(api.news.listApiSources) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  
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