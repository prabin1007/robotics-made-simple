import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const submit = mutation({
  args: {
    rating: v.union(v.literal('useful'), v.literal('needs-work')),
    comment: v.optional(v.string()),
    project: v.string(),
    behaviors: v.string(),
    location: v.string(),
    budget: v.string(),
    recipeId: v.string(),
    matchType: v.string(),
    neededPartsCount: v.number(),
  },
  handler: async (ctx, args) => {
    const comment = args.comment?.trim();
    if (comment && comment.length > 1000) throw new Error('Comment must be 1,000 characters or fewer.');
    return await ctx.db.insert('feedback', {
      ...args,
      comment: comment || undefined,
      createdAt: Date.now(),
    });
  },
});
