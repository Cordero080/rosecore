// 🔵 PABLO - UI Architect
// MessageModal.jsx - Full-screen messaging modal with blurred backdrop
//
// This component now:
// 1. Uses MessageContext for state (conversations, messages)
// 2. Clicking a conversation in the sidebar switches the active chat
// 3. Typing and clicking send actually adds messages
// 4. Shows real messages from context state

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MinimizeIcon, MaximizeIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon, MessageBubbleIcon, PlusIcon } from '@assets/icons';
import { useMessages } from '@contexts/MessageContext';
import usersService from '@services/usersService';
import './MessageModal.scss';

// 🔵 Helper: Format relative time (e.g., "2m", "1h", "3d")
const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

// 🔵 Helper: Format message timestamp (e.g., "2:30 PM")
const formatMessageTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// 🔵 Helper: Get initials from display name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name[0];
};

function MessageModal({ onClose }) {
  const navigate = useNavigate();
  
  // 🔵 Get state and actions from context
  const { 
    conversations, 
    selectedUserId,
    selectedMessages,
    selectedConversation,
    selectConversation, 
    sendMessage,
    openMessages
  } = useMessages();
  
  // 🔵 Local state for the text input
  const [messageText, setMessageText] = useState('');
  
  // 🔵 Local state for search filtering
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🔵 NEW MESSAGE MODE - search for any user
  const [isNewMessageMode, setIsNewMessageMode] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 🔵 Mobile view state - 'list' shows conversations, 'chat' shows the chat
  const [mobileView, setMobileView] = useState('list');
  
  // 🔵 Fullscreen mode state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 🔵 Ref for scrolling to bottom of messages
  const messagesEndRef = useRef(null);
  
  // 🔵 Ref for composer - used for scroll-into-view on focus (browser keyboard fix)
  const composerRef = useRef(null);
  
  // 🔵 Handle textarea focus - scroll composer into view for browser keyboard
  const handleTextareaFocus = () => {
    // Delay to wait for keyboard animation
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  };
  
  // 🔵 Switch to chat view when a conversation is selected (from profile/nav)
  useEffect(() => {
    if (selectedConversation && selectedUserId) {
      setMobileView('chat');
    }
  }, [selectedConversation, selectedUserId]);
  
  // 🔵 Scroll to bottom when messages change
  useEffect(() => {
    // Small delay to ensure DOM has updated with new message
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedMessages]);
  
  // 🔵 Calculate charge level (0-4) based on message length
  // This creates the "charging up" visual effect on the send button
  const getChargeLevel = () => {
    const len = messageText.length;
    if (len === 0) return 0;
    if (len < 10) return 1;
    if (len < 30) return 2;
    if (len < 60) return 3;
    return 4; // Fully charged
  };
  
  // 🔵 Handle sending a message
  const handleSend = () => {
    if (!messageText.trim()) return;
    
    // Call context function to add message
    sendMessage(messageText);
    
    // Clear the input
    setMessageText('');
  };
  
  // 🔵 Handle Enter key to send (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // 🔵 Filter conversations based on search query
  const filteredConversations = (conversations || []).filter((conv) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Match by display name or name
    const displayName = conv.user?.displayName || conv.user?.first_name || conv.user?.username || '';
    if (displayName.toLowerCase().includes(query)) return true;
    
    // Match by username
    if (conv.user?.username?.toLowerCase().includes(query)) return true;
    
    // Match by last message content
    if (conv.last_message?.content?.toLowerCase().includes(query)) return true;
    
    return false;
  });
  
  // 🔵 Handle user search for new message mode
  const handleUserSearch = async (query) => {
    setUserSearchQuery(query);
    if (query.trim().length < 2) {
      setUserSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await usersService.searchUsers(query);
      setUserSearchResults(results || []);
    } catch (err) {
      console.error('User search failed:', err);
      setUserSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // 🔵 Handle selecting a user from search results (new conversation)
  const handleSelectUser = (user) => {
    // Create proper user object for openMessages
    const targetUser = {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture
    };
    
    // Use openMessages to set up the conversation
    openMessages(targetUser);
    
    // Reset new message mode
    setIsNewMessageMode(false);
    setUserSearchQuery('');
    setUserSearchResults([]);
    setMobileView('chat');
  };
  
  return (
    <div className="message-modal-overlay" onClick={onClose}>
      <div className={`message-modal ${isFullscreen ? 'fullscreen' : ''} ${mobileView === 'chat' ? 'mobile-chat-view' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="message-modal-header">
          <h2 className="message-modal-title">Messages</h2>
          <div className="modal-header-actions">
            <button 
              className="fullscreen-btn" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <MinimizeIcon size={20} />
              ) : (
                <MaximizeIcon size={20} />
              )}
            </button>
            <button className="close-btn-glow" onClick={onClose}>
              <CloseIcon size={24} />
            </button>
          </div>
        </div>

        {/* Body - Two column layout */}
        <div className="message-modal-body">
          {/* Left: Conversations List */}
          <div className={`message-conversations ${mobileView === 'list' ? 'show' : ''}`}>
            {/* Mobile title row */}
            <div className="conversations-title-row">
              <h2 className="conversations-title">Messages</h2>
              <button className="conversations-close-btn" onClick={onClose}>
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="conversations-header">
              {isNewMessageMode ? (
                <>
                  <div className="conversations-search-wrapper">
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="conversations-search"
                      value={userSearchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsNewMessageMode(false);
                          setUserSearchQuery('');
                          setUserSearchResults([]);
                        }
                      }}
                      autoFocus
                    />
                    <button 
                      className="conversations-search-clear"
                      onClick={() => {
                        setIsNewMessageMode(false);
                        setUserSearchQuery('');
                        setUserSearchResults([]);
                      }}
                      title="Cancel"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="conversations-search-wrapper">
                    <input 
                      type="text" 
                      placeholder="Search conversations..." 
                      className="conversations-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setSearchQuery('');
                      }}
                    />
                    {searchQuery && (
                      <button 
                        className="conversations-search-clear"
                        onClick={() => setSearchQuery('')}
                        title="Clear search"
                      >
                        <CloseIcon size={14} />
                      </button>
                    )}
                  </div>
                  <button 
                    className="new-message-btn"
                    onClick={() => setIsNewMessageMode(true)}
                    title="New message"
                  >
                    <PlusIcon size={18} />
                  </button>
                </>
              )}
            </div>
            <div className="conversations-list">
              {/* 🔵 NEW MESSAGE MODE: Show user search results */}
              {isNewMessageMode ? (
                <>
                  {isSearching && (
                    <div className="conversations-empty">
                      <p>Searching...</p>
                    </div>
                  )}
                  {!isSearching && userSearchResults.map((user) => {
                    const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown';
                    return (
                      <div 
                        key={user.id}
                        className="conversation-item"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="conversation-avatar">
                          <span className="initial-1">{getInitials(displayName)[0]}</span>
                          {getInitials(displayName).length > 1 && (
                            <span className="initial-2">{getInitials(displayName)[1]}</span>
                          )}
                        </div>
                        <div className="conversation-info">
                          <span className="conversation-name">{displayName}</span>
                          <span className="conversation-preview">@{user.username}</span>
                        </div>
                      </div>
                    );
                  })}
                  {!isSearching && userSearchQuery.length >= 2 && userSearchResults.length === 0 && (
                    <div className="conversations-empty">
                      <p>No users found</p>
                      <p className="empty-hint">Try a different search</p>
                    </div>
                  )}
                  {!isSearching && userSearchQuery.length < 2 && (
                    <div className="conversations-empty">
                      <p>Search for a user</p>
                      <p className="empty-hint">Type at least 2 characters</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* 🔵 Map through filtered conversations from context */}
                  {filteredConversations.map((conv) => {
                    // Support both API format (last_message) and mock format (messages array)
                    const lastMessage = conv.last_message || (conv.messages && conv.messages[conv.messages.length - 1]);
                    const displayName = conv.user?.displayName || `${conv.user?.first_name || ''} ${conv.user?.last_name || ''}`.trim() || conv.user?.username || 'Unknown';
                    const isActive = conv.user?.id === selectedUserId;
                    const messagePreview = lastMessage?.content || lastMessage?.text || 'No messages yet';
                    const hasUnread = conv.unread_count > 0;
                    
                    return (
                      <div 
                        key={conv.id || conv.user?.id}
                        className={`conversation-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
                        onClick={() => {
                          selectConversation(conv.user?.id, conv.user);
                          setMobileView('chat'); // Switch to chat view on mobile
                        }}
                      >
                        {/* Avatar - show initials */}
                        <div className="conversation-avatar">
                          <span className="initial-1">{getInitials(displayName)[0]}</span>
                          {getInitials(displayName).length > 1 && (
                            <span className="initial-2">{getInitials(displayName)[1]}</span>
                          )}
                        </div>
                        <div className="conversation-info">
                          <span className="conversation-name">{displayName}</span>
                          <span className={`conversation-preview ${hasUnread ? 'unread' : ''}`}>
                            {messagePreview.substring(0, 30) + (messagePreview.length > 30 ? '...' : '')}
                          </span>
                        </div>
                        <div className="conversation-meta">
                          <span className="conversation-time">
                            {formatRelativeTime(lastMessage?.created_at || conv.lastMessageTime)}
                          </span>
                          {hasUnread && (
                            <span className="unread-badge">{conv.unread_count}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              
                  {/* Empty state - no search results */}
                  {filteredConversations.length === 0 && searchQuery.trim() && (
                    <div className="conversations-empty">
                      <p>No results for "{searchQuery}"</p>
                      <p className="empty-hint">Try a different search term</p>
                    </div>
                  )}
              
                  {/* Empty state - no conversations at all */}
                  {conversations.length === 0 && (
                    <div className="conversations-empty">
                      <p>No conversations yet</p>
                      <p className="empty-hint">Message someone from their post!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Chat View */}
          <div className={`message-chat ${mobileView === 'list' ? 'hide' : ''}`}>
            {selectedConversation ? (() => {
              // BULLETPROOF: Get display name - try EVERY possible source
              const user = selectedConversation.user || {};
              const chatDisplayName = 
                user.displayName ||                                           // Direct displayName
                user.display_name ||                                          // Snake case variant
                (user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`.trim() 
                  : null) ||                                                  // Full name
                user.first_name ||                                            // Just first name
                user.username ||                                              // Username fallback
                'Unknown User';                                               // Ultimate fallback
              
              console.log('📛 Chat header display name:', chatDisplayName, '| User object:', user);
              
              return (
              <>
                {/* Chat Header - MUST ALWAYS SHOW */}
                <div className="chat-header">
                  {/* Mobile back button */}
                  <button 
                    className="chat-back-btn"
                    onClick={() => setMobileView('list')}
                  >
                    <ChevronLeftIcon size={20} />
                  </button>
                  <span 
                    className="chat-username clickable"
                    onClick={() => {
                      onClose();
                      navigate(`/profile/${user.username}`);
                    }}
                    title="Click to view profile"
                  >
                    {chatDisplayName}
                  </span>
                  {/* Mobile close button */}
                  <button className="chat-close-btn" onClick={onClose}>
                    <CloseIcon size={20} />
                  </button>
                </div>
                
                {/* Messages */}
                <div className="chat-messages">
                  {(selectedMessages || []).map((msg) => {
                    // Determine if message is sent by current user
                    const isSent = msg.sender === 'me' || msg.sender?.id !== selectedUserId;
                    const messageContent = msg.content || msg.text || '';
                    const messageTime = msg.created_at || msg.timestamp;
                    const hasStoryReply = msg.story && msg.story.id;
                    
                    return (
                      <div key={msg.id} className={`message-row ${isSent ? 'sent' : 'received'}`}>
                        <span className="message-time">{formatMessageTime(messageTime)}</span>
                        <div className={`chat-message ${isSent ? 'sent' : 'received'}`}>
                          {/* Story reply thumbnail */}
                          {hasStoryReply && (
                            <div className="story-reply-preview">
                              {msg.story.is_expired ? (
                                <div className="story-expired">
                                  <span>Story no longer available</span>
                                </div>
                              ) : (
                                <>
                                  <img 
                                    src={msg.story.media_url} 
                                    alt="Story" 
                                    className="story-reply-thumb"
                                  />
                                  <span className="story-reply-label">
                                    {isSent ? 'Replied to their story' : 'Replied to your story'}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                          <p>{messageContent}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty conversation state */}
                  {(!selectedMessages || selectedMessages.length === 0) && (
                    <div className="chat-empty">
                      <p>Start a conversation with {chatDisplayName}</p>
                    </div>
                  )}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Composer */}
                <div className="chat-composer" ref={composerRef}>
                  <textarea 
                    id="chat-message-input"
                    name="chat-message"
                    placeholder="Type a message..." 
                    className="chat-textarea"
                    rows="1"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleTextareaFocus}
                  />
                  <button 
                    className={`chat-send-btn charge-${getChargeLevel()}`}
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                  >
                    <ChevronRightIcon size={26} className="send-icon" strokeWidth="2.5" />
                  </button>
                </div>
              </>
              );
            })() : (
              /* No conversation selected state */
              <div className="chat-no-selection">
                <div className="no-selection-icon">
                  <MessageBubbleIcon size={48} stroke="rgba(201,168,255,0.4)" strokeWidth="1.5" />
                </div>
                <p>Select a conversation</p>
                <p className="no-selection-hint">or message someone from their post</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageModal;
