import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add authentication routes
auth.addHttpRoutes(http);

// Add a custom route for fetching external APIs if needed
// http.route({
//   path: "/api/news",
//   method: "GET",
//   handler: async (ctx, request) => {
//     // Custom HTTP handler if needed
//   }
// });

export default http;
