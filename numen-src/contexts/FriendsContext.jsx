/**
                FRIENDS CONTEXT
 ====================================================
 * 
 * File: frontend/src/contexts/FriendsContext.jsx
 * Assigned to: CRYSTAL
 * Responsibility: Global friends state management
 * 
 * Status: UPDATED WITH WEBSOCKETS 
 
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import friendsService from '@services/friendsService';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

const FriendsContext = createContext(null);

export const FriendsProvider = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { subscribe } = useWebSocket();
  
  // STATE
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: State for toast notifications
  const [friendAcceptedToast, setFriendAcceptedToast] = useState(null);

  // FETCH WHEN USER LOGS IN
  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (user) {
      fetchFriends();
    } else {
      setFriends([]);
      setPendingRequests([]);
    }
  }, [user, authLoading]);

  // ✨ WEBSOCKET: Listen for friend request events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribe('friend_request', (data) => {
      console.log('📩 New friend request from:', data.from_user.username);
      
      // Add the new request to pending list
      setPendingRequests(prev => [
        {
          id: data.request_id,
          from_user: data.from_user,
          created_at: new Date().toISOString(),
        },
        ...prev
      ]);
    });

    return unsubscribe;
  }, [user, subscribe]);

  // ✨ WEBSOCKET: Listen for friend accepted events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribe('friend_accepted', (data) => {
      console.log('📩 Friend request accepted by:', data.friend.username);
      
      // Add the new friend to friends list
      setFriends(prev => [...prev, data.friend]);
      
      // Trigger toast notification
      setFriendAcceptedToast({
        username: data.friend.username,
        firstName: data.friend.first_name,
        lastName: data.friend.last_name,
      });
      
      // Clear toast after 5 seconds
      setTimeout(() => {
        setFriendAcceptedToast(null);
      }, 5000);
    });

    return unsubscribe;
  }, [user, subscribe]);

  // FETCH FRIENDS LIST
  const fetchFriends = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [friendsData, pendingData] = await Promise.all([
        friendsService.getAll(),
        friendsService.getPendingRequests(),
      ]);
      setFriends(friendsData);
      setPendingRequests(pendingData);
    } catch (err) {
      console.error('fetchFriends error:', err);
      setError(err.response?.data?.detail || 'Failed to fetch friends');
    } finally {
      setIsLoading(false);
    }
  };

  // SEND FRIEND REQUEST
  const sendRequest = async (userId) => {
    try {
      await friendsService.sendRequest(userId);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Failed to send request' 
      };
    }
  };

  // CANCEL OUTGOING FRIEND REQUEST
  const cancelRequest = async (userId) => {
    try {
      await friendsService.cancelRequest(userId);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Failed to cancel request' 
      };
    }
  };

  // ACCEPT REQUEST
  const acceptRequest = async (requestId) => {
    try {
      const newFriend = await friendsService.acceptRequest(requestId);
      setFriends(prev => [...prev, newFriend]);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Failed to accept request' 
      };
    }
  };

  // DECLINE REQUEST
  const declineRequest = async (requestId) => {
    try {
      await friendsService.declineRequest(requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Failed to decline request' 
      };
    }
  };

  // REMOVE FRIEND
  const removeFriend = async (userId) => {
    try {
      await friendsService.remove(userId);
      setFriends(prev => prev.filter(friend => friend.id !== userId));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Failed to remove friend' 
      };
    }
  };

  return (
    <FriendsContext.Provider
      value={{
        // State
        friends,
        pendingRequests,
        isLoading,
        error,
        friendAcceptedToast,
        // Actions
        fetchFriends,
        sendRequest,
        cancelRequest,
        acceptRequest,
        declineRequest,
        removeFriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

export default FriendsContext;