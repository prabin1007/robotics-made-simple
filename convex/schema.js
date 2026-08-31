import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  feedback: defineTable({
    rating: v.union(v.literal('useful'), v.literal('needs-work')),
    comment: v.optional(v.string()),
    project: v.string(),
    behaviors: v.string(),
    location: v.string(),
    budget: v.string(),
    recipeId: v.string(),
    matchType: v.string(),
    neededPartsCount: v.number(),
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),
});
