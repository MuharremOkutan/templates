import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

type BusinessContext = {
  _id: Id<"businessContexts">;
  title: string;
  description: string;
  userId: Id<"users">;
  createdAt: number;
  updatedAt: number;
};

// Connection status type
type ConnectionStatus = {
  status: string;
  timestamp: number;
} | undefined;

// DeleteContextMutation type
type DeleteContextMutation = ((args: { id: Id<"businessContexts"> }) => Promise<Id<"businessContexts">>) | undefined;

export default function BusinessContext() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Safely try to fetch connection status
  const connectionStatus = useQuery(api.openai.testConnection);
  
  // Safely try to fetch contexts 
  const contexts = useQuery(api.businessContextFunctions.listBusinessContexts);
  
  const convex = useConvex();
  
  // Safely use mutation
  const deleteBusinessContext = useMutation(api.businessContextFunctions.deleteBusinessContext);

  // Test direct fetch on mount
  useEffect(() => {
    let isMounted = true;
    
    async function checkConnection() {
      try {
        // First try to check ping, which is simpler
        await convex.query(api.openai.ping);
        if (isMounted) {
          setError(null);
        }
      } catch (err) {
        console.error("Connection error:", err);
        if (isMounted) {
          setError(typeof err === 'object' && err !== null ? String(err) : "Error connecting to database. Please try refreshing.");
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }
    
    checkConnection();
    
    return () => {
      isMounted = false;
    };
  }, [convex]);

  // Filter contexts based on search query - now with safety checks
  const filteredContexts = React.useMemo(() => {
    try {
      if (!contexts) return [];
      
      return contexts.filter((context: BusinessContext) => {
        return (
          context.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          context.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    } catch (err) {
      console.error("Error filtering contexts:", err);
      return [];
    }
  }, [contexts, searchQuery]);

  // Generate a pseudo-random color based on a string
  const generateColor = (str: string) => {
    try {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colors = [
        "from-purple-500 to-indigo-500",
        "from-blue-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-amber-500",
        "from-pink-500 to-rose-500",
        "from-indigo-500 to-purple-500"
      ];
      return colors[Math.abs(hash) % colors.length];
    } catch (err) {
      return "from-blue-500 to-cyan-500"; // Default fallback
    }
  };

  // Format date nicely
  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (err) {
      return "Unknown date";
    }
  };

  // Render the loading state
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-t-primary border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading business contexts...</p>
        {connectionStatus === undefined && (
          <p className="text-yellow-400 mt-4">Connecting to database...</p>
        )}
      </div>
    );
  }

  // Render error state if we have an error
  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <svg 
          className="w-16 h-16 mx-auto text-red-500 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h3 className="text-xl font-medium mb-4 text-white">Connection Error</h3>
        <p className="text-gray-400 mb-6">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // If contexts is undefined or null, show an empty state but not a blank page
  if (!contexts) {
    return (
      <div className="glass-card p-8 text-center">
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="text-xl font-medium mb-2 gradient-text">No data available</h3>
        <p className="text-gray-400 mb-6">
          We're having trouble loading your business contexts. You can create a new one or try refreshing.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Refresh Page
          </button>
          <Link to="/business-context/create" className="btn-primary flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Context
          </Link>
        </div>
      </div>
    );
  }

  // Main render - safe fallback UI in case of rendering errors
  try {
    return (
      <div className="space-y-8">
        {/* Connection Debug Info (only in dev) */}
        {process.env.NODE_ENV !== 'production' && connectionStatus && (
          <div className="glass-card p-4 text-xs border border-green-500">
            <div className="flex items-center text-green-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Database connected! Response time: {Date.now() - connectionStatus.timestamp}ms
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="glass-card p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text mb-2">Business Contexts</h2>
              <p className="text-gray-400">
                Define and manage your organization's business contexts to enhance prompt generation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search contexts..."
                  className="w-full backdrop-blur-sm bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Link to="/business-context/create" className="btn-primary whitespace-nowrap flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Context
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="min-h-[300px]">
          {filteredContexts && filteredContexts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContexts.map((context: BusinessContext) => (
                <div 
                  key={context._id} 
                  className="glass-card gradient-border p-0 transition-all duration-200 hover:translate-y-[-2px] overflow-hidden group"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${generateColor(context.title)}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-white truncate flex-1 group-hover:text-primary transition-colors">
                        {context.title}
                      </h3>
                      <div className="flex space-x-2 opacity-70 group-hover:opacity-100">
                        <Link
                          to={`/business-context/edit/${context._id}`}
                          className="p-1.5 rounded hover:bg-slate-700/50 transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-4 h-4 text-gray-400 hover:text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        {deleteBusinessContext && (
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this business context?")) {
                                deleteBusinessContext({ id: context._id });
                              }
                            }}
                            className="p-1.5 rounded hover:bg-slate-700/50 transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4 text-gray-400 hover:text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 mb-4">
                      <p className="text-gray-400 line-clamp-3 text-sm">
                        {context.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                      <span className="text-xs text-gray-500 flex items-center">
                        <svg 
                          className="w-3.5 h-3.5 mr-1 text-gray-500" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        {formatDate(context.updatedAt)}
                      </span>
                      <Link
                        to={`/business-context/view/${context._id}`}
                        className="text-primary hover:text-primary/80 flex items-center text-sm font-medium transition-colors"
                      >
                        View Details
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              {searchQuery ? (
                <div className="max-w-md mx-auto">
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
                  <h3 className="text-xl font-medium mb-2 gradient-text">No matching contexts found</h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search query or create a new business context.
                  </p>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h3 className="text-xl font-medium mb-2 gradient-text">No business contexts yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first business context to get started.
                  </p>
                  <Link to="/business-context/create" className="btn-primary inline-flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create New Context
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (renderError) {
    // Final fallback UI in case of rendering errors
    console.error("Error rendering BusinessContext component:", renderError);
    return (
      <div className="glass-card p-8 text-center">
        <h3 className="text-xl font-medium mb-4 text-white">Error Displaying Page</h3>
        <p className="text-gray-400 mb-6">
          There was an error displaying the business contexts page. Please try refreshing.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh Page
        </button>
      </div>
    );
  }
} 