import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ApiSourcesManager } from './components/ApiSourcesManager';
import { Link } from "react-router-dom";

interface NewsItem {
  _id: Id<"news">;
  title: string;
  summary: string;
  source: string;
  publishDate: string;
  industry?: string;
  entities?: string[];
  businessContexts?: string[];
  fullContent?: string;
  apiResponse?: string;
  createdAt: number;
  
  // Additional fields from API
  article_id?: string;
  link?: string;
  keywords?: string[];
  creator?: string[];
  video_url?: string;
  image_url?: string;
  pubDateTZ?: string;
  source_id?: string;
  source_priority?: number;
  source_name?: string;
  source_url?: string;
  source_icon?: string;
  language?: string;
  country?: string[];
  category?: string[];
  ai_tag?: string;
  sentiment?: string;
  sentiment_stats?: string;
  ai_region?: string;
  ai_org?: string;
  duplicate?: boolean;
}

export default function News() {
  const news = useQuery(api.news.getNews) || [];
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [activeItem, setActiveItem] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<string>("list");
  
  // State to track if we're showing the search filters panel
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Get unique categories and sources for filters
  const categories = news ? Array.from(new Set(
    news.flatMap(item => item.category || [])
  )).sort() : [];
  
  const sources = news ? Array.from(new Set(
    news.map(item => item.source)
  )).sort() : [];

  // Handle loading state
  if (news === undefined) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center py-10">
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent"></div>
        </div>
        <p className="text-gray-400 mt-4">Loading news feed...</p>
      </div>
    );
  }

  // Format the human-readable date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    
    return Math.floor(seconds) + " sec ago";
  };
  
  // Filter news items based on search and category filters
  const filteredNews = news.filter(item => {
    // If no search term or category, include everything
    if (!searchTerm && !filterCategory) return true;
    
    // First filter by category if selected
    if (filterCategory && (!item.category || !item.category.includes(filterCategory))) {
      return false;
    }
    
    // If no search term, we're done
    if (!searchTerm) return true;
    
    // Otherwise, search in multiple fields
    const search = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(search)) ||
      (item.summary && item.summary.toLowerCase().includes(search)) ||
      (item.source && item.source.toLowerCase().includes(search)) ||
      (item.industry && item.industry.toLowerCase().includes(search)) ||
      (item.entities && item.entities.some(entity => entity.toLowerCase().includes(search))) ||
      (item.creator && item.creator.some(creator => creator.toLowerCase().includes(search))) ||
      (item.country && item.country.some(country => country.toLowerCase().includes(search))) ||
      (item.category && item.category.some(category => category.toLowerCase().includes(search)))
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 relative">
      <section className="py-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">News Feed</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="glass-card inline-flex p-1 rounded-lg">
            <button
              className={`py-2 px-4 rounded-md transition-all duration-300 ${
                activeTab === "feed"
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:text-white hover:bg-slate-800/50"
              }`}
              onClick={() => setActiveTab("feed")}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                News Feed
              </span>
            </button>
            <button
              className={`py-2 px-4 rounded-md transition-all duration-300 ${
                activeTab === "sources"
                  ? "bg-primary text-white" 
                  : "text-gray-300 hover:text-white hover:bg-slate-800/50"
              }`}
              onClick={() => setActiveTab("sources")}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                API Sources
              </span>
            </button>
          </div>
        </div>
        
        {activeTab === "feed" && (
          <div>
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search news..."
                  className="input-primary pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </span>
                <button 
                  className="absolute right-3 top-2 text-gray-400 hover:text-white"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </button>
              </div>
              
              {/* Additional Filters */}
              {showFilters && (
                <div className="glass-card p-3 mb-3 animate-fadeIn">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs text-gray-400 mb-1">Filter by Category</label>
                      <select 
                        className="input-primary w-full py-1.5 text-sm"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button 
                        className="btn-secondary py-1.5 px-3 text-sm"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterCategory("");
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-400">Found {filteredNews.length} news items</p>
              <div className="flex">
                <button 
                  className={`p-2 rounded-l-md ${viewMode === "list" ? "bg-primary text-white" : "bg-slate-800/50 text-gray-300"} border-r border-slate-700`}
                  onClick={() => setViewMode("list")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button 
                  className={`p-2 rounded-r-md ${viewMode === "grid" ? "bg-primary text-white" : "bg-slate-800/50 text-gray-300"}`}
                  onClick={() => setViewMode("grid")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {filteredNews.length > 0 ? (
              <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}`}>
                {filteredNews.map(item => (
                  <div 
                    key={item._id} 
                    className="glass-card p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/10"
                    onClick={() => setActiveItem(item)}
                  >
                    <div className={`${viewMode === "grid" ? "flex flex-col" : "flex flex-col md:flex-row"} gap-4`}>
                      {/* Left side: image if available */}
                      {item.image_url && (
                        <div className={`${viewMode === "grid" ? "w-full" : "md:w-1/4"} shrink-0`}>
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-36 object-cover rounded-md"
                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                          />
                        </div>
                      )}
                      
                      {/* Middle: Main content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="pill-badge">{item.source}</span>
                          {item.industry && (
                            <span className="pill-badge">{item.industry}</span>
                          )}
                          {item.language && (
                            <span className="pill-badge-sm bg-slate-700">{item.language.toUpperCase()}</span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
                        <p className={`text-gray-300 text-sm mb-3 ${viewMode === "grid" ? "line-clamp-3" : "line-clamp-2"}`}>{item.summary}</p>
                        
                        {/* Additional metadata */}
                        <div className={`flex ${viewMode === "grid" ? "flex-col gap-y-2" : "flex-wrap gap-x-4 gap-y-2"} text-xs text-gray-400 mt-2 mb-3`}>
                          {/* Publication date */}
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(item.publishDate)}
                          </div>
                          
                          {/* Creator/Author */}
                          {item.creator && item.creator.length > 0 && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {item.creator[0]}
                            </div>
                          )}
                          
                          {/* Countries */}
                          {item.country && item.country.length > 0 && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item.country.join(', ')}
                            </div>
                          )}
                          
                          {/* Article link */}
                          {item.link && (
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-light flex items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Source
                            </a>
                          )}
                        </div>
                        
                        {/* Entity tags */}
                        <div className={`flex flex-wrap gap-2 mt-2 ${viewMode === "grid" ? "max-h-14 overflow-hidden" : ""}`}>
                          {item.entities && item.entities.slice(0, viewMode === "grid" ? 3 : 4).map((entity, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-slate-800/50 rounded-full text-primary-light">
                              {entity}
                            </span>
                          ))}
                          {item.entities && item.entities.length > (viewMode === "grid" ? 3 : 4) && (
                            <span className="text-xs px-2 py-1 bg-slate-800/50 rounded-full text-gray-400">
                              +{item.entities.length - (viewMode === "grid" ? 3 : 4)} more
                            </span>
                          )}
                        </div>
                        
                        {/* Categories */}
                        {item.category && item.category.length > 0 && (
                          <div className={`flex flex-wrap gap-2 mt-2 ${viewMode === "grid" ? "max-h-10 overflow-hidden" : ""}`}>
                            {item.category.slice(0, viewMode === "grid" ? 2 : item.category.length).map((cat, index) => (
                              <span key={index} className="text-xs px-2 py-0.5 bg-slate-700/50 rounded-md text-gray-300">
                                {cat}
                              </span>
                            ))}
                            {viewMode === "grid" && item.category.length > 2 && (
                              <span className="text-xs px-2 py-0.5 bg-slate-700/50 rounded-md text-gray-300">
                                +{item.category.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Right side: Time and actions */}
                      <div className="shrink-0 flex flex-col items-end justify-between">
                        <span className="text-xs text-gray-400">{timeAgo(item.publishDate)}</span>
                        
                        {/* Sentiment indicator if available */}
                        {item.sentiment && (
                          <div className="flex items-center mt-2 bg-slate-800/60 rounded-full px-2 py-1">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                              item.sentiment.includes("positive") ? "bg-green-500" : 
                              item.sentiment.includes("negative") ? "bg-red-500" : 
                              "bg-yellow-500"
                            }`}></span>
                            <span className="text-xs capitalize">
                              {item.sentiment.includes("positive") ? "Positive" : 
                               item.sentiment.includes("negative") ? "Negative" : 
                               "Neutral"}
                            </span>
                          </div>
                        )}
                        
                        {/* View details button */}
                        <div className="mt-auto pt-2">
                          <Link
                            to={`/news/${item._id}`}
                            className="text-xs text-primary hover:text-primary-light flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-300 mb-4">No news items found. Try triggering a news API from the API Sources tab.</p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab("sources")}
                >
                  Go to API Sources
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "sources" && (
          <ApiSourcesManager />
        )}
      </section>
      
      {/* News Item Modal */}
      {activeItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass-card p-6 w-full max-w-4xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="pill-badge">{activeItem.source}</span>
                  {activeItem.industry && (
                    <span className="pill-badge">{activeItem.industry}</span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(activeItem.publishDate)}</span>
                </div>
                <h2 className="text-xl font-medium gradient-text mb-2">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-white">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Main Content Section */}
              <div className="space-y-4">
                {activeItem.image_url && (
                  <div className="mb-4">
                    <img 
                      src={activeItem.image_url} 
                      alt={activeItem.title} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <p className="text-gray-300">{activeItem.summary}</p>
                
                {activeItem.link && (
                  <div className="mt-2">
                    <a 
                      href={activeItem.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-light flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Read full article
                    </a>
                  </div>
                )}
                
                {activeItem.fullContent && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-white mb-2">Full Content</h3>
                    <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-md whitespace-pre-wrap text-gray-300 text-sm max-h-80 overflow-y-auto">
                      {activeItem.fullContent}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tags and Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                {/* Source Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white">Source Information</h3>
                  
                  <div className="flex flex-col gap-2">
                    {activeItem.source_name && (
                      <div className="flex items-center">
                        {activeItem.source_icon && (
                          <img src={activeItem.source_icon} alt={activeItem.source_name} className="h-4 w-4 mr-2" />
                        )}
                        <span className="text-sm text-gray-300">
                          {activeItem.source_name}
                          {activeItem.source_url && (
                            <a 
                              href={activeItem.source_url}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="ml-2 text-primary hover:text-primary-light"
                            >
                              (Visit)
                            </a>
                          )}
                        </span>
                      </div>
                    )}
                    
                    {activeItem.publishDate && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-300">
                          Published: {formatDate(activeItem.publishDate)}
                          {activeItem.pubDateTZ && ` (${activeItem.pubDateTZ})`}
                        </span>
                      </div>
                    )}
                    
                    {activeItem.language && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span className="text-sm text-gray-300">Language: {activeItem.language}</span>
                      </div>
                    )}
                    
                    {activeItem.country && activeItem.country.length > 0 && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-300">
                          Country: {activeItem.country.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {activeItem.article_id && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="text-sm text-gray-300 truncate">ID: {activeItem.article_id}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tags and Categories */}
                <div className="space-y-4">
                  {activeItem.keywords && activeItem.keywords.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeItem.keywords.map((keyword, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-slate-800/50 rounded-full text-gray-300">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeItem.category && activeItem.category.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeItem.category.map((cat, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-primary/20 border border-primary/40 rounded-full text-primary-light">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeItem.entities && activeItem.entities.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Entities</h3>
                      <div className="flex flex-wrap gap-2">
                        {activeItem.entities.map((entity, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-slate-800/50 rounded-full text-primary-light">
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI Analysis */}
              {(activeItem.ai_tag || activeItem.sentiment || activeItem.ai_region || activeItem.ai_org) && (
                <div className="pt-4 border-t border-gray-700/50">
                  <h3 className="text-sm font-medium text-white mb-3">AI Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeItem.ai_tag && (
                      <div className="glass-card p-3">
                        <h4 className="text-xs text-gray-400 mb-1">AI Tag</h4>
                        <p className="text-sm text-white">{activeItem.ai_tag}</p>
                      </div>
                    )}
                    
                    {activeItem.sentiment && (
                      <div className="glass-card p-3">
                        <h4 className="text-xs text-gray-400 mb-1">Sentiment</h4>
                        <p className="text-sm text-white">{activeItem.sentiment}</p>
                      </div>
                    )}
                    
                    {activeItem.ai_region && (
                      <div className="glass-card p-3">
                        <h4 className="text-xs text-gray-400 mb-1">AI Region</h4>
                        <p className="text-sm text-white">{activeItem.ai_region}</p>
                      </div>
                    )}
                    
                    {activeItem.ai_org && (
                      <div className="glass-card p-3">
                        <h4 className="text-xs text-gray-400 mb-1">AI Organization</h4>
                        <p className="text-sm text-white">{activeItem.ai_org}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional Raw Data */}
              <div className="pt-4 border-t border-gray-700/50">
                <details className="text-sm">
                  <summary className="text-primary cursor-pointer hover:text-primary-light">View Raw API Response</summary>
                  <div className="mt-2 p-4 bg-slate-800/40 border border-slate-700/50 rounded-md overflow-x-auto">
                    <pre className="text-xs text-gray-400">{activeItem.apiResponse}</pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 