/**
 * Helper functions for working with news API data
 */
import { Id } from "../_generated/dataModel";

// Define the NewsItem type
export interface NewsItem {
  title: string;
  content: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
    url: string;
  };
  apiSourceId: Id<"newsApiSources">;
  userId?: string;
  createdAt?: number;
  article_id: string;
  link: string;
  image_url: string;
  creator: string;
  keywords: string[];
  entities: any[];
  businessContexts: any[];
  language: string;
  sentiment: any;
  categories: string[];
  country: string;
}

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
 * Safely transforms an API news item into a format compatible with our database.
 * Adds validation and error handling.
 */
export const transformNewsItem = (
  item: any,
  apiSourceId: Id<"newsApiSources">
): NewsItem | null => {
  try {
    // Debug the incoming item
    console.log(`Transforming news item:`, safeStringify(item).substring(0, 200) + "...");
    
    // Validate required fields
    if (!item) {
      console.error("Empty news item received");
      return null;
    }
    
    // Extract title with fallbacks
    const title = extractString(item.title || item.headline || item.name || "");
    if (!title) {
      console.error("News item has no title:", safeStringify(item).substring(0, 100));
      return null;
    }
    
    // Extract content with multiple fallbacks
    const content = extractString(
      item.content || 
      item.description || 
      item.summary || 
      item.text || 
      item.body || 
      item.snippet || 
      ""
    );
    
    // Try to get a valid publish date, defaulting to now if not available
    let publishedAt: string;
    try {
      const dateString = item.publishedAt || 
                       item.published_at || 
                       item.pubDate || 
                       item.date || 
                       item.created_at || 
                       new Date().toISOString();
                       
      publishedAt = new Date(dateString).toISOString();
    } catch (e) {
      console.log(`Invalid date format, using current date`);
      publishedAt = new Date().toISOString();
    }
    
    // Extract source information with fallbacks
    const source = {
      id: extractString(
        item.source?.id || 
        item.sourceId || 
        item.source_id || 
        ""
      ),
      name: extractString(
        item.source?.name || 
        item.sourceName || 
        item.source_name || 
        item.source || 
        ""
      ),
      url: extractString(
        item.source?.url || 
        item.sourceUrl || 
        item.source_url || 
        ""
      ),
    };
    
    // Article identifier with fallbacks
    const article_id = extractString(
      item.article_id || 
      item.articleId || 
      item.id || 
      item.article_uuid || 
      item.uuid || 
      ""
    );
    
    // Link/URL with fallbacks
    const link = extractString(
      item.link || 
      item.url || 
      item.article_url || 
      item.web_url || 
      ""
    );
    
    // Image URL with fallbacks
    const image_url = extractString(
      item.image_url || 
      item.imageUrl || 
      item.urlToImage || 
      item.image || 
      item.main_image || 
      (item.media && item.media[0]?.url) || 
      ""
    );
    
    // Creator/author with fallbacks
    const creator = Array.isArray(item.creator) 
      ? item.creator.join(", ") 
      : extractString(
          item.creator || 
          item.author || 
          item.writers || 
          (Array.isArray(item.authors) ? item.authors.join(", ") : item.authors) || 
          ""
        );
    
    // Keywords with proper type handling
    const keywords = extractArray(
      item.keywords || 
      item.tags || 
      item.key_phrases || 
      []
    ).filter(Boolean);
    
    // Return the transformed item
    return {
      title,
      content,
      publishedAt,
      source,
      apiSourceId,
      article_id,
      link,
      image_url,
      creator,
      keywords,
      entities: Array.isArray(item.entities) ? item.entities.filter((e: any) => e) : [],
      businessContexts: item.businessContexts ?? [],
      language: extractString(item.language || item.lang || ""),
      sentiment: item.sentiment ?? null,
      categories: extractArray(item.categories || item.category || []),
      country: extractString(item.country || "")
    };
  } catch (error) {
    console.error("Error transforming news item:", error);
    console.error("Problem item:", safeStringify(item).substring(0, 500));
    return null;
  }
};

/**
 * Helper to safely extract string values
 */
function extractString(value: any): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value && typeof value.toString === 'function') {
    return value.toString().trim();
  }
  return '';
}

/**
 * Helper to safely extract array values
 */
function extractArray(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item.toString === 'function') return item.toString().trim();
      return '';
    }).filter(Boolean);
  }
  if (typeof value === 'string') {
    return [value.trim()];
  }
  return [];
}

/**
 * Transform a raw news item to match the schema
 */
export function transformNewsItemOld(
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
  
  // Additional fields from API
  article_id?: string;
  link?: string;
  keywords?: string[];
  creator?: string[];
  video_url?: string;
  image_url?: string;
  pubDateTZ?: string;
  source_id?: string;
  source_priority?: number;
  source_name?: string;
  source_url?: string;
  source_icon?: string;
  language?: string;
  country?: string[];
  category?: string[];
  ai_tag?: string;
  sentiment?: string;
  sentiment_stats?: string;
  ai_region?: string;
  ai_org?: string;
  duplicate?: boolean;
  
  dynamicFields: Record<string, any>;
  userId: Id<"users">;
  createdAt: number;
  updatedAt: number;
} {
  const now = Date.now();
  
  // Extract all the standard and specific fields from the API response
  return {
    // Base fields
    title: safeString(item, ['title', 'headline'], 'Untitled', 1000),
    summary: safeString(item, ['summary', 'description', 'abstract'], '', 2000),
    source: safeString(item, ['source_name', 'source.name'], sourceName, 100),
    publishDate: safeDate(item, ['publishDate', 'pubDate', 'publishedAt', 'published', 'date']),
    industry: safeString(item, ['industry', 'category', 'section'], 'General', 100),
    entities: typeof item.entities === 'string' ? [item.entities] : 
             Array.isArray(item.entities) ? item.entities.filter((e: any) => e) : [],
    businessContexts: Array.isArray(item.businessContexts) ? item.businessContexts : [],
    fullContent: safeString(item, ['content', 'body', 'fullContent'], '', 10000),
    apiResponse: safeStringify(item),
    
    // Specific fields from the API response
    article_id: item.article_id,
    link: item.link,
    keywords: Array.isArray(item.keywords) ? item.keywords : 
              typeof item.keywords === 'string' ? [item.keywords] : undefined,
    creator: Array.isArray(item.creator) ? item.creator :
             typeof item.creator === 'string' ? [item.creator] : undefined,
    video_url: item.video_url,
    image_url: item.image_url,
    pubDateTZ: item.pubDateTZ,
    source_id: item.source_id,
    source_priority: typeof item.source_priority === 'number' ? item.source_priority : undefined,
    source_name: item.source_name,
    source_url: item.source_url,
    source_icon: item.source_icon,
    language: item.language,
    country: Array.isArray(item.country) ? item.country : 
             typeof item.country === 'string' ? [item.country] : undefined,
    category: Array.isArray(item.category) ? item.category : 
              typeof item.category === 'string' ? [item.category] : undefined,
    ai_tag: item.ai_tag,
    sentiment: item.sentiment,
    sentiment_stats: item.sentiment_stats,
    ai_region: item.ai_region,
    ai_org: item.ai_org,
    duplicate: typeof item.duplicate === 'boolean' ? item.duplicate : undefined,
    
    // Keep any additional fields as dynamic fields
    dynamicFields: extractDynamicFields(item),
    userId,
    createdAt: now,
    updatedAt: now,
  };
} 