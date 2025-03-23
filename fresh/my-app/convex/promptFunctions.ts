import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Prompt Functions
export const listPrompts = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("prompts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createPrompt = mutation({
  args: {
    content: v.string(),
    example: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const promptId = await ctx.db.insert("prompts", {
      content: args.content,
      example: args.example,
      userId,
      createdAt: Date.now(),
    });

    return promptId;
  },
});

export const updatePrompt = mutation({
  args: {
    id: v.id("prompts"),
    content: v.string(),
    example: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = await ctx.db.get(args.id);
    if (!prompt) throw new Error("Prompt not found");
    if (prompt.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, {
      content: args.content,
      example: args.example,
    });

    return args.id;
  },
});

export const deletePrompt = mutation({
  args: {
    id: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = await ctx.db.get(args.id);
    if (!prompt) throw new Error("Prompt not found");
    if (prompt.userId !== userId) throw new Error("Not authorized");

    // Find all collections containing this prompt and remove it
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    for (const collection of collections) {
      if (collection.promptIds.includes(args.id)) {
        await ctx.db.patch(collection._id, {
          promptIds: collection.promptIds.filter(id => id !== args.id)
        });
      }
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Collection Functions
export const listCollections = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getCollectionPrompts = query({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.userId !== userId) return [];

    // Get all prompts in this collection
    const prompts = [];
    for (const promptId of collection.promptIds) {
      const prompt = await ctx.db.get(promptId);
      if (prompt && prompt.userId === userId) {
        prompts.push(prompt);
      }
    }

    return prompts;
  },
});

export const createCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    promptIds: v.array(v.id("prompts")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify all prompts belong to this user
    for (const promptId of args.promptIds) {
      const prompt = await ctx.db.get(promptId);
      if (!prompt || prompt.userId !== userId) {
        throw new Error("Not authorized to include one or more prompts");
      }
    }

    const collectionId = await ctx.db.insert("collections", {
      name: args.name,
      description: args.description,
      promptIds: args.promptIds,
      userId,
      createdAt: Date.now(),
    });

    return collectionId;
  },
});

export const updateCollection = mutation({
  args: {
    id: v.id("collections"),
    name: v.string(),
    description: v.optional(v.string()),
    promptIds: v.array(v.id("prompts")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const collection = await ctx.db.get(args.id);
    if (!collection) throw new Error("Collection not found");
    if (collection.userId !== userId) throw new Error("Not authorized");

    // Verify all prompts belong to this user
    for (const promptId of args.promptIds) {
      const prompt = await ctx.db.get(promptId);
      if (!prompt || prompt.userId !== userId) {
        throw new Error("Not authorized to include one or more prompts");
      }
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      promptIds: args.promptIds,
    });

    return args.id;
  },
});

export const deleteCollection = mutation({
  args: {
    id: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const collection = await ctx.db.get(args.id);
    if (!collection) throw new Error("Collection not found");
    if (collection.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const addPromptsToCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    promptIds: v.array(v.id("prompts")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");
    if (collection.userId !== userId) throw new Error("Not authorized");

    // Verify all prompts belong to this user
    for (const promptId of args.promptIds) {
      const prompt = await ctx.db.get(promptId);
      if (!prompt || prompt.userId !== userId) {
        throw new Error("Not authorized to include one or more prompts");
      }
    }

    // Add prompts that aren't already in the collection
    const updatedPromptIds = [...new Set([...collection.promptIds, ...args.promptIds])];
    
    await ctx.db.patch(args.collectionId, {
      promptIds: updatedPromptIds,
    });

    return args.collectionId;
  },
});

export const removePromptFromCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");
    if (collection.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.collectionId, {
      promptIds: collection.promptIds.filter(id => id !== args.promptId),
    });

    return args.collectionId;
  },
}); 