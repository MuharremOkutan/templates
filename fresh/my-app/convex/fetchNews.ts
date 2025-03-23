import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { safeStringify } from "./utils/newsHelpers";

// Simple HTTP fetch helper using action
export const fetchFromNewsApi = action({
  args: { 
    url: v.string(),
    headers: v.optional(v.any())
  },
  handler: async (ctx, args): Promise<{ success: boolean, data?: any, error?: string }> => {
    try {
      console.log(`Fetching from API: ${args.url}`);
      
      // Make the API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response: Response = await fetch(args.url, { 
        headers: args.headers || {},
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }
      
      // Some APIs might not return JSON
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Try to parse as JSON anyway, fall back to text if that fails
        try {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            // Not JSON, wrap the text in an object
            data = { content: text, _source: "text_wrapped" };
          }
        } catch (e) {
          throw new Error(`Failed to read response body: ${e}`);
        }
      }
      
      console.log(`Successfully fetched from API: ${args.url}`);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      console.error("News API fetch error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }
});

// Alternative action to trigger API and process results
export const triggerNewsApiAndProcess = action({
  args: { id: v.id("newsApiSources") },
  handler: async (ctx, args): Promise<{ success: boolean; itemsImported: number; errors?: any[] }> => {
    try {
      console.log(`Running news API trigger for source: ${args.id}`);
      
      // Get the API source details
      const apiSource: {
        _id: Id<"newsApiSources">;
        name: string;
        url: string;
        apiKey?: string;
        headers?: Record<string, string>;
        userId: Id<"users">;
      } = await ctx.runQuery(api.news.getApiSource, { id: args.id });
      
      console.log(`Found API source: ${apiSource.name}, URL: ${apiSource.url}`);
      
      // Prepare headers
      const headers: Record<string, string> = {
        ...(apiSource.headers || {}),
        ...(apiSource.apiKey ? { "Authorization": `Bearer ${apiSource.apiKey}` } : {})
      };
      
      // Use our simpler fetch helper
      const fetchResult: { 
        success: boolean; 
        data?: any; 
        error?: string 
      } = await ctx.runAction(api.fetchNews.fetchFromNewsApi, {
        url: apiSource.url,
        headers
      });
      
      if (!fetchResult.success) {
        throw new Error(fetchResult.error || "Unknown fetch error");
      }
      
      const data: any = fetchResult.data;
      
      if (!data) {
        throw new Error("API returned no data");
      }
      
      // Process and store the news items - handle different API response formats
      let newsItems: any[] = [];
      
      if (Array.isArray(data)) {
        newsItems = data; // The response itself is an array of items
      } else if (data.articles && Array.isArray(data.articles)) {
        newsItems = data.articles; // Common format for news APIs
      } else if (data.items && Array.isArray(data.items)) {
        newsItems = data.items; // RSS feed format
      } else if (data.results && Array.isArray(data.results)) {
        newsItems = data.results; // Some APIs use this format
      } else if (data.data && Array.isArray(data.data)) {
        newsItems = data.data; // Generic API wrapper
      } else if (data.content && typeof data.content === 'string') {
        // This might be a text response we need to parse
        try {
          // Try to create a single news item from this content
          newsItems = [{ 
            title: apiSource.name,
            content: data.content,
            publishedAt: new Date().toISOString()
          }];
        } catch (e) {
          throw new Error(`Could not parse API response as news items. Response: ${safeStringify(data).substring(0, 200)}...`);
        }
      } else {
        // If we can't find an array, try to use the entire response as a single item
        try {
          newsItems = [data];
          console.log("Using whole response as a single news item");
        } catch (e) {
          throw new Error(`Could not parse API response as news items. Response: ${safeStringify(data).substring(0, 200)}...`);
        }
      }
      
      console.log(`Found ${newsItems.length} news items from API`);
      
      if (newsItems.length === 0) {
        return {
          success: true,
          itemsImported: 0,
          errors: [{ message: "API returned no news items" }]
        };
      }
      
      // Use the mutation to process the news items
      const result: { 
        success: boolean; 
        itemsImported: number;
        errors?: any[];
      } = await ctx.runMutation(api.news.processApiNewsItems, {
        apiSourceId: args.id,
        newsItems,
        sourceName: apiSource.name
      });
      
      console.log(`Successfully processed ${result.itemsImported} news items`);
      return result;
    } catch (error) {
      console.error("Error in triggerNewsApiAndProcess:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      // Still return a properly formatted response instead of throwing
      return {
        success: false,
        itemsImported: 0,
        errors: [{ message: `Failed to fetch from API: ${errorMessage}` }]
      };
    }
  }
}); 