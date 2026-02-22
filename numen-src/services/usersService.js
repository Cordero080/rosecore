// 🔵 PABLO - UI Architect
// usersService.js - Service for user search and discovery

import apiClient from "./apiClient";

/**
 * Search for users by username or name
 * @param {string} query - Search query (username, first name, or last name)
 * @returns {Promise<Array>} - Array of matching users
 */
export const searchUsers = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await apiClient.get("/auth/search/", {
      params: { q: query.trim() },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    // Return empty array on error to allow local search fallback
    return [];
  }
};

/**
 * Get user profile by username
 * @param {string} username - The username to look up
 * @returns {Promise<Object>} - User profile data
 */
export const getUserByUsername = async (username) => {
  try {
    const response = await apiClient.get(`/auth/users/${username}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/**
 * Update current user's profile
 * @param {Object} profileData - { bio, location, website } - all optional
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.patch("/auth/profile/", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export default {
  searchUsers,
  getUserByUsername,
  updateProfile,
};
