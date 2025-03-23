import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import ApiSourcesManager from "./components/ApiSourcesManager";

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showApiManager, setShowApiManager] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");
  
  // This will be replaced with the actual API call to get news items
  const newsItems = useQuery(api.news?.listNewsItems) || [];
  
  // Filter news items based on search query
  const filteredNewsItems = searchQuery
    ? newsItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.industry.toLowerCase().includes(searchQuery.toLowerCase()))
    : newsItems;

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-2xl font-bold text-white">News</div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowApiManager(false)} 
            className={`px-4 py-2 rounded-lg ${!showApiManager ? "bg-primary text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700"}`}
          >
            News Feed
          </button>
          <button 
            onClick={() => setShowApiManager(true)} 
            className={`px-4 py-2 rounded-lg ${showApiManager ? "bg-primary text-white" : "bg-slate-800 text-gray-300 hover:bg-slate-700"}`}
          >
            API Sources
          </button>
        </div>
      </div>

      {showApiManager ? (
        <ApiSourcesManager />
      ) : (
        <>
          {/* Search and View Controls */}
          <div className="flex items-center justify-between mb-6 glass-card p-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 backdrop-blur-sm bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center ml-4">
              <button 
                onClick={() => setView("list")} 
                className={`p-2 rounded-l-lg border border-slate-700 ${view === "list" ? "bg-primary/20 text-primary" : "bg-slate-800 text-gray-400 hover:text-white"}`}
                title="List view"
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button 
                onClick={() => setView("grid")} 
                className={`p-2 rounded-r-lg border border-slate-700 border-l-0 ${view === "grid" ? "bg-primary/20 text-primary" : "bg-slate-800 text-gray-400 hover:text-white"}`}
                title="Grid view"
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* News Count */}
          <div className="text-sm text-gray-400 mb-4">
            Found {filteredNewsItems.length} news items
            {searchQuery && <span> matching "<span className="text-white">{searchQuery}</span>"</span>}
          </div>

          {/* News List */}
          {view === "list" ? (
            <div className="space-y-4">
              {filteredNewsItems.length > 0 ? (
                filteredNewsItems.map(item => (
                  <NewsItemCard key={item._id} newsItem={item} />
                ))
              ) : (
                <div className="text-center py-10 glass-card">
                  <p className="text-gray-400">No news items found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-primary hover:text-primary-light text-sm"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNewsItems.length > 0 ? (
                filteredNewsItems.map(item => (
                  <NewsItemCompact key={item._id} newsItem={item} />
                ))
              ) : (
                <div className="col-span-full text-center py-10 glass-card">
                  <p className="text-gray-400">No news items found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-primary hover:text-primary-light text-sm"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NewsItemCard({ newsItem }) {
  // Extract dynamic fields and filter out null/undefined values and long arrays
  const dynamicFields = newsItem.dynamicFields || {};
  const displayableDynamicFields = Object.entries(dynamicFields)
    .filter(([_, value]) => value !== null && value !== undefined)
    .filter(([_, value]) => !Array.isArray(value) || value.length < 10) // Skip long arrays
    .filter(([key, _]) => 
      // Skip fields that are likely to be URLs, IDs, or too technical
      !key.toLowerCase().includes('url') && 
      !key.toLowerCase().includes('id') && 
      !key.toLowerCase().includes('ref') &&
      !key.toLowerCase().includes('uuid') &&
      !key.toLowerCase().includes('image') &&
      !key.toLowerCase().includes('link')
    );

  return (
    <Link to={`/news/${newsItem._id}`} className="block">
      <div className="glass-card p-6 hover:border-primary transition-all hover:translate-y-[-2px] duration-300">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary-light mr-2">
                {newsItem.industry || "General"}
              </span>
              <span className="text-xs text-gray-400">{newsItem.source}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{newsItem.title}</h3>
          </div>
          <div className="ml-4 flex flex-col items-end">
            <div className="text-gray-400 text-xs mb-1">{formatDate(newsItem.publishDate)}</div>
            <div className="text-xs px-2 py-1 rounded bg-slate-700/50 text-gray-300">
              {getTimeAgo(newsItem.publishDate)}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-300 mb-3">{newsItem.summary}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <div className="text-gray-500 mb-1">Source</div>
              <div className="text-white flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                {newsItem.source}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Published</div>
              <div className="text-white">{formatDate(newsItem.publishDate)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Industry</div>
              <div className="text-white">{newsItem.industry || "General"}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Language</div>
              <div className="text-white">{dynamicFields.language || dynamicFields.lang || "English"}</div>
            </div>

            {/* Display dynamic fields */}
            {displayableDynamicFields.slice(0, 6).map(([key, value]) => (
              <div key={key}>
                <div className="text-gray-500 mb-1">{formatFieldName(key)}</div>
                <div className="text-white">{formatFieldValue(value)}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Entities and Tags */}
        <div className="flex flex-wrap gap-y-4 border-t border-slate-700/50 pt-4">
          {/* Entities */}
          {newsItem.entities && newsItem.entities.length > 0 && (
            <div className="w-full md:w-1/2 pr-2">
              <h4 className="text-xs uppercase text-gray-500 mb-2">Entities</h4>
              <div className="flex flex-wrap gap-1">
                {newsItem.entities.map((entity, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-slate-800/70 text-gray-300 px-2 py-1 rounded"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Business Contexts */}
          {newsItem.businessContexts && newsItem.businessContexts.length > 0 && (
            <div className="w-full md:w-1/2 pl-0 md:pl-2">
              <h4 className="text-xs uppercase text-gray-500 mb-2">Business Contexts</h4>
              <div className="flex flex-wrap gap-1">
                {newsItem.businessContexts.map((context, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-primary/20 text-primary-light px-2 py-1 rounded"
                  >
                    {context}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Read More Link */}
        <div className="mt-4 flex justify-end">
          <div className="text-primary hover:text-primary-light text-sm flex items-center transition-colors">
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewsItemCompact({ newsItem }) {
  // Extract dynamic fields for display
  const dynamicFields = newsItem.dynamicFields || {};
  
  // Get most important dynamic fields (prioritize certain fields)
  const priorityFields = ['author', 'sentiment', 'relevance', 'language', 'lang', 'country', 'region'];
  const importantFields = priorityFields
    .filter(field => dynamicFields[field] !== undefined && dynamicFields[field] !== null)
    .slice(0, 2); // Limit to 2 important fields

  return (
    <Link to={`/news/${newsItem._id}`} className="block h-full">
      <div className="glass-card p-4 hover:border-primary transition-all hover:translate-y-[-2px] duration-300 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary-light">
            {newsItem.industry || "General"}
          </span>
          <span className="text-xs text-gray-400">{getTimeAgo(newsItem.publishDate)}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{newsItem.title}</h3>
        
        <p className="text-gray-300 text-sm mb-3 line-clamp-3 flex-grow">{newsItem.summary}</p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center border-t border-slate-700/50 pt-3 text-xs">
            <div className="text-white">{newsItem.source}</div>
            <div className="text-gray-400">{formatDate(newsItem.publishDate)}</div>
          </div>
          
          {/* Show important dynamic fields if available */}
          {importantFields.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {importantFields.map(field => (
                <div key={field} className="text-xs">
                  <span className="text-gray-500">{formatFieldName(field)}: </span>
                  <span className="text-primary-light">{formatFieldValue(dynamicFields[field])}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Tags - show only a few */}
          {((newsItem.entities && newsItem.entities.length > 0) || 
            (newsItem.businessContexts && newsItem.businessContexts.length > 0)) && (
            <div className="mt-3 flex flex-wrap gap-1">
              {newsItem.entities && newsItem.entities.slice(0, 2).map((entity, index) => (
                <span key={`entity-${index}`} className="text-xs bg-slate-800/70 text-gray-300 px-2 py-1 rounded">
                  {entity}
                </span>
              ))}
              {newsItem.businessContexts && newsItem.businessContexts.slice(0, 2).map((context, index) => (
                <span key={`context-${index}`} className="text-xs bg-primary/20 text-primary-light px-2 py-1 rounded">
                  {context}
                </span>
              ))}
              {((newsItem.entities?.length || 0) + (newsItem.businessContexts?.length || 0)) > 4 && (
                <span className="text-xs bg-slate-800/40 text-gray-400 px-2 py-1 rounded">
                  +{((newsItem.entities?.length || 0) + (newsItem.businessContexts?.length || 0)) - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return "Invalid date";
  }
}

// Helper function to get time ago
function getTimeAgo(dateString) {
  if (!dateString) return "Unknown";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec} sec ago`;
    
    // Convert to minutes
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    
    // Convert to hours
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    
    // Convert to days
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    // Convert to months
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    
    // Convert to years
    const diffYear = Math.floor(diffMonth / 12);
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  } catch (e) {
    return "Unknown";
  }
}

// Helper function to format field names
function formatFieldName(key) {
  if (!key) return '';
  
  // Convert camelCase or snake_case to Title Case
  return key
    .replace(/([A-Z])/g, ' $1') // Insert a space before all caps
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^\w/, c => c.toUpperCase()) // Capitalize the first letter
    .trim();
}

// Helper function to format field values
function formatFieldValue(value) {
  if (value === null || value === undefined) return '-';
  
  // Handle different types of values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    // Format numbers with commas for thousands
    return new Intl.NumberFormat().format(value);
  }
  
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return formatDate(value);
    }
    
    // For arrays, join with commas
    if (Array.isArray(value)) {
      if (value.length === 0) return '-';
      return value.slice(0, 3).join(', ') + (value.length > 3 ? `... +${value.length - 3} more` : '');
    }
    
    // For objects, return a summary
    return '{...}';
  }
  
  // For strings, truncate if too long
  if (typeof value === 'string') {
    return value.length > 50 ? value.substring(0, 47) + '...' : value;
  }
  
  return String(value);
}

// Mock data for initial development
const mockNewsItems = [
  {
    id: "1",
    title: "Tech Giant Launches New AI Platform",
    summary: "A leading technology company has announced the release of its new artificial intelligence platform, which promises to revolutionize how businesses interact with customer data.",
    source: "Tech Daily",
    publishDate: "2023-07-15T14:30:00Z",
    industry: "Technology",
    entities: ["AI", "Machine Learning", "Data Analytics"],
    businessContexts: ["Digital Transformation", "AI Strategy"],
    fullContent: "..."
  },
  {
    id: "2",
    title: "Global Supply Chain Disruptions Continue",
    summary: "Ongoing logistics challenges and geopolitical tensions are causing significant disruptions to global supply chains, affecting industries from manufacturing to retail.",
    source: "Business Insider",
    publishDate: "2023-07-14T09:15:00Z",
    industry: "Logistics",
    entities: ["Supply Chain", "Global Trade", "Manufacturing"],
    businessContexts: ["Supply Chain Management", "Risk Assessment"],
    fullContent: "..."
  },
  {
    id: "3",
    title: "New Regulations Impact Financial Services",
    summary: "Recent regulatory changes are requiring financial institutions to adjust their compliance frameworks and reporting procedures.",
    source: "Financial Times",
    publishDate: "2023-07-13T11:45:00Z",
    industry: "Finance",
    entities: ["Regulation", "Compliance", "Banking"],
    businessContexts: ["Regulatory Compliance", "Financial Strategy"],
    fullContent: "..."
  }
]; 