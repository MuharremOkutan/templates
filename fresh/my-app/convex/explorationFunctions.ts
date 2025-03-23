import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getUserFromContext } from "./authUtils";

/**
 * List all exploration jobs for the current user
 */
export const listExplorationJobs = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserFromContext(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const jobs = await ctx.db
      .query("explorationJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return jobs;
  },
});

/**
 * Get a specific exploration job by ID
 */
export const getExplorationJob = query({
  args: {
    jobId: v.id("explorationJobs"),
  },
  handler: async (ctx, { jobId }) => {
    const user = await getUserFromContext(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== user._id) {
      throw new Error("Not authorized to access this job");
    }

    return job;
  },
});

/**
 * Create a new exploration job
 */
export const createExplorationJob = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    businessContextId: v.optional(v.id("businessContexts")),
    collectionId: v.optional(v.id("collections")),
    startDate: v.optional(v.any()), // Date object that will be converted to ISO string
    endDate: v.optional(v.any()), // Date object that will be converted to ISO string
    scheduleDays: v.array(v.number()),
    scheduleHours: v.array(v.number()),
  },
  handler: async (
    ctx,
    {
      name,
      description,
      businessContextId,
      collectionId,
      startDate,
      endDate,
      scheduleDays,
      scheduleHours,
    }
  ) => {
    const user = await getUserFromContext(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Validate the business context if provided
    if (businessContextId) {
      const context = await ctx.db.get(businessContextId);
      if (!context) {
        throw new Error("Business context not found");
      }
      if (context.userId !== user._id) {
        throw new Error("Not authorized to use this business context");
      }
    }

    // Validate the collection if provided
    if (collectionId) {
      const collection = await ctx.db.get(collectionId);
      if (!collection) {
        throw new Error("Collection not found");
      }
      if (collection.userId !== user._id) {
        throw new Error("Not authorized to use this collection");
      }
    }

    // Convert Date objects to ISO strings for storage
    const startDateIso = startDate ? new Date(startDate).toISOString() : undefined;
    const endDateIso = endDate ? new Date(endDate).toISOString() : undefined;

    const jobId = await ctx.db.insert("explorationJobs", {
      name,
      description,
      businessContextId,
      collectionId,
      startDate: startDateIso,
      endDate: endDateIso,
      scheduleDays,
      scheduleHours,
      status: "pending",
      userId: user._id,
      createdAt: Date.now(),
    });

    return jobId;
  },
});

/**
 * Update an existing exploration job
 */
export const updateExplorationJob = mutation({
  args: {
    jobId: v.id("explorationJobs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    businessContextId: v.optional(v.id("businessContexts")),
    collectionId: v.optional(v.id("collections")),
    startDate: v.optional(v.any()),
    endDate: v.optional(v.any()),
    scheduleDays: v.optional(v.array(v.number())),
    scheduleHours: v.optional(v.array(v.number())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...updates } = args;
    const user = await getUserFromContext(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== user._id) {
      throw new Error("Not authorized to update this job");
    }

    // Convert Date objects to ISO strings for storage
    let updatedFields: any = { ...updates };
    if (updates.startDate) {
      updatedFields.startDate = new Date(updates.startDate).toISOString();
    }
    if (updates.endDate) {
      updatedFields.endDate = new Date(updates.endDate).toISOString();
    }

    // Add updatedAt timestamp
    updatedFields.updatedAt = Date.now();

    await ctx.db.patch(jobId, updatedFields);
    return jobId;
  },
});

/**
 * Delete an exploration job
 */
export const deleteExplorationJob = mutation({
  args: {
    jobId: v.id("explorationJobs"),
  },
  handler: async (ctx, { jobId }) => {
    const user = await getUserFromContext(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== user._id) {
      throw new Error("Not authorized to delete this job");
    }

    await ctx.db.delete(jobId);
    return jobId;
  },
});

/**
 * Manually trigger an exploration job to run
 */
export const triggerExplorationJob = mutation({
  args: {
    jobId: v.id("explorationJobs"),
  },
  handler: async (ctx, { jobId }): Promise<{ jobId: Id<"explorationJobs">; scheduledActionId: string }> => {
    const user = await getUserFromContext(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== user._id) {
      throw new Error("Not authorized to trigger this job");
    }

    // Update the job status to "running" and set the lastRun timestamp
    await ctx.db.patch(jobId, {
      status: "running",
      lastRun: Date.now(),
      updatedAt: Date.now(),
    });

    // Start the job processing in the background
    // This would typically call an action to handle the processing
    // For now, we'll just update the status to "completed" after a brief delay
    // In a real implementation, you would process the news items using the business context and prompts
    
    // Schedule the job to run
    const scheduledActionId: string = await ctx.scheduler.runAfter(
      5, // Run after 5 seconds for demonstration 
      internal.explorationFunctions.processExplorationJob,
      { jobId }
    );

    return { jobId, scheduledActionId };
  },
});

/**
 * Process an exploration job (internal function)
 * This would be triggered by the scheduler
 */
export const processExplorationJob = internalMutation({
  args: {
    jobId: v.id("explorationJobs"),
  },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    if (!job) {
      console.error("Job not found:", jobId);
      return { success: false, error: "Job not found" };
    }

    try {
      // Get the business context (not used in this implementation but kept for future use)
      if (job.businessContextId) {
        await ctx.db.get(job.businessContextId);
      }
      
      // Get the prompt collection (not used in this implementation but kept for future use)
      if (job.collectionId) {
        await ctx.db.get(job.collectionId);
      }
      
      // In a real implementation, you would:
      // 1. Fetch news within the date range
      // 2. Apply the business context and prompts to analyze the news
      // 3. Store the results
      
      // For demonstration, we'll just mark the job as completed
      await ctx.db.patch(jobId, {
        status: "completed",
        updatedAt: Date.now(),
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error processing exploration job:", error);
      
      // Mark the job as failed
      await ctx.db.patch(jobId, {
        status: "failed",
        updatedAt: Date.now(),
      });
      
      return { success: false, error: String(error) };
    }
  },
});

/**
 * Check for scheduled jobs that need to run
 * This would be called by a cron job or scheduler
 */
export const checkScheduledJobs = internalMutation({
  args: {},
  handler: async (ctx): Promise<Array<{ jobId: Id<"explorationJobs">; success: boolean; scheduledActionId?: string; error?: string }>> => {
    const now = new Date();
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentHour = now.getHours(); // 0-23
    
    // Find all jobs that should run at this time
    const jobs = await ctx.db
      .query("explorationJobs")
      .filter((q: any) => 
        q.and(
          q.eq(q.field("status"), "pending"),
          q.includes(q.field("scheduleDays"), currentDay),
          q.includes(q.field("scheduleHours"), currentHour)
        )
      )
      .collect();
    
    // Trigger each job
    const results: Array<{ jobId: Id<"explorationJobs">; success: boolean; scheduledActionId?: string; error?: string }> = await Promise.all(
      jobs.map(async (job) => {
        try {
          await ctx.db.patch(job._id, {
            status: "running",
            lastRun: Date.now(),
            updatedAt: Date.now(),
          });
          
          // Schedule the job to run
          const scheduledActionId: string = await ctx.scheduler.runAfter(
            0, // Run immediately
            internal.explorationFunctions.processExplorationJob,
            { jobId: job._id }
          );
          
          return { jobId: job._id, success: true, scheduledActionId };
        } catch (error) {
          console.error(`Error scheduling job ${job._id}:`, error);
          return { jobId: job._id, success: false, error: String(error) };
        }
      })
    );
    
    return results;
  },
}); 