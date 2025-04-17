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
  "/auth/login",
  "/auth/register",
];

/**
 * An array of routes that require authentication
 * These routes will redirect unauthenticated users to the login page
 * @type {string[]}
 */
export const protectedRoutes = [
  "/api/policies",
  "/api/policyholders",
  "/signout",
  "/api",
  "/user-landing"
];

/**
 * An array of routes that require agent/supervisor/admin roles
 * These routes will redirect regular users to the user landing page
 * @type {string[]}
 */
export const dashboardRoutes = [
  "/overview",
  "/policies",
  "/policyholders"
];

/**
 * An array of routes that require admin or supervisor role
 * These routes will redirect users without proper roles to the unauthorized page
 * @type {string[]}
 */
export const adminRoutes = [
  "/administration",
  "/api/administration"
];

/**
 * Default route after successful login
 * @type {string[]}
 */
export const defaultRoute = "/overview";

/**
 * API authentication prefix
 * @type {string}
 */
export const apiAuthPrefix = "/api";

/**
 * Default route after for unauthorized access
 * @type {string}
 */
export const unauthorizedRoute = "/auth/login";