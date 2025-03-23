import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getUser } from "./authUtils";

// List all business contexts for the authenticated user
export const listBusinessContexts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Query all business contexts for the current user
    const contexts = await ctx.db
      .query("businessContexts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return contexts;
  },
});

// Get a single business context by ID
export const getBusinessContext = query({
  args: {
    id: v.id("businessContexts"),
  },
  handler: async (ctx, { id }) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const context = await ctx.db.get(id);
    
    if (!context) {
      throw new Error("Business context not found");
    }
    
    if (context.userId !== user._id) {
      throw new Error("You don't have permission to view this business context");
    }

    return context;
  },
});

// Create a new business context
export const createBusinessContext = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { title, description }) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Create a new context
    const id = await ctx.db.insert("businessContexts", {
      title,
      description,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Update an existing business context
export const updateBusinessContext = mutation({
  args: {
    id: v.id("businessContexts"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { id, title, description }) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if the context exists and belongs to the user
    const existingContext = await ctx.db.get(id);
    if (!existingContext) {
      throw new Error("Business context not found");
    }

    if (existingContext.userId !== user._id) {
      throw new Error("You don't have permission to edit this business context");
    }

    // Update the context
    await ctx.db.patch(id, {
      title,
      description,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a business context
export const deleteBusinessContext = mutation({
  args: {
    id: v.id("businessContexts"),
  },
  handler: async (ctx, { id }) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if the context exists and belongs to the user
    const existingContext = await ctx.db.get(id);
    if (!existingContext) {
      throw new Error("Business context not found");
    }

    if (existingContext.userId !== user._id) {
      throw new Error("You don't have permission to delete this business context");
    }

    // Delete the context
    await ctx.db.delete(id);

    return id;
  },
}); 