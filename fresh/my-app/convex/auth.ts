import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser } from "./authUtils";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
});

// Check if the user is authenticated
export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    try {
      await getUser(ctx);
      return true;
    } catch (error) {
      return false;
    }
  },
});

// Get user by token identifier or email
export const getUserByToken = query({
  args: { 
    tokenIdentifier: v.string(),
    email: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // First try by tokenIdentifier
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
    
    // If not found and email provided, try by email
    if (!user && args.email) {
      const possibleUsers = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .collect();
      
      if (possibleUsers.length > 0) {
        user = possibleUsers[0];
        
        // In queries we can't update documents
        // For updating, clients should call a separate mutation
      }
    }
    
    return user;
  },
});

// Mutation to update user tokenIdentifier
export const updateUserTokenIdentifier = mutation({
  args: { 
    userId: v.id("users"),
    tokenIdentifier: v.string() 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      tokenIdentifier: args.tokenIdentifier
    });
    return true;
  },
});

// Create a new user
export const createNewUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Create the user record
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name || args.email?.split('@')[0] || "User"
    });
    
    console.log("Created new user:", userId);
    return userId;
  },
});

// Get user by ID
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
