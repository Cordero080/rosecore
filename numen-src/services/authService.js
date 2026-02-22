/**
 * =============================================================================
 * AUTH SERVICE - TODO: NATALIA
 * =============================================================================
 * File: frontend/src/services/authService.js
 * Assigned to: NATALIA
 * Status: TODO 🟡
 * Pattern: AuthContext → authService → apiClient → backend
 *
 * REFERENCE: See branch 'pablo-working-backup' for working implementation
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 * - Wraps API calls related to authentication
 * - Used by AuthContext (or can be used directly)
 * - All calls go through apiClient which adds JWT token header
 *
 * =============================================================================
 * API ENDPOINTS:
 * =============================================================================
 *
 * POST /api/auth/login/     - Login with { email, password }
 *                             Returns: { access: "token", refresh: "token" }
 *
 * POST /api/auth/signup/    - Create account with { username, email, password }
 *                             Returns: New user data
 *
 * GET  /api/auth/me/        - Get current user info (requires auth)
 *                             Returns: User object with profile
 *
 * PUT  /api/auth/profile/:id/ - Update profile with { bio, avatar, etc. }
 *                             Returns: Updated profile
 *
 * POST /api/auth/token/refresh/ - Refresh access token
 *                             Body: { refresh: "token" }
 *                             Returns: { access: "new_token" }
 *
 * =============================================================================
 */

// authService - API wrapper for authentication endpoints

//Pattern: AuthContext → authService → apiClient → backend
//All calls go through apiClient which adds JWT token header automatically.

import apiClient from "./apiClient";

const authService = {
  login: async (email, password) => {
    // TODO: Use apiClient.post() to /auth/login/ with { email, password }
    const responce = await apiClient.post("/auth/login/", { email, password });
    // apiClient returns data directly through interceptors or
    return responce.data; // return data from response
  },

  signup: async (userData) => {
    // TODO: Use apiClient.post() to /auth/signup/ with userData
    // post new user registration data
    const responce = await apiClient.post("/auth/signup/", userData);
    return responce.data; // return data from response
  },

  getCurrentUser: async () => {
    // TODO: Use apiClient.get() to /auth/me/
    const responce = await apiClient.get("/auth/me/"); // fetch user specific data
    return responce.data; // return data from response
  },

  updateProfile: async (profileId, profileData) => {
    // TODO: Use apiClient.put() to /auth/profile/${profileId}/ with profileData
    const responce = await apiClient.put(
      `/auth/profile/${profileId}/`,
      profileData,
    );
    return responce.data; // return data from response
  },

  refreshToken: async (refreshToken) => {
    // TODO: Use apiClient.post() to /auth/token/refresh/ with { refresh: refreshToken }
    // exchange refresh token for new access token
    const responce = await apiClient.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });
    return responce.data; // return data from response
  },

  logout: () => {
    // Clear tokens from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};
export default authService;
