// 🔵 PABLO - UI Architect
// NewMessagesModal.jsx - Dropdown showing unread messages (uses NotificationModal styling)

import { useEffect } from 'react';
import { useMessages } from '@contexts/MessageContext';
import '../NotificationModal/NotificationModal.scss';

// Helper: Format relative time (available for future use)
const _formatRelativeTime = (date) => {
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

function NewMessagesModal({ isOpen, onClose }) {
  const { conversations, selectConversation, openMessages } = useMessages();

  // Filter to only unread conversations
  const unreadConversations = conversations.filter(conv => conv.unread_count > 0);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConversationClick = (conv) => {
    selectConversation(conv.user?.id, conv.user);
    onClose();
    openMessages();
  };

  const handleViewAll = () => {
    onClose();
    openMessages();
  };

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
        
        <div className="notif-header">
          <span>New Messages</span>
          <button className="notif-close" onClick={onClose}>✕</button>
        </div>

        <div className="notif-list">
          {unreadConversations.length === 0 ? (
            <p className="notif-empty">No new messages</p>
          ) : (
            unreadConversations.map((conv) => {
              const displayName = conv.user?.username || 'Unknown';
              const lastMessage = conv.last_message;
              const messagePreview = lastMessage?.content || 'New message';

              return (
                <div 
                  key={conv.id || conv.user?.id}
                  className="notif-item notif-clickable"
                  onClick={() => handleConversationClick(conv)}
                >
                  <p className="notif-text">
                    <span className="notif-name">{displayName}</span>
                    {' '}{messagePreview.substring(0, 35) + (messagePreview.length > 35 ? '...' : '')}
                  </p>
                  <span className="notif-badge">{conv.unread_count}</span>
                </div>
              );
            })
          )}
        </div>

        {unreadConversations.length > 0 && (
          <button className="notif-viewall" onClick={handleViewAll}>
            View All
          </button>
        )}
      </div>
    </div>
  );
}

export default NewMessagesModal;
