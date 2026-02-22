/**
 * =============================================================================
 * POSTS SERVICE: 
 * postsService is an OBJECT (not a class, not a function)
 It's a collection of async functions that make API calls
 
 * File: frontend/src/services/postsService.js
 * Assigned to: COLIN
 * Responsibility: API calls for posts CRUD
 *
 * Status: IMPLEMENTED ✅
 * =============================================================================
 */
import apiClient from "./apiClient"; // Axios instance with JWT interceptors

const postsService = {
  // GET /api/posts/ => lists all posts (top-level only)
  getAll: async () => {
    const response = await apiClient.get("/posts/"); // Sends GET, token added automatically
    return response.data; // Return just the JSON array, not full axios response
  },
  // GET /api/posts/?username=xxx => lists posts by a specific user
  getByUsername: async (username) => {
    const response = await apiClient.get(`/posts/?username=${username}`);
    return response.data;
  },
  // GET /api/posts/:id/ → single post
  getById: async (id) => {
    const response = await apiClient.get(`/posts/${id}/`); // Template literal inserts id into URL
    return response.data;
  },
  // GET /api/posts/:id/replies/ → get replies for a post
  getReplies: async (id) => {
    const response = await apiClient.get(`/posts/${id}/replies/`);
    return response.data;
  },
  // POST /api/posts/ → create post
  create: async (data) => {
    // data is an object like { content: "text", type: "thought" }
    // For replies, include parent_id: parentPostId
    const response = await apiClient.post("/posts/", data);
    return response.data;
    // Returns the new post object with id, author, timestamps
  },
  // POST reply to a specific post
  createReply: async (parentId, data) => {
    const response = await apiClient.post("/posts/", {
      ...data,
      parent_id: parentId,
    });
    return response.data;
  },
  // POST reply to a comment (with @mention for notifications)
  createCommentReply: async (postId, data) => {
    // data should include: content, mentioned_user_id, mentioned_username, parent_comment_id
    const response = await apiClient.post("/posts/", {
      content: data.content,
      parent_id: postId,
      mentioned_user_id: data.mentioned_user_id,
      mentioned_username: data.mentioned_username,
      reply_to_comment_id: data.parent_comment_id,
      type: "thoughts",
    });
    return response.data;
  },
  // PATCH /api/posts/:id/ → update post (partial update, not full replace)
  update: async (id, data) => {
    // data is an object like { content: "edited text" }
    const response = await apiClient.patch(`/posts/${id}/`, data);
    return response.data; // Returns updated post
  },
  // DELETE /api/posts/:id/ → delete post
  delete: async (id) => {
    await apiClient.delete(`/posts/${id}/`); // No return - DELETE gives 204 No Content
  },
  // POST /api/posts/:id/like/ → like or unlike a post
  // action: 'like' | 'unlike' - explicit action prevents mobile double-tap issues
  like: async (id, action) => {
    const response = await apiClient.post(`/posts/${id}/like/`, { action });
    return response.data; // Returns updated post with new likes_count and is_liked
  },
  // POST /api/posts/:id/share/ → increment share count
  share: async (id) => {
    const response = await apiClient.post(`/posts/${id}/share/`);
    return response.data; // Returns updated post with new shares_count
  },
};

export default postsService;
