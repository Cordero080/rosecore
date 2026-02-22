/**
 * Stories Service
 * API calls for stories CRUD + reactions
 */
import apiClient from "./apiClient";

const storiesService = {
  // GET /api/stories/ - Get all active stories (not expired)
  getAll: async () => {
    const response = await apiClient.get("/stories/");
    return response.data;
  },

  // GET /api/stories/user/:userId/ - Get stories by specific user
  getByUser: async (userId) => {
    const response = await apiClient.get(`/stories/user/${userId}/`);
    return response.data;
  },

  // POST /api/stories/ - Create a new story
  create: async (data) => {
    // data: { media_url, caption?, media_type: 'image'|'video' }
    const response = await apiClient.post("/stories/", data);
    return response.data;
  },

  // DELETE /api/stories/:id/ - Delete your own story
  delete: async (id) => {
    await apiClient.delete(`/stories/${id}/`);
  },

  // POST /api/stories/:id/view/ - Mark story as viewed
  markViewed: async (id) => {
    const response = await apiClient.post(`/stories/${id}/view/`);
    return response.data;
  },

  // POST /api/stories/:id/react/ - React to a story (heart or thunder)
  react: async (id, reactionType) => {
    // reactionType: 'heart' | 'thunder'
    const response = await apiClient.post(`/stories/${id}/react/`, { 
      reaction_type: reactionType 
    });
    return response.data;
  },

  // DELETE /api/stories/:id/react/ - Remove reaction
  removeReaction: async (id) => {
    await apiClient.delete(`/stories/${id}/react/`);
  },
};

export default storiesService;