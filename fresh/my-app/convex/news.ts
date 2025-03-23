import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser } from "./authUtils";
import { Id } from "./_generated/dataModel";

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
    active: v.optional(v.boolean()),
    refreshWeekdays: v.optional(v.array(v.number())),
    refreshHour: v.optional(v.number()),
    refreshMinute: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get the existing API source
    const apiSource = await ctx.db.get(id);
    if (!apiSource) {
      throw new Error("API source not found");
    }

    // Check if user has access to this API source
    if (apiSource.userId !== user._id) {
      throw new Error("Unauthorized access to API source");
    }

    // Validate input if provided
    if (updates.refreshHour !== undefined && (updates.refreshHour < 0 || updates.refreshHour > 23)) {
      throw new Error("Refresh hour must be between 0 and 23");
    }
    
    if (updates.refreshMinute !== undefined && (updates.refreshMinute < 0 || updates.refreshMinute > 59)) {
      throw new Error("Refresh minute must be between 0 and 59");
    }
    
    if (updates.refreshWeekdays) {
      for (const weekday of updates.refreshWeekdays) {
        if (weekday < 0 || weekday > 6) {
          throw new Error("Weekdays must be between 0 (Sunday) and 6 (Saturday)");
        }
      }
    }

    // Update the API source
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
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