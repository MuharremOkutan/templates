/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as authUtils from "../authUtils.js";
import type * as businessContextFunctions from "../businessContextFunctions.js";
import type * as fetchNews from "../fetchNews.js";
import type * as http from "../http.js";
import type * as myFunctions from "../myFunctions.js";
import type * as news from "../news.js";
import type * as openai from "../openai.js";
import type * as promptFunctions from "../promptFunctions.js";
import type * as utils_newsHelpers from "../utils/newsHelpers.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authUtils: typeof authUtils;
  businessContextFunctions: typeof businessContextFunctions;
  fetchNews: typeof fetchNews;
  http: typeof http;
  myFunctions: typeof myFunctions;
  news: typeof news;
  openai: typeof openai;
  promptFunctions: typeof promptFunctions;
  "utils/newsHelpers": typeof utils_newsHelpers;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
