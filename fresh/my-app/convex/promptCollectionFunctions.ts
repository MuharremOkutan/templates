import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getUser } from "./authUtils";

export const listPromptCollections = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Query all prompt collections for the current user
    const collections = await ctx.db
      .query("promptCollections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return collections;
  },
});

export const getPromptCollection = query({
  args: {
    id: v.id("promptCollections"),
  },
  handler: async (ctx, { id }) => {
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const collection = await ctx.db.get(id);
    
    if (!collection) {
      throw new Error("Prompt collection not found");
    }
    
    if (collection.userId !== user._id) {
      throw new Error("You don't have permission to view this prompt collection");
    }

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
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Create a new collection
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
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if the collection exists and belongs to the user
    const existingCollection = await ctx.db.get(id);
    if (!existingCollection) {
      throw new Error("Prompt collection not found");
    }

    if (existingCollection.userId !== user._id) {
      throw new Error("You don't have permission to edit this prompt collection");
    }

    // Update the collection
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
    const user = await getUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if the collection exists and belongs to the user
    const existingCollection = await ctx.db.get(id);
    if (!existingCollection) {
      throw new Error("Prompt collection not found");
    }

    if (existingCollection.userId !== user._id) {
      throw new Error("You don't have permission to delete this prompt collection");
    }

    // Delete the collection
    await ctx.db.delete(id);

    return id;
  },
}); 