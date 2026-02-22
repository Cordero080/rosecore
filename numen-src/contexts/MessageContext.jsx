/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    [ ARCHITECTURAL SIGNATURE ]                               ║
 * ║   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀   ║
 * ║   COGNITIVE ORCHESTRATION LAYER - MESSAGING v1.0                             ║
 * ║   ─────────────────────────────────────────────────────────────────────────  ║
 * ║                                                                              ║
 * ║   Designed & Authored by: Pablo Cordero                                      ║
 * ║                                                                              ║
 * ║   This module implements real-time messaging state management with           ║
 * ║   WebSocket integration and intelligent polling fallback.                    ║
 * ║   Logic belongs to the creator.                                              ║
 * ║                                                                              ║
 * ║   ⚠️  NOTICE: Unauthorized replication or commercial use is prohibited       ║
 * ║       under CC BY-NC-ND 4.0                                                  ║
 * ║                                                                              ║
 * ║   © 2026 NUMENEON Contributors. All Rights Reserved.                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// 🔵 PABLO - UI Architect
// MessageContext.jsx - Shared state for messaging system (API-connected)
//
// UPDATED WITH WEBSOCKETS + POLLING FALLBACK
// Uses WebSockets when available, falls back to polling when not connected

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useWebSocket } from "./WebSocketContext";
import messagesService from "@services/messagesService";

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { subscribe, isConnected } = useWebSocket();

  // Modal visibility
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Conversations list from API
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Currently selected conversation
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  
  // NEW: Store user info for new conversations (before any messages exist)
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);

  // NEW: Notification state for new messages
  const [newMessageNotification, setNewMessageNotification] = useState(null);

  // Polling interval ref
  const pollingIntervalRef = useRef(null);

  // Computed: Total unread message count across all conversations
  const unreadMessageCount = conversations.reduce(
    (total, conv) => total + (conv.unread_count || 0), 
    0
  );

  // Fetch conversations when user logs in, clear on logout
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
    } else {
      setConversations([]);
      setSelectedUserId(null);
      setSelectedMessages([]);
    }
  }, [isAuthenticated, user]);

  // ✨ WEBSOCKET: Listen for new message events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribe('new_message', (data) => {
      // Only notify if the logged-in user is the recipient, not the sender
      if (user.id === data.sender.id) return;

      const senderId = data.sender.id;

      // If this is the currently open conversation, add message immediately
      if (selectedUserId === senderId) {
        setSelectedMessages(prev => [...prev, {
          id: data.id,
          sender: data.sender,
          content: data.content,
          created_at: data.created_at,
          is_read: false,
        }]);
      }

      // Refresh conversations to update last_message and unread count
      fetchConversations();

      // Show notification (unless it's the currently open conversation)
      if (selectedUserId !== senderId) {
        setNewMessageNotification({
          senderId: senderId,
          senderUsername: data.sender.username,
          content: data.content,
        });

        // Clear notification after 5 seconds
        setTimeout(() => {
          setNewMessageNotification(null);
        }, 5000);
      }
    });

    return unsubscribe;
  }, [user, subscribe, selectedUserId]);

  // 🔄 POLLING FALLBACK: When WebSocket is not connected, poll for new messages
  useEffect(() => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Only poll when user is authenticated AND WebSocket is NOT connected
    if (isAuthenticated && user && !isConnected) {
      console.log('📡 WebSocket not connected, starting message polling...');
      
      // Poll every 5 seconds for conversations (background)
      pollingIntervalRef.current = setInterval(async () => {
        // Always refresh conversations list for unread badge
        await fetchConversations();
        
        // If modal is open and viewing a conversation, refresh messages too
        if (isMessageModalOpen && selectedUserId) {
          try {
            const messages = await messagesService.getConversation(selectedUserId);
            setSelectedMessages(messages || []);
          } catch (err) {
            console.error('Polling: Failed to fetch messages:', err);
          }
        }
      }, 5000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, isConnected, isMessageModalOpen, selectedUserId]);

  // GET /api/messages/conversations/ - Load all conversations
  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await messagesService.getConversations();
      
      // 🔧 FRONTEND FIX: Recalculate unread count to exclude messages WE sent
      // Backend bug: unread_count includes messages the user sent
      const fixedData = data.map(conv => {
        // If last message is from US, we shouldn't count it as unread
        const lastMsgFromUs = conv.last_message?.sender?.id === user?.id;
        
        // If the backend says unread but last message is from us, it's wrong
        // Set to 0 (we can't know the true count without all messages)
        const correctedUnread = lastMsgFromUs ? 0 : (conv.unread_count || 0);
        
        return {
          ...conv,
          unread_count: correctedUnread,
        };
      });
      
      setConversations(fixedData);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch conversations");
      console.error("Failed to fetch conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // GET /api/messages/conversation/?user_id=X - Load messages for one conversation
  const fetchConversation = async (userId) => {
    try {
      const messages = await messagesService.getConversation(userId);
      setSelectedMessages(messages);
      setSelectedUserId(userId);
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  };

  // Open the messages modal
  const openMessages = async (targetUser = null) => {
    if (targetUser) {
      // SET USER INFO FIRST - before opening modal!
      // This ensures the header shows immediately
      const userInfo = {
        id: targetUser.id,
        username: targetUser.username,
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
        displayName: targetUser.displayName || targetUser.display_name || 
          (targetUser.first_name && targetUser.last_name 
            ? `${targetUser.first_name} ${targetUser.last_name}` 
            : targetUser.username),
      };
      
      console.log('📬 Opening messages with user:', userInfo);
      
      // Set ALL user state BEFORE opening modal
      setSelectedUserInfo(userInfo);
      setSelectedUserId(targetUser.id);
      setSelectedMessages([]);
      
      // NOW open the modal - user info is already set
      setIsMessageModalOpen(true);
      
      // Try to fetch existing messages (may return empty for new conversations)
      try {
        const messages = await messagesService.getConversation(targetUser.id);
        setSelectedMessages(messages || []);
      } catch (err) {
        // No existing conversation - that's fine, we'll start fresh
        setSelectedMessages([]);
      }
    } else {
      // No target user - just open modal
      setIsMessageModalOpen(true);
      
      if (conversations.length > 0 && !selectedUserId) {
        await fetchConversation(conversations[0].user.id);
      }
    }
  };

  const closeMessages = () => {
    setIsMessageModalOpen(false);
  };

  // Select a conversation and mark as read
  const selectConversation = async (userId, userObj = null) => {
    // If userObj provided, set it immediately for header display
    if (userObj) {
      setSelectedUserInfo({
        id: userObj.id,
        username: userObj.username,
        first_name: userObj.first_name,
        last_name: userObj.last_name,
        displayName: userObj.displayName || userObj.display_name ||
          (userObj.first_name && userObj.last_name 
            ? `${userObj.first_name} ${userObj.last_name}` 
            : userObj.username),
      });
    } else {
      // Try to find user info from conversations list
      const conv = conversations.find(c => c.user?.id === userId);
      if (conv?.user) {
        setSelectedUserInfo({
          id: conv.user.id,
          username: conv.user.username,
          first_name: conv.user.first_name,
          last_name: conv.user.last_name,
          displayName: conv.user.displayName || 
            (conv.user.first_name && conv.user.last_name 
              ? `${conv.user.first_name} ${conv.user.last_name}` 
              : conv.user.username),
        });
      }
    }
    // Clear notification for this sender if present
    if (newMessageNotification && newMessageNotification.senderId === userId) {
      setNewMessageNotification(null);
    }
    await fetchConversation(userId);
    try {
      await messagesService.markAllAsRead(userId);
      fetchConversations();
    } catch {
      // Error intentionally ignored
    }
  };

  // POST /api/messages/ - Send a message
  // replyToStory: optional story ID when replying to a story
  const sendMessage = async (text, replyToStory = null) => {
    if (!text.trim() || !selectedUserId) return { success: false };

    // Create optimistic message to show immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender: { 
        id: user.id, 
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      content: text.trim(),
      created_at: new Date().toISOString(),
      is_read: true,
      _pending: true, // Flag to show sending state
      story: replyToStory ? { id: replyToStory, is_expired: false } : null, // Optimistic story ref
    };

    // 1. Immediately add to UI (optimistic update)
    setSelectedMessages((prev) => [...prev, optimisticMessage]);

    try {
      // 2. Send to backend
      const newMessage = await messagesService.sendMessage(
        selectedUserId,
        text.trim(),
        replyToStory
      );

      // 3. Replace temp message with real one from server
      setSelectedMessages((prev) => 
        prev.map((msg) => msg.id === tempId ? newMessage : msg)
      );

      // Refresh conversations to update last_message preview
      fetchConversations();

      return { success: true };
    } catch (err) {
      console.error("Failed to send message:", err);
      
      // Remove the optimistic message on failure
      setSelectedMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      
      return {
        success: false,
        error: err.response?.data?.detail || "Failed to send",
      };
    }
  };

  // Find the conversation object for the currently selected user
  const getSelectedConversation = () => {
    // First check if there's an existing conversation
    const existing = conversations.find((c) => c.user.id === selectedUserId);
    if (existing) return existing;
    
    // If no existing conversation but we have user info, create a fake conversation object
    // This allows the UI to display properly for new conversations
    if (selectedUserId && selectedUserInfo) {
      return {
        user: selectedUserInfo,
        messages: selectedMessages,
        last_message: null,
      };
    }
    return null;
  };

  // Helper: Build display name from user object
  const getDisplayName = (userObj) => {
    if (!userObj) return "Unknown";
    if (userObj.first_name && userObj.last_name) {
      return `${userObj.first_name} ${userObj.last_name}`;
    }
    return userObj.username;
  };

  // Helper: Get initials for avatar display
  const getInitials = (userObj) => {
    if (!userObj) return "??";
    if (userObj.first_name && userObj.last_name) {
      return `${userObj.first_name[0]}${userObj.last_name[0]}`.toUpperCase();
    }
    return userObj.username.slice(0, 2).toUpperCase();
  };

  return (
    <MessageContext.Provider
      value={{
        // State
        isMessageModalOpen,
        isLoading,
        error,
        conversations,
        selectedUserId,
        selectedMessages,
        selectedConversation: getSelectedConversation(),
        newMessageNotification,
        unreadMessageCount,

        // Actions
        openMessages,
        closeMessages,
        selectConversation,
        sendMessage,
        fetchConversations,

        // Helpers
        getDisplayName,
        getInitials,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
}