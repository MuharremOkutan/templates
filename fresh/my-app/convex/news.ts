import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getUser } from "./authUtils";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { transformNewsItem, safeStringify, NewsItem } from "./utils/newsHelpers";

// List all news items for the current user
export const listNewsItems = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      return [];
    }

    const newsItems = await ctx.db
      .query("news")
      .withIndex("by_publish_date", (q) => q.eq("userId", user._id))
      .order("desc")  // Sort by publishDate in descending order (newest first)
      .collect();

    return newsItems;
  },
});

// Get a specific news item by ID
export const getNewsItem = query({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const newsItem = await ctx.db.get(args.id);
    if (!newsItem) {
      throw new Error("News item not found");
    }

    // Check if user has access to this news item
    if (newsItem.userId !== user._id) {
      throw new Error("Unauthorized access to news item");
    }

    return newsItem;
  },
});

// Create a new news item
export const createNewsItem = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    source: v.string(),
    publishDate: v.string(),
    industry: v.string(),
    entities: v.array(v.string()),
    businessContexts: v.array(v.string()),
    fullContent: v.optional(v.string()),
    apiResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const newsId = await ctx.db.insert("news", {
      ...args,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: newsId };
  },
});

// Update an existing news item
export const updateNewsItem = mutation({
  args: {
    id: v.id("news"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    source: v.optional(v.string()),
    publishDate: v.optional(v.string()),
    industry: v.optional(v.string()),
    entities: v.optional(v.array(v.string())),
    businessContexts: v.optional(v.array(v.string())),
    fullContent: v.optional(v.string()),
    apiResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get the existing news item
    const newsItem = await ctx.db.get(id);
    if (!newsItem) {
      throw new Error("News item not found");
    }

    // Check if user has access to this news item
    if (newsItem.userId !== user._id) {
      throw new Error("Unauthorized access to news item");
    }

    // Update the news item
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete a news item
export const deleteNewsItem = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get the existing news item
    const newsItem = await ctx.db.get(args.id);
    if (!newsItem) {
      throw new Error("News item not found");
    }

    // Check if user has access to this news item
    if (newsItem.userId !== user._id) {
      throw new Error("Unauthorized access to news item");
    }

    // Delete the news item
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Search news items by title, summary, or source
export const searchNewsItems = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      return [];
    }

    // Get all news items for user
    const allNewsItems = await ctx.db
      .query("news")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    // If query is empty, return all news items
    if (!args.query) {
      return allNewsItems;
    }
    
    // Filter items based on the search query
    const searchTerm = args.query.toLowerCase();
    return allNewsItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.summary.toLowerCase().includes(searchTerm) ||
        item.source.toLowerCase().includes(searchTerm) ||
        item.industry.toLowerCase().includes(searchTerm)
    );
  },
});

// List all API sources for the current user
export const listApiSources = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      return [];
    }

    const apiSources = await ctx.db
      .query("newsApiSources")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return apiSources;
  },
});

// Get a specific API source by ID
export const getApiSource = query({
  args: { id: v.id("newsApiSources") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const apiSource = await ctx.db.get(args.id);
    if (!apiSource) {
      throw new Error("API source not found");
    }

    // Check if user has access to this API source
    if (apiSource.userId !== user._id) {
      throw new Error("Unauthorized access to API source");
    }

    return apiSource;
  },
});

// Create a new API source
export const createApiSource = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    apiKey: v.optional(v.string()),
    headers: v.optional(v.any()),
    active: v.boolean(),
    refreshWeekdays: v.array(v.number()),
    refreshHour: v.number(),
    refreshMinute: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Validate input
    if (args.refreshHour < 0 || args.refreshHour > 23) {
      throw new Error("Refresh hour must be between 0 and 23");
    }
    
    if (args.refreshMinute < 0 || args.refreshMinute > 59) {
      throw new Error("Refresh minute must be between 0 and 59");
    }
    
    for (const weekday of args.refreshWeekdays) {
      if (weekday < 0 || weekday > 6) {
        throw new Error("Weekdays must be between 0 (Sunday) and 6 (Saturday)");
      }
    }

    const apiSourceId = await ctx.db.insert("newsApiSources", {
      ...args,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: apiSourceId };
  },
});

// Update an existing API source
export const updateApiSource = mutation({
  args: {
    id: v.id("newsApiSources"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    headers: v.optional(v.any()),
    refreshHour: v.optional(v.number()),
    refreshMinute: v.optional(v.number()),
    refreshWeekdays: v.optional(v.array(v.number())),
    isActive: v.optional(v.boolean()),
    lastRefreshed: v.optional(v.number()),
    lastTriggered: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Get the API source
    const apiSource = await ctx.db.get(args.id);
    if (!apiSource || apiSource.userId !== user._id) {
      throw new Error("API Source not found or unauthorized");
    }
    
    // Validate input
    if (args.refreshHour !== undefined && (args.refreshHour < 0 || args.refreshHour > 23)) {
      throw new Error("Refresh hour must be between 0 and 23");
    }
    
    if (args.refreshMinute !== undefined && (args.refreshMinute < 0 || args.refreshMinute > 59)) {
      throw new Error("Refresh minute must be between 0 and 59");
    }
    
    if (args.refreshWeekdays !== undefined) {
      for (const day of args.refreshWeekdays) {
        if (day < 0 || day > 6) {
          throw new Error("Refresh weekdays must be between 0 and 6");
        }
      }
    }
    
    // Remove undefined fields
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      if (key !== 'id' && value !== undefined) {
        updateData[key] = value;
      }
    }
    
    // Always add updated timestamp
    updateData.updatedAt = Date.now();
    
    // Update the API source
    const updatedId = await ctx.db.patch(args.id, updateData);
    
    return { 
      id: updatedId,
      success: true 
    };
  },
});

// Delete an API source
export const deleteApiSource = mutation({
  args: { id: v.id("newsApiSources") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get the existing API source
    const apiSource = await ctx.db.get(args.id);
    if (!apiSource) {
      throw new Error("API source not found");
    }

    // Check if user has access to this API source
    if (apiSource.userId !== user._id) {
      throw new Error("Unauthorized access to API source");
    }

    // Delete the API source
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Process news items from API data
export const processApiNewsItems = mutation({
  args: {
    apiSourceId: v.id("newsApiSources"),
    newsItems: v.array(v.any()),
  },
  handler: async (ctx, args): Promise<{
    savedCount: number;
    errors: string[];
    savedItems: Id<"news">[];
  }> => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { apiSourceId, newsItems } = args;

    // Get the API source to check ownership and get details
    const apiSource = await ctx.db.get(apiSourceId);
    if (!apiSource || apiSource.userId !== user._id) {
      throw new Error("API Source not found or unauthorized");
    }

    console.log(`Processing ${newsItems.length} news items from API source ${apiSource.name}`);
    const savedItems: Id<"news">[] = [];
    const errors: string[] = [];

    // Process each news item individually so one failure doesn't break all
    for (const item of newsItems) {
      try {
        // Transform the item with our improved helper
        const transformedItem = transformNewsItem(item, apiSourceId);
        
        if (!transformedItem) {
          errors.push(`Failed to transform item: ${safeStringify(item).substring(0, 100)}`);
          continue;
        }
        
        // Check if this article already exists (by article_id or title)
        const existingItems = await ctx.db
          .query("news")
          .filter((q) => {
            if (transformedItem.article_id) {
              return q.and(
                q.eq(q.field("userId"), user._id),
                q.eq(q.field("_creationTime"), q.field("_creationTime")), // Dummy condition to work around the field issue
                q.eq(q.field("article_id"), transformedItem.article_id)
              );
            }
            return q.and(
              q.eq(q.field("userId"), user._id),
              q.eq(q.field("_creationTime"), q.field("_creationTime")), // Dummy condition to work around the field issue
              q.eq(q.field("title"), transformedItem.title)
            );
          })
          .collect();
        
        if (existingItems.length > 0) {
          console.log(`Item already exists: ${transformedItem.title}`);
          continue;
        }

        // Adapt the transformed item to match the news table schema
        const newsItemToInsert = {
          title: transformedItem.title,
          summary: transformedItem.content, // Use content as summary
          source: transformedItem.source.name,
          publishDate: transformedItem.publishedAt,
          industry: transformedItem.categories.length > 0 ? transformedItem.categories[0] : "General",
          entities: Array.isArray(transformedItem.entities) ? 
            transformedItem.entities.map(e => typeof e === 'string' ? e : JSON.stringify(e)) : [],
          businessContexts: Array.isArray(transformedItem.businessContexts) ?
            transformedItem.businessContexts.map(e => typeof e === 'string' ? e : JSON.stringify(e)) : [],
          fullContent: transformedItem.content,
          apiResponse: safeStringify(item),
          
          // Additional fields
          article_id: transformedItem.article_id,
          link: transformedItem.link,
          keywords: transformedItem.keywords,
          creator: transformedItem.creator ? [transformedItem.creator] : [],
          image_url: transformedItem.image_url,
          language: transformedItem.language,
          category: transformedItem.categories,
          country: transformedItem.country ? [transformedItem.country] : [],
          sentiment: transformedItem.sentiment ? JSON.stringify(transformedItem.sentiment) : undefined,
          
          // Required fields
          userId: user._id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        // Save the news item
        const newsId = await ctx.db.insert("news", newsItemToInsert);
        
        console.log(`Saved news item: ${transformedItem.title}`);
        savedItems.push(newsId);
      } catch (error) {
        console.error(`Error processing news item:`, error);
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`Successfully processed ${savedItems.length} news items with ${errors.length} errors`);
    return {
      savedCount: savedItems.length,
      errors,
      savedItems,
    };
  },
});

// Manually trigger an API fetch from a specific source
export const triggerApiSource = action({
  args: {
    id: v.id("newsApiSources"),
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
    
    // Actions can't use getUser - use getUserIdentity directly
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the API source
    const apiSource = await ctx.runQuery(api.news.getApiSource, { id: args.id });
    if (!apiSource) {
      throw new Error("API Source not found");
    }
    
    // The getApiSource function already checks authorization

    console.log(`Triggering API source: ${apiSource.name} (${args.id})`);
    
    try {
      // Use our improved action to trigger the API and process the results
      const result = await ctx.runAction(api.fetchNews.triggerNewsApiAndProcess, {
        apiSourceId: args.id,
        debug
      });
      
      // Always update the last triggered timestamp regardless of success
      await ctx.runMutation(api.news.updateApiSource, {
        id: args.id,
        lastTriggered: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error(`Error triggering API source ${apiSource.name}:`, error);
      
      // Still update the last triggered timestamp
      await ctx.runMutation(api.news.updateApiSource, {
        id: args.id,
        lastTriggered: Date.now()
      });
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      return {
        success: false,
        message: `Failed to trigger API source: ${errorMessage}`,
        error: errorMessage
      };
    }
  }
});

// Get all news items for the current user
// This is the function that was missing and causing the error
export const getNews = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      return [];
    }

    const newsItems = await ctx.db
      .query("news")
      .withIndex("by_publish_date", (q) => q.eq("userId", user._id))
      .order("desc")  // Sort by publishDate in descending order (newest first)
      .collect();

    return newsItems;
  },
});