import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const newsId = id as string;
  
  // This will be replaced with the actual API call to get the news item
  // For now, let's just find the item in our mock data
  const newsItem = useQuery(api.news?.getNewsItem, newsId ? { id: newsId } : "skip");

  if (!newsItem) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-t-primary border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading news item...</p>
      </div>
    );
  }

  // Extract dynamic fields and organize them by category
  const dynamicFields = newsItem.dynamicFields || {};
  const fieldCategories = categorizeFields(dynamicFields);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="mb-8 flex items-center">
        <Link 
          to="/news" 
          className="mr-4 p-2 rounded-full hover:bg-slate-800/50 transition-colors group"
          title="Back to news"
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
          News Details
        </h2>
      </div>

      {/* News Content */}
      <div className="glass-card p-8 mb-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-white">{newsItem.title}</h1>
            <div className="bg-slate-700/50 text-sm text-gray-300 px-3 py-1 rounded">
              {newsItem.industry}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-400 mb-6">
            <span className="mr-2">{newsItem.source}</span>
            <span>•</span>
            <span className="ml-2">{formatDate(newsItem.publishDate)}</span>
          </div>
          
          <div className="prose prose-invert max-w-none mb-8">
            <h3 className="text-xl font-medium mb-3">Summary</h3>
            <p>{newsItem.summary}</p>
            
            {newsItem.fullContent && (
              <>
                <h3 className="text-xl font-medium mt-6 mb-3">Full Content</h3>
                <div className="whitespace-pre-wrap bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  {newsItem.fullContent}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Dynamic Fields */}
        {Object.keys(fieldCategories).length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4 text-primary-light">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(fieldCategories).map(([category, fields]) => (
                <div key={category} className="glass-card p-4">
                  <h4 className="text-lg font-medium mb-3 text-white">{category}</h4>
                  <div className="space-y-2">
                    {Object.entries(fields).map(([field, value]) => (
                      <div key={field} className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-gray-400">{formatFieldName(field)}</div>
                        <div className="text-white col-span-2">{formatFieldValue(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Entities and Business Contexts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Entities */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-medium mb-3 text-primary-light">Identified Entities</h3>
            {newsItem.entities && newsItem.entities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {newsItem.entities.map((entity, index) => (
                  <span 
                    key={index}
                    className="bg-slate-800/70 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No entities identified</p>
            )}
          </div>
          
          {/* Business Contexts */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-medium mb-3 text-primary-light">Related Business Contexts</h3>
            {newsItem.businessContexts && newsItem.businessContexts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {newsItem.businessContexts.map((context, index) => (
                  <span 
                    key={index}
                    className="bg-primary/20 text-primary-light px-3 py-1 rounded-full text-sm"
                  >
                    {context}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No related business contexts</p>
            )}
          </div>
        </div>
        
        {/* Raw API Response */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3 text-primary-light">Raw API Response</h3>
          <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 overflow-x-auto">
            <pre className="text-xs text-gray-300">
              {newsItem.apiResponse}
            </pre>
          </div>
        </div>
      </div>
    </div>
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return "Invalid date";
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
      return value.join(', ');
    }
    
    // For objects, return a summary
    return JSON.stringify(value, null, 2);
  }
  
  // For strings, return as is (no truncation in detail view)
  return String(value);
}

// Helper function to categorize fields
function categorizeFields(fields) {
  const categories = {
    'Source Information': {},
    'Content Details': {},
    'Metadata': {},
    'Analytics': {},
    'Other': {}
  };
  
  // Source-related fields
  const sourceFields = ['author', 'authorName', 'publisher', 'publication', 'source', 'sourceName', 'sourceUrl'];
  
  // Content-related fields
  const contentFields = ['language', 'lang', 'country', 'region', 'category', 'type', 'format'];
  
  // Metadata fields
  const metadataFields = ['publishedAt', 'createdAt', 'updatedAt', 'timestamp', 'date', 'expiresAt'];
  
  // Analytics fields
  const analyticsFields = ['sentiment', 'relevance', 'score', 'rating', 'popularity', 'views', 'shares'];
  
  for (const [key, value] of Object.entries(fields)) {
    // Skip null/undefined values
    if (value === null || value === undefined) continue;
    
    // Skip fields with long arrays or objects
    if (Array.isArray(value) && value.length > 20) continue;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 10) continue;
    
    // Skip URL fields to avoid cluttering the UI
    if (key.toLowerCase().includes('url') || 
        key.toLowerCase().includes('link') || 
        key.toLowerCase().includes('href')) continue;
    
    // Categorize the field
    if (sourceFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      categories['Source Information'][key] = value;
    } else if (contentFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      categories['Content Details'][key] = value;
    } else if (metadataFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      categories['Metadata'][key] = value;
    } else if (analyticsFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      categories['Analytics'][key] = value;
    } else {
      categories['Other'][key] = value;
    }
  }
  
  // Remove empty categories
  for (const category in categories) {
    if (Object.keys(categories[category]).length === 0) {
      delete categories[category];
    }
  }
  
  return categories;
}

// Using the same mock data as in News.tsx for development
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
    fullContent: "A leading technology company headquartered in Silicon Valley has announced the release of its new artificial intelligence platform today, which promises to revolutionize how businesses interact with and derive insights from customer data.\n\nThe platform, which has been in development for over two years, combines natural language processing, computer vision, and predictive analytics to help businesses better understand customer behavior and preferences.\n\n\"This represents a significant advancement in how companies can leverage their data,\" said the company's CEO. \"Our platform allows businesses of any size to implement enterprise-grade AI solutions without requiring specialized technical expertise.\"\n\nAnalysts predict that the new platform could disrupt the current market for business intelligence tools, with early adopters reporting a 35% increase in customer engagement and a 28% improvement in conversion rates during beta testing.\n\nThe product will be available through a subscription model starting next month, with pricing tiers designed to accommodate businesses from startups to large enterprises."
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
    fullContent: "Ongoing logistics challenges and geopolitical tensions are continuing to cause significant disruptions to global supply chains, with industries from manufacturing to retail reporting delays and increased costs.\n\nPort congestion in major shipping hubs, container shortages, and labor constraints are among the factors contributing to what experts are calling \"a perfect storm\" for international trade operations. The situation has been further complicated by recent geopolitical developments that have restricted access to certain shipping routes.\n\n\"Companies are facing unprecedented challenges in sourcing materials and delivering finished products,\" stated a report published yesterday by the Global Supply Chain Institute. \"Lead times have increased by an average of 43% compared to pre-pandemic levels.\"\n\nRetailers are particularly concerned about the impact these disruptions might have on the upcoming holiday shopping season, with many accelerating orders and seeking alternative suppliers to mitigate risks.\n\nExperts recommend that businesses implement more robust risk management strategies, diversify their supplier base, and consider reshoring or nearshoring options where feasible to build more resilient supply chains."
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
    fullContent: "Recent regulatory changes announced by multiple international financial authorities are requiring financial institutions to make significant adjustments to their compliance frameworks and reporting procedures.\n\nThe updated regulations, which focus primarily on enhanced transparency, data privacy, and anti-money laundering measures, will come into effect in phases over the next 18 months. Financial institutions are expected to implement more rigorous customer due diligence, improve their transaction monitoring systems, and enhance their data management capabilities.\n\n\"These changes represent the most comprehensive overhaul of financial regulations in the past decade,\" noted a compliance officer at a leading global bank. \"Meeting these requirements will require substantial investments in both technology and specialized personnel.\"\n\nIndustry analysts estimate that mid to large-sized financial institutions may need to allocate an additional 15-20% to their compliance budgets to adequately address the new requirements. Smaller institutions may face even greater challenges due to limited resources.\n\nDespite the implementation costs, proponents argue that the enhanced regulations will strengthen the global financial system, reduce illegal activities, and ultimately benefit consumers through improved protections and greater transparency."
  }
]; 