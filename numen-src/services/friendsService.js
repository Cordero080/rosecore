/**
 * =============================================================================
 * FRIENDS SERVICE
 * =============================================================================
 *
 * File: frontend/src/services/friendsService.js
 * Assigned to: CRYSTAL
 * Responsibility: API calls for friends system
 *
 * Status: IMPLEMENTED ✅
 * =============================================================================
 */

import apiClient from "./apiClient";

const friendsService = {
  // GET /api/friends/ → list my current friends
  getAll: async () => {
    const response = await apiClient.get("/friends/");
    return response.data;
  },

  // GET /api/friends/requests/ → get pending friend requests
  getPendingRequests: async () => {
    const response = await apiClient.get("/friends/requests/");
    return response.data;
  },

  // POST /api/friends/request/:user_id/ → send friend request to a user
  sendRequest: async (userId) => {
    const response = await apiClient.post(`/friends/request/${userId}/`);
    return response.data;
  },

  // POST /api/friends/accept/:request_id/ → accept incoming request
  acceptRequest: async (requestId) => {
    const response = await apiClient.post(`/friends/accept/${requestId}/`);
    return response.data;
  },

  // POST /api/friends/decline/:request_id/ → decline incoming request
  declineRequest: async (requestId) => {
    const response = await apiClient.post(`/friends/decline/${requestId}/`);
    return response.data;
  },

  // DELETE /api/friends/cancel/:user_id/ → cancel outgoing friend request
  cancelRequest: async (userId) => {
    await apiClient.delete(`/friends/cancel/${userId}/`);
  },

  // DELETE /api/friends/remove/:user_id/ → remove a friend
  remove: async (userId) => {
    await apiClient.delete(`/friends/remove/${userId}/`);
  },

  // GET /api/friends/suggestions/ → get suggested users (not friends, not pending)
  getSuggestions: async () => {
    const response = await apiClient.get("/friends/suggestions/");
    return response.data;
  },
};

export default friendsService;
