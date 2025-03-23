import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Get the current user ID from the context
export async function getUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  
  // First try to get user by tokenIdentifier
  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  
  // If not found, try to find by email (for legacy users)
  if (!user && identity.email) {
    const possibleUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();
    
    if (possibleUsers.length > 0) {
      user = possibleUsers[0];
      
      // If this is a mutation context, we can update the user
      const isMutation = 'patch' in ctx.db;
      if (isMutation) {
        // Only update in mutation context
        await (ctx.db as MutationCtx['db']).patch(user._id, {
          tokenIdentifier: identity.tokenIdentifier
        });
      }
    }
  }
  
  // If still no user found and we have a mutation context, create a new user
  if (!user && 'insert' in ctx.db) {
    console.log("Creating new user for tokenIdentifier:", identity.tokenIdentifier);
    
    try {
      // Create a new user record
      const userId = await (ctx.db as MutationCtx['db']).insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        name: identity.name || identity.email?.split('@')[0] || "User"
      });
      
      // Fetch the created user
      user = await ctx.db.get(userId);
    } catch (error) {
      console.error("Failed to create new user:", error);
      throw new ConvexError("Failed to create user account");
    }
  }
  
  if (!user) {
    throw new ConvexError("User not found. Please try signing out and signing back in.");
  }
  
  return user;
}

// Separate function for action context which doesn't have direct db access
export async function getUserFromAction(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  
  try {
    // For actions, we need to use ctx.runQuery
    let user = await ctx.runQuery(api.auth.getUserByToken, {
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email
    });
    
    // If no user was found, try to create one
    if (!user) {
      // Try to create a new user
      const userId = await ctx.runMutation(api.auth.createNewUser, {
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        name: identity.name || identity.email?.split('@')[0] || "User"
      });
      
      // Fetch the new user
      user = await ctx.runQuery(api.auth.getUserById, { id: userId });
    } else if (user.tokenIdentifier !== identity.tokenIdentifier) {
      // Update tokenIdentifier if needed
      await ctx.runMutation(api.auth.updateUserTokenIdentifier, {
        userId: user._id,
        tokenIdentifier: identity.tokenIdentifier
      });
    }
    
    if (!user) {
      throw new ConvexError("User not found even after creation attempt");
    }
    
    return user;
  } catch (error) {
    console.error("Error getting user from action:", error);
    throw new ConvexError("Failed to retrieve user");
  }
} 