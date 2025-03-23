import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import ApiSourcesManager from "./components/ApiSourcesManager";

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showApiManager, setShowApiManager] = useState(false);
  
  // This will be replaced with the actual API call to get news items
  // For now, using mock data
  const newsItems = useQuery(api.news?.listNewsItems) || mockNewsItems;
  
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
          {/* Search Bar */}
          <div className="flex items-center mb-6 glass-card p-3">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full backdrop-blur-sm bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* News List */}
          <div className="space-y-4">
            {filteredNewsItems.length > 0 ? (
              filteredNewsItems.map(item => (
                <NewsItem key={item.id} newsItem={item} />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">No news items found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NewsItem({ newsItem }) {
  return (
    <Link to={`/news/${newsItem.id}`} className="block">
      <div className="glass-card p-6 hover:border-primary transition-colors">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-white">{newsItem.title}</h3>
          <div className="bg-slate-700/50 text-xs text-gray-300 px-2 py-1 rounded">
            {newsItem.industry}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">{newsItem.summary}</p>
          <div className="flex items-center text-xs text-gray-400">
            <span className="mr-2">{newsItem.source}</span>
            <span>•</span>
            <span className="ml-2">{formatDate(newsItem.publishDate)}</span>
          </div>
        </div>
        
        {/* Entities */}
        {newsItem.entities && newsItem.entities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs uppercase text-gray-500 mb-1">Entities</h4>
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
          <div>
            <h4 className="text-xs uppercase text-gray-500 mb-1">Related Business Contexts</h4>
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
    </Link>
  );
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
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