import { v } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

/**
 * Get the user from the provided context
 * Modified to return the first user for all operations - all data is shared
 * @param ctx Query, Mutation, or Action context
 * @returns The first user document
 */
export async function getUser(ctx: QueryCtx | MutationCtx) {
  // Return the first user from the database
  // This makes all data visible to all users
  return await ctx.db
    .query("users")
    .first();
}

/**
 * Helper to get the user from the provided context
 * Asserts that the user exists and is authenticated
 * @param ctx
 * @returns The user document (thrown an error if not authenticated)
 */
export async function assertUser(ctx: QueryCtx | MutationCtx) {
  const user = await getUser(ctx);
  if (!user) {
    throw new Error("No users found in the database");
  }
  return user;
}

// Added for explorationFunctions.ts compatibility
export async function getUserFromContext(ctx: QueryCtx | MutationCtx) {
  return getUser(ctx);
}

// Action context variant
export async function getUserFromAction(ctx: ActionCtx) {
  try {
    // Use the first user for all operations
    const user = await ctx.runQuery(api.auth.getUserByToken, { 
      tokenIdentifier: "shared_access", 
      email: "shared@example.com" 
    });
    
    if (!user) {
      // If no user exists yet, try to get any user
      const firstUser = await ctx.runQuery(api.myFunctions.listNumbers, { count: 1 });
      if (firstUser && firstUser.viewer) {
        return firstUser.viewer;
      }
      
      console.warn("No users found in the database");
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error getting user from action:", error);
    return null;
  }
} 