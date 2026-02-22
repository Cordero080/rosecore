import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const listenersRef = useRef({});
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Debug: Log on every render
  console.log('🔧 WebSocketProvider render - token:', !!token, 'user:', user?.username);

  // Connect to WebSocket
  useEffect(() => {
    console.log('🔧 WebSocket useEffect triggered - token:', !!token, 'user:', !!user);
    
    if (!token || !user) {
      console.log('⚠️ No token or user, skipping WebSocket connection');
      // Not logged in - disconnect if connected
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const connect = () => {
      // Always use wss for production
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      const protocol = isLocal ? 'ws:' : 'wss:';
      const host = isLocal ? 'localhost:8000' : 'numeneon-backend.onrender.com';
      
      const wsUrl = `${protocol}//${host}/ws/notifications/?token=${token}`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      console.log('🔑 Token present:', !!token);
      console.log('👤 User:', user?.username);
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📩 WebSocket message:', message);

          // Call all listeners registered for this event type
          const listeners = listenersRef.current[message.type] || [];
          listeners.forEach(callback => callback(message.data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code);
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Reconnecting in ${delay}ms...`);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (token && user) connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    };

    connect();

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
        wsRef.current = null;
      }
    };
  }, [token, user]);

  // Subscribe to events
  const subscribe = (eventType, callback) => {
    if (!listenersRef.current[eventType]) {
      listenersRef.current[eventType] = [];
    }
    listenersRef.current[eventType].push(callback);

    // Return unsubscribe function
    return () => {
      listenersRef.current[eventType] = listenersRef.current[eventType].filter(
        cb => cb !== callback
      );
    };
  };

  const value = {
    isConnected,
    subscribe,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}