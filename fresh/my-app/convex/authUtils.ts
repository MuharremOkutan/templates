import { v } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

/**
 * Get the user from the provided context
 * Check if the user exists and is authenticated
 * @param ctx Query, Mutation, or Action context
 * @returns The user document or null if not authenticated
 */
export async function getUser(ctx: QueryCtx | MutationCtx) {
  // Get the user ID from the auth rule
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Check if we've stored this identity before (should have an associated user document for the given token)
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .first();

  if (!user) {
    console.warn(`User not found with tokenIdentifier: ${identity.tokenIdentifier}`);
    return null;
  }

  return user;
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
    throw new Error("Not authenticated");
  }
  return user;
}

// Added for explorationFunctions.ts compatibility
export async function getUserFromContext(ctx: QueryCtx | MutationCtx) {
  return getUser(ctx);
}

// Action context variant
export async function getUserFromAction(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  try {
    // Check if we've stored this identity before
    const tokenIdentifier = identity.tokenIdentifier;
    
    // Use the proper function reference syntax
    const user = await ctx.runQuery(api.auth.getUserByToken, { 
      tokenIdentifier, 
      email: identity.email 
    });
    
    if (!user) {
      console.warn(`User not found for token: ${tokenIdentifier}`);
      
      // Try to create a new user if none exists
      try {
        const name = identity.name || identity.email?.split('@')[0] || "User";
        const email = identity.email;
        
        const userId = await ctx.runMutation(api.auth.createNewUser, {
          tokenIdentifier,
          email,
          name
        });
        
        // Fetch the new user
        if (userId) {
          const newUser = await ctx.runQuery(api.auth.getUserById, { id: userId });
          return newUser;
        }
        return null;
      } catch (createError) {
        console.error("Error creating user:", createError);
        return null;
      }
    }
    
    return user;
  } catch (error) {
    console.error("Error getting user from action:", error);
    return null;
  }
} 