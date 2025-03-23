import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export default function ViewBusinessContext() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contextId = id as Id<"businessContexts">;
  
  const context = useQuery(api.businessContextFunctions.getBusinessContext, {
    id: contextId,
  });
  
  const deleteBusinessContext = useMutation(api.businessContextFunctions.deleteBusinessContext);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this business context?")) {
      await deleteBusinessContext({ id: contextId });
      navigate("/business-context");
    }
  };

  // Format date for better readability
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!context) {
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
          Business Context Details
        </h2>
      </div>

      {/* Content */}
      <div className="glass-card overflow-hidden">
        {/* Context Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-semibold text-white mb-2">
              {context.title}
            </h1>
            <div className="flex space-x-2">
              <Link
                to={`/business-context/edit/${context._id}`}
                className="btn-secondary btn-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
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
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
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
                Delete
              </button>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-4 text-sm text-gray-400">
            <div className="flex items-center">
              <svg 
                className="w-4 h-4 mr-1 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              Created: {formatDate(context.createdAt)}
            </div>
            <div className="flex items-center">
              <svg 
                className="w-4 h-4 mr-1 text-gray-500" 
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
              Updated: {formatDate(context.updatedAt)}
            </div>
          </div>
        </div>
        
        {/* Context Description */}
        <div className="p-6 bg-slate-900/30">
          <h3 className="text-md font-medium text-gray-300 mb-3">Description</h3>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 whitespace-pre-wrap text-gray-200">
            {context.description}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <Link to="/business-context" className="btn-secondary flex items-center">
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
              d="M11 17l-5-5m0 0l5-5m-5 5h12" 
            />
          </svg>
          Back to List
        </Link>

        <div className="flex space-x-4">
          <Link
            to={`/business-context/edit/${context._id}`}
            className="btn-primary flex items-center"
          >
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Business Context
          </Link>
        </div>
      </div>
    </div>
  );
} 