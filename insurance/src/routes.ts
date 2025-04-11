/**
 * An array of routes that are accessible to all users.
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to the default route
 * @type {string[]}
 */
export const authRoutes = [
  "/login",
  "/register",
];

/**
 * An array of routes that require authentication
 * These routes will redirect unauthenticated users to the login page
 * @type {string[]}
 */
export const protectedRoutes = [
  "/api/policies",
  "/api/policyholders",
  "/overview",
  "/policies",
  "/policyholders",
  "/signout",
];

/**
 * Default route after successful login
 * @type {string[]}
 */
export const defaultRoute = "/overview";

/**
 * Default route after for unauthorized access
 * @type {string[]}
 */
export const unauthorizedRoute = "/login";

/**
 * Prefix for API routes that require authentication
 * @type {string[]}
 */
export const apiAuthPrefix = "/api";