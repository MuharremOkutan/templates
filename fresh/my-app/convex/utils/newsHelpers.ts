/**
 * Helper functions for working with news API data
 */
import { Id } from "../_generated/dataModel";

/**
 * Safely extracts a string value from an object, with default value and length limiting
 */
export function safeString(
  obj: any, 
  keys: string[], 
  defaultValue: string = "", 
  maxLength: number = 1000
): string {
  if (!obj) return defaultValue;
  
  for (const key of keys) {
    if (obj[key] && typeof obj[key] === 'string') {
      return obj[key].substring(0, maxLength);
    }
  }
  
  return defaultValue.substring(0, maxLength);
}

/**
 * Safely formats a date from various possible formats to ISO string
 */
export function safeDate(obj: any, keys: string[]): string {
  if (!obj) return new Date().toISOString();
  
  for (const key of keys) {
    if (obj[key]) {
      try {
        return new Date(obj[key]).toISOString();
      } catch (e) {
        console.error(`Failed to parse date from ${key}:`, e);
      }
    }
  }
  
  return new Date().toISOString();
}

/**
 * Safely extracts a string array from an object
 */
export function safeStringArray(
  obj: any, 
  key: string, 
  maxItemLength: number = 100
): string[] {
  if (!obj || !obj[key] || !Array.isArray(obj[key])) {
    return [];
  }
  
  return obj[key]
    .filter((item: any) => typeof item === 'string')
    .map((item: string) => item.substring(0, maxItemLength));
}

/**
 * Safely stringifies an object
 */
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    console.error("Failed to stringify object:", e);
    return JSON.stringify({ error: "Object could not be serialized" });
  }
}

/**
 * Extract all fields from an API item, excluding those that are already in the schema
 */
export function extractDynamicFields(item: any): Record<string, any> {
  if (!item || typeof item !== 'object') {
    return {};
  }

  // Fields that are already in the schema or that we don't want to duplicate
  const standardFields = new Set([
    'title', 'headline', 
    'summary', 'description', 'abstract',
    'source', 
    'publishedAt', 'published', 'date', 'publishDate',
    'category', 'section', 'industry',
    'entities', 'businessContexts',
    'content', 'body', 'fullContent',
    'apiResponse',
    'userId', 'createdAt', 'updatedAt'
  ]);

  // Create a new object with all fields that aren't in the standard fields list
  const dynamicFields: Record<string, any> = {};
  
  for (const key in item) {
    if (!standardFields.has(key)) {
      // Don't include functions or other non-serializable types
      if (typeof item[key] !== 'function' && typeof item[key] !== 'symbol') {
        dynamicFields[key] = item[key];
      }
    }
  }

  return dynamicFields;
}

/**
 * Transform a raw news item to match the schema
 */
export function transformNewsItem(
  item: any, 
  sourceName: string, 
  userId: Id<"users">
): {
  title: string;
  summary: string;
  source: string;
  publishDate: string;
  industry: string;
  entities: string[];
  businessContexts: string[];
  fullContent: string;
  apiResponse: string;
  dynamicFields: Record<string, any>;
  userId: Id<"users">;
  createdAt: number;
  updatedAt: number;
} {
  const now = Date.now();
  
  return {
    title: safeString(item, ['title', 'headline'], 'Untitled', 1000),
    summary: safeString(item, ['summary', 'description', 'abstract'], '', 2000),
    source: safeString(item, ['source.name'], sourceName, 100),
    publishDate: safeDate(item, ['publishedAt', 'published', 'date']),
    industry: safeString(item, ['category', 'section'], 'General', 100),
    entities: safeStringArray(item, 'entities'),
    businessContexts: safeStringArray(item, 'businessContexts'),
    fullContent: safeString(item, ['content', 'body'], '', 10000),
    apiResponse: safeStringify(item),
    dynamicFields: extractDynamicFields(item),
    userId,
    createdAt: now,
    updatedAt: now,
  };
} 