// 🔵 PABLO - Messaging System
// messagesService.js - API calls for direct messages
//
// This service file is the BRIDGE between your React frontend and Django backend.
// It uses apiClient (your Axios instance) which automatically:
//   - Adds the JWT token to every request (Authorization header)
//   - Sets the base URL (http://localhost:8000/api)
//   - Handles token refresh if expired

import apiClient from "./apiClient";

const messagesService = {
  // GET /api/messages/conversations/
  // ─────────────────────────────────────────────────────────────────────────
  // Returns: Array of conversation objects, each with:
  //   - user: { id, username, first_name, last_name }
  //   - last_message: { id, sender, receiver, content, is_read, created_at }
  //   - unread_count: number
  //
  // Backend: MessageViewSet.conversations() in views.py
  // ─────────────────────────────────────────────────────────────────────────

  getConversations: async () => {
    const response = await apiClient.get("/messages/conversations/");
    return response.data;
  },

  getConversation: async (userId) => {
    if (!userId) {
      console.error("getConversation called without userId");
      return [];
    }
    const response = await apiClient.get(`/messages/conversation/${userId}/`);
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/messages/
  // ─────────────────────────────────────────────────────────────────────────
  // Body: { receiver_id: number,
  // content: string }
  // Returns: The created message object
  //
  // Backend automatically sets:
  //   - sender = current authenticated user (from JWT)
  //   - is_read = false
  //   - created_at = now
  // Backend: MessageViewSet.create() via MessageSerializer
  // ─────────────────────────────────────────────────────────────────────────
  sendMessage: async (receiverId, content, replyToStory = null) => {
    const payload = {
      receiver_id: receiverId,
      content,
    };
    // Attach story reference if replying to a story
    if (replyToStory) {
      payload.reply_to_story = replyToStory;
    }
    const response = await apiClient.post("/messages/", payload);
    return response.data;
  },
  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /api/messages/{id}/read/
  // ─────────────────────────────────────────────────────────────────────────
  // Marks a SINGLE message as read
  // Only works if you're the receiver (backend enforces this)
  // Returns: The updated message object
  //
  // Backend: MessageViewSet.read() in views.py
  // ─────────────────────────────────────────────────────────────────────────
  markAsRead: async (messagesId) => {
    const response = await apiClient.patch(`/messages/${messagesId}/read/`);
    return response.data;
  },
  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/messages/read_all/?user_id=X
  // ─────────────────────────────────────────────────────────────────────────
  // Marks ALL unread messages FROM user X as read
  // Use this when opening a conversation (bulk operation)
  // Returns: { marked_read: number } - how many messages were updated
  //
  // Backend: MessageViewSet.read_all() in views.py
  // ─────────────────────────────────────────────────────────────────────────
  markAllAsRead: async (userId) => {
    const response = await apiClient.post(
      `/messages/read_all/?user_id=${userId}`,
    );
    return response.data;
  },
};

export default messagesService;
