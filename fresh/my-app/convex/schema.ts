import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Add by_token index to users table with complete field definitions
export const userTableWithCustomIndex = defineTable({
  // Make tokenIdentifier optional to accommodate existing documents
  tokenIdentifier: v.optional(v.string()),
  // Include email field which is present in existing documents
  email: v.optional(v.string()),
  // Include all fields from the standard users table
  name: v.optional(v.string()),
  givenName: v.optional(v.string()),
  familyName: v.optional(v.string()),
  pictureUrl: v.optional(v.string()),
  // Fields for OAuth
  oauthAccessToken: v.optional(v.string()),
  oauthRefreshToken: v.optional(v.string()),
  oauthIdToken: v.optional(v.string()),
  oauthTokenSecret: v.optional(v.string()),
  oauthExpiresIn: v.optional(v.number()),
  oauthScope: v.optional(v.string()),
}).index("by_token", ["tokenIdentifier"]);

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  // Override users table from authTables with the one containing our custom index
  users: userTableWithCustomIndex,
  numbers: defineTable({
    value: v.number(),
  }),
  prompts: defineTable({
    content: v.string(),
    example: v.string(),
    userId: v.id("users"),
    createdAt: v.number(), // timestamp
  }).index("by_user", ["userId"]),
  collections: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    promptIds: v.array(v.id("prompts")), // Array of prompt IDs
    userId: v.id("users"),
    createdAt: v.number(), // timestamp
  }).index("by_user", ["userId"]),
  businessContexts: defineTable({
    title: v.string(),
    description: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  newsApiSources: defineTable({
    name: v.string(),
    url: v.string(),
    apiKey: v.optional(v.string()),
    headers: v.optional(v.any()), // Additional headers as JSON
    active: v.boolean(),
    // Refresh schedule
    refreshWeekdays: v.array(v.number()), // 0-6 (Sunday-Saturday)
    refreshHour: v.number(), // 0-23
    refreshMinute: v.number(), // 0-59
    lastRefreshed: v.optional(v.number()), // timestamp
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  news: defineTable({
    title: v.string(),
    summary: v.string(),
    source: v.string(),
    publishDate: v.string(),
    industry: v.string(),
    entities: v.array(v.string()),
    businessContexts: v.array(v.string()),
    fullContent: v.optional(v.string()),
    apiResponse: v.optional(v.string()), // Store the full API response as JSON string
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_publish_date", ["userId", "publishDate"]),
});
