import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getUser } from "./authUtils";

// List all business contexts for the authenticated user
export const listBusinessContexts = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Get the user from auth
      const user = await getUser(ctx);
      
      // Query business contexts for this user, sorted by most recently updated
      const contexts = await ctx.db
        .query("businessContexts")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
      
      return contexts;
    } catch (err) {
      console.error("Error listing business contexts:", err);
      
      // If this is an authentication error, retry by checking if user exists
      if (err instanceof Error && err.message.includes("User not found")) {
        // Check if the user is authenticated but just doesn't have any contexts yet
        const identity = await ctx.auth.getUserIdentity();
        if (identity) {
          console.log("User is authenticated but not found in database - returning empty contexts list");
          return []; // Return empty array instead of throwing
        }
      }
      
      throw new Error("Failed to load business contexts. Please try again.");
    }
  },
});

// Get a single business context by ID
export const getBusinessContext = query({
  args: { id: v.id("businessContexts") },
  handler: async (ctx, args) => {
    try {
      // Get the user from auth
      const user = await getUser(ctx);
      
      // Fetch the specified business context
      const context = await ctx.db.get(args.id);
      
      // Check if context exists and belongs to this user
      if (!context) {
        throw new Error("Business context not found");
      }
      
      if (context.userId !== user._id) {
        throw new Error("You don't have permission to access this business context");
      }
      
      return context;
    } catch (err) {
      console.error("Error getting business context:", err);
      throw new Error("Failed to load business context. Please try again.");
    }
  },
});

// Create a new business context
export const createBusinessContext = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the user from auth
      const user = await getUser(ctx);
      
      const currentTime = Date.now();
      
      // Insert the new business context
      const id = await ctx.db.insert("businessContexts", {
        title: args.title,
        description: args.description,
        userId: user._id,
        createdAt: currentTime,
        updatedAt: currentTime,
      });
      
      return id;
    } catch (err) {
      console.error("Error creating business context:", err);
      throw new Error("Failed to create business context. Please try again.");
    }
  },
});

// Update an existing business context
export const updateBusinessContext = mutation({
  args: {
    id: v.id("businessContexts"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the user from auth
      const user = await getUser(ctx);
      
      // Fetch the business context to verify ownership
      const existingContext = await ctx.db.get(args.id);
      
      // Verify the context exists and user owns it
      if (!existingContext) {
        throw new Error("Business context not found");
      }
      
      if (existingContext.userId !== user._id) {
        throw new Error("You don't have permission to update this business context");
      }
      
      // Update the business context
      await ctx.db.patch(args.id, {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
      
      return args.id;
    } catch (err) {
      console.error("Error updating business context:", err);
      throw new Error("Failed to update business context. Please try again.");
    }
  },
});

// Delete a business context
export const deleteBusinessContext = mutation({
  args: {
    id: v.id("businessContexts"),
  },
  handler: async (ctx, args) => {
    try {
      // Get the user from auth
      const user = await getUser(ctx);
      
      // Fetch the business context to verify ownership
      const existingContext = await ctx.db.get(args.id);
      
      // Verify the context exists and user owns it
      if (!existingContext) {
        throw new Error("Business context not found");
      }
      
      if (existingContext.userId !== user._id) {
        throw new Error("You don't have permission to delete this business context");
      }
      
      // Delete the business context
      await ctx.db.delete(args.id);
      
      return args.id;
    } catch (err) {
      console.error("Error deleting business context:", err);
      throw new Error("Failed to delete business context. Please try again.");
    }
  },
}); 