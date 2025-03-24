import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getUser } from "./authUtils";

// List all business contexts for all users
export const listBusinessContexts = query({
  args: {},
  handler: async (ctx) => {
    // Simplified: No user check, return all business contexts
    const contexts = await ctx.db
      .query("businessContexts")
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
    const context = await ctx.db.get(id);
    
    if (!context) {
      throw new Error("Business context not found");
    }
    
    // No user ownership check

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
      throw new Error("No users found in the database");
    }

    const now = Date.now();

    // Create a new context
    const id = await ctx.db.insert("businessContexts", {
      title,
      description,
      userId: user._id, // Still assign to a user for database consistency
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
    // Get user for database consistency, but don't restrict based on ownership
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("No users found in the database");
    }

    // Check if the context exists
    const existingContext = await ctx.db.get(id);
    if (!existingContext) {
      throw new Error("Business context not found");
    }

    // No ownership check - anyone can edit

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
    // Get user for database consistency, but don't restrict based on ownership
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("No users found in the database");
    }

    // Check if the context exists
    const existingContext = await ctx.db.get(id);
    if (!existingContext) {
      throw new Error("Business context not found");
    }

    // No ownership check - anyone can delete

    // Delete the context
    await ctx.db.delete(id);

    return id;
  },
}); 