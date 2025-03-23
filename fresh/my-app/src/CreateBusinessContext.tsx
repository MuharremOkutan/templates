import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export default function CreateBusinessContext() {
  const { id } = useParams<{ id: string }>();
  const contextId = id ? (id as Id<"businessContexts">) : undefined;
  const isEditing = !!contextId;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvementError, setImprovementError] = useState<string | null>(null);

  // Load existing context data if editing
  const context = useQuery(
    api.businessContextFunctions.getBusinessContext,
    contextId ? { id: contextId } : "skip"
  );

  // Mutations
  const createBusinessContext = useMutation(api.businessContextFunctions.createBusinessContext);
  const updateBusinessContext = useMutation(api.businessContextFunctions.updateBusinessContext);
  const improveBusinessContext = useAction(api.openai.improveBusinessContext);

  // Load stored API key
  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Set form data if editing
  useEffect(() => {
    if (isEditing && context) {
      setTitle(context.title);
      setDescription(context.description);
    }
  }, [isEditing, context]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && contextId) {
        await updateBusinessContext({
          id: contextId,
          title,
          description,
        });
      } else {
        await createBusinessContext({
          title,
          description,
        });
      }
      navigate("/business-context");
    } catch (error) {
      console.error("Error saving business context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!apiKey) {
      return;
    }

    setIsImproving(true);
    setImprovementError(null);

    try {
      // Store API key
      localStorage.setItem("openai_api_key", apiKey);

      const result = await improveBusinessContext({
        description,
        apiKey,
      });

      if (result.success) {
        setDescription(result.content);
      } else {
        setImprovementError(result.error);
      }
    } catch (error) {
      console.error("Error improving context:", error);
      setImprovementError("An unexpected error occurred. Please try again.");
    } finally {
      setIsImproving(false);
    }
  };

  // If editing and data is still loading
  if (isEditing && context === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-t-primary border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading business context...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center">
        <Link 
          to="/business-context" 
          className="mr-4 p-2 rounded-full hover:bg-slate-800/50 transition-colors group"
          title="Back to business contexts"
        >
          <svg 
            className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-2xl font-bold gradient-text">
          {isEditing ? "Edit Business Context" : "Create Business Context"}
        </h2>
      </div>

      {/* Form */}
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Title
              <input
                type="text"
                className="mt-1 backdrop-blur-sm bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for this context"
                required
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center text-xs text-gray-500 hover:text-gray-300"
                  onClick={() => document.getElementById('aiKeyInput')?.focus()}
                >
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Improvement
                </button>
              </div>
            </div>
            <textarea
              className="backdrop-blur-sm bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 w-full h-64 resize-none focus:outline-none focus:ring-2 focus:ring-primary text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a detailed description of the business context"
              required
            />
          </div>

          {/* AI Improvement Section */}
          <div className="pt-4 border-t border-gray-800">
            <details className="group">
              <summary className="cursor-pointer list-none flex items-center font-medium text-gray-300 text-sm mb-3">
                <svg 
                  className="w-5 h-5 mr-2 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-Powered Improvement
                <svg 
                  className="ml-2 w-4 h-4 transition-transform group-open:rotate-180" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              
              <div className="pt-1 pb-3">
                <p className="text-sm text-gray-400 mb-4">
                  Use OpenAI to enhance your business context description. We'll help make it more comprehensive and professional.
                </p>
                
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <div className="relative flex-grow">
                    <input
                      id="aiKeyInput"
                      type={apiKeyVisible ? "text" : "password"}
                      className="backdrop-blur-sm bg-slate-800/50 border border-slate-700 rounded-lg pl-4 pr-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-white"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your OpenAI API Key"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    >
                      {apiKeyVisible ? (
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`btn-secondary flex items-center justify-center ${!apiKey || isImproving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleImprove}
                    disabled={!apiKey || isImproving}
                  >
                    {isImproving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Improving...
                      </>
                    ) : (
                      <>
                        <svg 
                          className="w-4 h-4 mr-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Make it better
                      </>
                    )}
                  </button>
                </div>
                
                {improvementError && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm">
                    <div className="flex items-start">
                      <svg 
                        className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{improvementError}</span>
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link to="/business-context" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </div>
              ) : (
                isEditing ? "Update Context" : "Create Context"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 