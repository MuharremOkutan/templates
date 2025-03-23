import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { safeStringify } from "./utils/newsHelpers";

// Diagnostic function to debug API responses
export const debugApiResponse = action({
  args: { 
    apiSourceId: v.id("newsApiSources")
  },
  handler: async (ctx, args): Promise<{ 
    success: boolean; 
    rawResponse?: string;
    detectedFormat?: string;
    itemsCount?: number;
    sampleItem?: any;
    extractedItems?: string;
    error?: string 
  }> => {
    try {
      console.log(`Running debug diagnostic on API source: ${args.apiSourceId}`);
      
      // Get the API source details
      const apiSource = await ctx.runQuery(api.news.getApiSource, { 
        id: args.apiSourceId 
      });
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...(apiSource.headers || {}),
        ...(apiSource.apiKey ? { "Authorization": `Bearer ${apiSource.apiKey}` } : {})
      };
      
      console.log(`Fetching from API: ${apiSource.url}`);
      
      // Make the API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(apiSource.url, { 
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }
      
      // Get the raw data
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Try to parse as JSON anyway, fall back to text if that fails
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { content: text, _source: "text_wrapped" };
        }
      }
      
      // Analyze the response format
      let detectedFormat = "unknown";
      let newsItems: any[] = [];
      
      if (Array.isArray(data)) {
        detectedFormat = "array_of_items";
        newsItems = data;
      } else if (data.articles && Array.isArray(data.articles)) {
        detectedFormat = "articles";
        newsItems = data.articles;
      } else if (data.items && Array.isArray(data.items)) {
        detectedFormat = "items";
        newsItems = data.items;
      } else if (data.results && Array.isArray(data.results)) {
        detectedFormat = "results";
        newsItems = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        detectedFormat = "data";
        newsItems = data.data;
      } else if (data.content && typeof data.content === 'string') {
        detectedFormat = "content_string";
        newsItems = [{ 
          title: apiSource.name,
          content: data.content,
          publishedAt: new Date().toISOString()
        }];
      } else {
        detectedFormat = "single_item";
        newsItems = [data];
      }
      
      // Return diagnostic information
      return {
        success: true,
        rawResponse: safeStringify(data).substring(0, 5000),
        detectedFormat,
        itemsCount: newsItems.length,
        sampleItem: newsItems.length > 0 ? newsItems[0] : undefined,
        extractedItems: safeStringify(newsItems.slice(0, 2)).substring(0, 2000)
      };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      console.error("API debug error:", errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
});

// Simple HTTP fetch helper using action
export const fetchFromNewsApi = action({
  args: {
    apiSourceId: v.id("newsApiSources"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> => {
    try {
      // Get the API source details
      const apiSource = await ctx.runQuery(api.news.getApiSource, { 
        id: args.apiSourceId 
      });
      
      if (!apiSource) {
        throw new Error("API source not found");
      }
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...(apiSource.headers || {}),
        ...(apiSource.apiKey ? { "Authorization": `Bearer ${apiSource.apiKey}` } : {})
      };
      
      console.log(`Fetching from API: ${apiSource.url}`);
      
      // Make the API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(apiSource.url, { 
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }
      
      // Get the raw data
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Try to parse as JSON anyway, fall back to text if that fails
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { content: text, _source: "text_wrapped" };
        }
      }
      
      return {
        success: true,
        data
      };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      console.error("API fetch error:", errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
});

// Alternative action to trigger API and process results
export const triggerNewsApiAndProcess = action({
  args: {
    apiSourceId: v.id("newsApiSources"),
    debug: v.optional(v.boolean())
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    message?: string;
    itemsProcessed?: number;
    error?: string;
    debug?: any;
  }> => {
    const debug = args.debug ?? false;
    console.log(`[News API Trigger] Starting for API source ${args.apiSourceId} (debug: ${debug})`);
    
    try {
      // Get the API source details
      const apiSource = await ctx.runQuery(api.news.getApiSource, { 
        id: args.apiSourceId 
      });
      
      if (!apiSource) {
        throw new Error("API source not found");
      }

      console.log(`[News API Trigger] Fetching from ${apiSource.name}: ${apiSource.url}`);
      
      // If in debug mode, get diagnostic info instead of processing
      if (debug) {
        const diagnosticInfo: {
          success: boolean;
          rawResponse?: string;
          detectedFormat?: string;
          itemsCount?: number;
          sampleItem?: any;
          extractedItems?: string;
          error?: string;
        } = await ctx.runAction(api.fetchNews.debugApiResponse, {
          apiSourceId: args.apiSourceId
        });
        
        return {
          success: true,
          message: `[DEBUG] API response analyzed: found ${diagnosticInfo.itemsCount || 0} potential items in ${diagnosticInfo.detectedFormat} format`,
          debug: diagnosticInfo
        };
      }

      // Fetch data from the API
      const result = await ctx.runAction(api.fetchNews.fetchFromNewsApi, {
        apiSourceId: args.apiSourceId
      });

      if (!result.success) {
        throw new Error(`API fetch failed: ${result.error}`);
      }

      console.log(`[News API Trigger] Successfully fetched data from ${apiSource.name}`);

      let newsItems: any[] = [];
      const data = result.data;

      // Extract news items from the response
      if (Array.isArray(data)) {
        console.log(`[News API Trigger] Response is an array with ${data.length} items`);
        newsItems = data;
      } else if (data.articles && Array.isArray(data.articles)) {
        console.log(`[News API Trigger] Response has 'articles' array with ${data.articles.length} items`);
        newsItems = data.articles;
      } else if (data.items && Array.isArray(data.items)) {
        console.log(`[News API Trigger] Response has 'items' array with ${data.items.length} items`);
        newsItems = data.items;
      } else if (data.results && Array.isArray(data.results)) {
        console.log(`[News API Trigger] Response has 'results' array with ${data.results.length} items`);
        newsItems = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        console.log(`[News API Trigger] Response has 'data' array with ${data.data.length} items`);
        newsItems = data.data;
      } else if (data.content && typeof data.content === 'string') {
        console.log(`[News API Trigger] Response has 'content' string`);
        newsItems = [{ 
          title: apiSource.name,
          content: data.content,
          publishedAt: new Date().toISOString()
        }];
      } else {
        console.log(`[News API Trigger] Response format not recognized, treating as single item`);
        console.log(`Response keys: ${Object.keys(data).join(', ')}`);
        newsItems = [data];
      }

      // Process news items
      if (newsItems.length === 0) {
        console.log(`[News API Trigger] No news items found in the response`);
        console.log(`Response structure: ${safeStringify(data).substring(0, 500)}`);
        
        // Update the last refreshed timestamp even if no items found
        await ctx.runMutation(api.news.updateApiSource, {
          id: args.apiSourceId,
          lastRefreshed: Date.now()
        });
        
        return {
          success: true,
          message: `API fetch successful but no items found in the response`,
          itemsProcessed: 0
        };
      }

      console.log(`[News API Trigger] Processing ${newsItems.length} news items`);
      
      // Process the news items
      const processResult = await ctx.runMutation(api.news.processApiNewsItems, {
        apiSourceId: args.apiSourceId,
        newsItems
      });
      
      // Update the last refreshed timestamp
      await ctx.runMutation(api.news.updateApiSource, {
        id: args.apiSourceId,
        lastRefreshed: Date.now()
      });

      return {
        success: true,
        message: `Successfully processed ${processResult.savedCount} news items`,
        itemsProcessed: processResult.savedCount,
        error: processResult.errors.length > 0 ? processResult.errors.join(", ") : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      console.error("[News API Trigger] Error:", errorMessage);
      
      return {
        success: false,
        message: `Error: ${errorMessage}`,
        error: errorMessage
      };
    }
  }
});

/**
 * Fetches news articles for a given company or topic.
 * This is a simple implementation that just returns mock data.
 */
export const fetchNews = action({
  args: {
    query: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Mock implementation - in a real app, we would call a news API here
    const { query, days = 7 } = args; // Default to 7 days if not specified
    
    // Generate mock articles
    const articles = generateMockArticles(query, days);
    
    return articles;
  },
});

// Helper function to generate mock articles
function generateMockArticles(topic: string, days: number): Article[] {
  const articles: Article[] = [];
  const currentDate = new Date();
  
  for (let i = 0; i < 5; i++) {
    // Create a random date within the specified days range
    const articleDate = new Date(currentDate);
    articleDate.setDate(articleDate.getDate() - Math.floor(Math.random() * days));
    
    articles.push({
      id: `article-${topic}-${i}`,
      title: `${topic} News Article ${i + 1}`,
      summary: `This is a summary of news about ${topic}. It contains relevant information about recent developments.`,
      content: `This is the full content of a news article about ${topic}. It would contain multiple paragraphs of information, quotes, and analysis.`,
      source: "Mock News Source",
      url: `https://example.com/news/${topic}/${i}`,
      publishDate: articleDate.toISOString(),
      sentiment: Math.random() > 0.7 ? "positive" : Math.random() > 0.4 ? "neutral" : "negative",
    });
  }
  
  return articles;
}

// Type definition for a news article
interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  publishDate: string;
  sentiment: "positive" | "neutral" | "negative";
} 