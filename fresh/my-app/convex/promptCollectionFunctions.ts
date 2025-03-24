import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getUser } from "./authUtils";

export const listPromptCollections = query({
  args: {},
  handler: async (ctx) => {
    // Return all prompt collections regardless of user
    const collections = await ctx.db
      .query("promptCollections")
      .collect();

    return collections;
  },
});

export const getPromptCollection = query({
  args: {
    id: v.id("promptCollections"),
  },
  handler: async (ctx, { id }) => {
    const collection = await ctx.db.get(id);
    
    if (!collection) {
      throw new Error("Prompt collection not found");
    }
    
    // No user check - all collections visible to everyone

    return collection;
  },
});

export const createPromptCollection = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    prompts: v.array(
      v.object({
        text: v.string(),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { title, description, prompts }) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("No users found in the database");
    }

    const now = Date.now();

    // Create a new collection with any user
    const id = await ctx.db.insert("promptCollections", {
      title,
      description,
      prompts,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const updatePromptCollection = mutation({
  args: {
    id: v.id("promptCollections"),
    title: v.string(),
    description: v.string(),
    prompts: v.array(
      v.object({
        text: v.string(),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { id, title, description, prompts }) => {
    // Check if the collection exists, but no user ownership check
    const existingCollection = await ctx.db.get(id);
    if (!existingCollection) {
      throw new Error("Prompt collection not found");
    }

    // Update the collection - no owner restrictions
    await ctx.db.patch(id, {
      title,
      description,
      prompts,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const deletePromptCollection = mutation({
  args: {
    id: v.id("promptCollections"),
  },
  handler: async (ctx, { id }) => {
    // Check if the collection exists, but no user ownership check
    const existingCollection = await ctx.db.get(id);
    if (!existingCollection) {
      throw new Error("Prompt collection not found");
    }

    // Delete the collection - no owner restrictions
    await ctx.db.delete(id);

    return id;
  },
}); 