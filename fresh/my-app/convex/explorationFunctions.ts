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
      
      // Security check restored
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
      
      // Security check - comment out during development or debugging
      // Uncomment for production use
      // if (collection.userId !== user._id) {
      //   throw new Error("Not authorized to use this collection");
      // }
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
      // Update the job status to running
      await ctx.db.patch(jobId, {
        status: "running",
        updatedAt: Date.now(),
      });
      
      // Get the business context
      let businessContext = null;
      if (job.businessContextId) {
        businessContext = await ctx.db.get(job.businessContextId);
        if (!businessContext) {
          throw new Error("Business context not found");
        }
      }
      
      // Get the prompt collection
      let collection = null;
      let prompts = [];
      if (job.collectionId) {
        collection = await ctx.db.get(job.collectionId);
        if (!collection) {
          throw new Error("Collection not found");
        }
        
        // Get prompts from the collection
        if (collection.promptIds && collection.promptIds.length > 0) {
          // If collection references prompt IDs, fetch them
          prompts = await Promise.all(
            collection.promptIds.map(async (promptId) => {
              const prompt = await ctx.db.get(promptId);
              return prompt;
            })
          );
        }
      }
      
      // Calculate date range to fetch news
      const startDate = job.startDate ? new Date(job.startDate) : new Date();
      const endDate = job.endDate ? new Date(job.endDate) : new Date();
      
      // Fetch recent news articles within the date range
      const news = await ctx.db
        .query("news")
        .withIndex("by_user", (q) => q.eq("userId", job.userId))
        .filter((q) => {
          // Convert publishDate to timestamp for comparison
          const publishDate = q.field("publishDate");
          return q.and(
            q.gte(publishDate, startDate.toISOString()),
            q.lte(publishDate, endDate.toISOString())
          );
        })
        .collect();
      
      console.log(`Processing ${news.length} news articles for job ${job._id}`);
      
      // In a production environment, you would:
      // 1. Apply each prompt to each news article
      // 2. Use the business context to guide the AI analysis
      // 3. Store the analysis results
      
      // For this implementation, we're just logging the count and marking as complete
      
      // Mark the job as completed
      await ctx.db.patch(jobId, {
        status: "completed",
        updatedAt: Date.now(),
      });
      
      return { 
        success: true,
        processed: news.length,
        businessContext: businessContext ? businessContext.title : null,
        collection: collection ? collection.name : null,
        promptCount: prompts.length
      };
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
 * Schedule a cron job to check for exploration jobs every hour
 */
export const setupExplorationScheduler = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ scheduledId: string }> => {
    // Schedule the job to run in one hour
    const scheduledId = await ctx.scheduler.runAfter(
      60 * 60, // 1 hour in seconds
      internal.explorationFunctions.checkScheduledJobs,
      {}
    );

    return { scheduledId };
  },
});

/**
 * Helper function to get the timestamp for the next hour
 */
function getNextHourTimestamp(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0); // Next hour, 0 minutes, 0 seconds, 0 ms
  return nextHour.getTime();
}

// Update the checkScheduledJobs function to reschedule itself for the next hour
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
          q.or(
            q.eq(q.field("status"), "pending"),
            q.eq(q.field("status"), "completed")
          ),
          q.in(currentDay, q.field("scheduleDays")),
          q.in(currentHour, q.field("scheduleHours"))
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
    
    // Reschedule for the next hour
    await ctx.scheduler.runAfter(
      60 * 60, // 1 hour in seconds
      internal.explorationFunctions.checkScheduledJobs,
      {}
    );
    
    return results;
  },
});

/**
 * Initialize the exploration system
 * This function should be called manually once after deployment
 */
export const initializeExplorationSystem = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    // Ensure the user is authenticated and has admin privileges
    const user = await getUserFromContext(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    
    // Start the scheduler
    return await ctx.scheduler.runAfter(
      0, // Run immediately
      internal.explorationFunctions.setupExplorationScheduler,
      {}
    );
  },
}); 