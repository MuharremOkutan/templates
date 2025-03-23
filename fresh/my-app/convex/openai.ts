import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUser, getUserFromAction } from "./authUtils";

// Add Message type for API interactions
type Message = {
  role: string;
  content: string;
};

// Helper function to call OpenAI API
async function callOpenAIAPI({
  prompt,
  model,
  apiKey
}: {
  prompt: string | Array<{ role: string; content: string }>;
  model: string;
  apiKey: string;
}) {
  try {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    
    // Prepare messages array based on prompt type
    const messages = typeof prompt === 'string' 
      ? [{ role: "user", content: prompt }] 
      : prompt;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}${
          errorData ? `: ${JSON.stringify(errorData)}` : ""
        }`
      );
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || "",
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// Function to test a prompt with OpenAI
export const testPrompt = action({
  args: {
    prompt: v.string(),
    model: v.string(),
    apiKey: v.string()
  },
  handler: async (ctx, args) => {
    const { prompt, model, apiKey } = args;
    
    try {
      const result = await callOpenAIAPI({
        prompt,
        model,
        apiKey
      });
      
      return {
        success: true,
        response: result.content,
        usage: result.usage,
        model: model
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

// Function to improve business context description using OpenAI
export const improveBusinessContext = action({
  args: {
    description: v.string(),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Optionally get the user if needed
      // const user = await getUserFromAction(ctx);
      
      const { description, apiKey } = args;
      const title = args.title || "Business Context";
      const model = args.model || "gpt-3.5-turbo";
      
      // Create a prompt to improve the business context
      const systemPrompt = `You are an expert business consultant. Your task is to improve the provided business context description, making it more comprehensive, professional, and insightful. Maintain the same general topic and intent, but enhance it with relevant business insights, clarity, and proper structure. Return only the improved description without any additional explanations or meta-commentary.`;
      
      const userPrompt = `# Business Context Title\n${title}\n\n# Current Description\n${description}\n\n# Instructions\nPlease improve this business context description to make it more comprehensive, professional, and insightful. Maintain the same general topic and intent, but enhance it with relevant business insights, clarity, and proper structure.`;
      
      // Call OpenAI API
      const result = await callOpenAIAPI({
        prompt: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model,
        apiKey
      });
      
      // Return the improved description
      return {
        success: true,
        content: result.content,
        usage: result.usage
      };
    } catch (error) {
      console.error("Error improving business context:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred"
      };
    }
  },
});

// Simple ping function to check if Convex is working
export const ping = query({
  handler: async (ctx) => {
    return {
      status: "ok",
      timestamp: Date.now()
    };
  },
});

// Test connection to Convex
export const testConnection = query({
  handler: async (ctx) => {
    return {
      status: "connected",
      timestamp: Date.now()
    };
  },
}); 