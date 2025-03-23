import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  prompts: defineTable({
    title: v.string(),
    content: v.string(),
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
});
