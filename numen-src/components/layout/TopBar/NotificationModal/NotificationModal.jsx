// 🔵 PABLO - UI Architect
// NotificationModal.jsx - Minimal notification dropdown

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriends, useNotifications } from '@contexts';
import PostDetailModal from '@ui/PostDetailModal';
import './NotificationModal.scss';

function NotificationModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { pendingRequests, acceptRequest, declineRequest } = useFriends();
  const { notifications, markAsRead, removeNotification, clearNotifications } = useNotifications();
  
  // State for viewing a post in modal
  const [viewingPostId, setViewingPostId] = useState(null);
  const [viewingNotificationId, setViewingNotificationId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAccept = async (requestId) => {
    await acceptRequest(requestId);
    onClose();
    navigate('/home');
  };

  const handleDecline = async (requestId) => {
    await declineRequest(requestId);
  };

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
        
        <div className="notif-header">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <button className="notif-clear-all" onClick={clearNotifications} style={{ marginLeft: 'auto', marginRight: '10px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px' }}>
              Clear
            </button>
          )}
          <button className="notif-close" onClick={onClose}>✕</button>
        </div>

        <div className="notif-list">
          {pendingRequests.length === 0 && notifications.length === 0 ? (
            <p className="notif-empty">No notifications</p>
          ) : (
            <>
            {pendingRequests.map((req) => (
              <div key={req.id} className="notif-item">
                <p className="notif-text">
                  <span 
                    className="notif-name" 
                    onClick={() => { navigate(`/profile/${req.from_user.username}`); onClose(); }}
                  >
                    {req.from_user.username}
                  </span>
                  {' '}wants to be friends
                </p>
                <div className="notif-actions">
                  <button className="notif-accept" onClick={() => handleAccept(req.id)}>✓</button>
                  <button className="notif-decline" onClick={() => handleDecline(req.id)}>✕</button>
                </div>
              </div>
            ))}
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notif-item notif-clickable ${!notif.read ? 'notif-unread' : ''}`}
                onClick={() => {
                  markAsRead(notif.id);
                  // Open post modal for post-related notifications
                  if (notif.type === 'wall_post' || notif.type === 'post_comment' || notif.type === 'comment_reply') {
                    const postId = notif.post?.id || notif.post_id;
                    if (postId) {
                      setViewingPostId(postId);
                      setViewingNotificationId(notif.id);
                      // Keep dropdown open, modal will overlay
                      return;
                    }
                  }
                  // Navigate for other notification types
                  if (notif.type === 'friend_accepted') {
                    navigate(`/profile/${notif.friend?.username}`);
                  } else if (notif.author?.username) {
                    navigate(`/profile/${notif.author.username}`);
                  }
                  onClose();
                }}
              >
                 <div className="notif-content">
                    <p className="notif-text">
                      <span className="notif-name">
                        {notif.type === 'post_comment' 
                          ? (notif.commenter?.first_name || notif.commenter?.username || 'Someone')
                          : notif.type === 'comment_reply'
                            ? (notif.replier?.first_name || notif.replier?.username || 'Someone')
                            : notif.type === 'friend_accepted'
                              ? (notif.friend?.first_name || notif.friend?.username || 'Someone')
                              : (notif.author?.username || 'Someone')}
                      </span>
                      {' '}{notif.type === 'wall_post' 
                        ? 'posted on your wall' 
                        : notif.type === 'post_comment'
                          ? 'commented on your post'
                          : notif.type === 'comment_reply'
                            ? 'replied to your comment'
                            : notif.type === 'friend_accepted'
                              ? 'accepted your friend request'
                              : (notif.message || 'posted something')}
                    </p>
                    {/* Show preview for comment replies */}
                    {notif.type === 'comment_reply' && notif.reply?.content && (
                      <p className="notif-preview">"{notif.reply.content.substring(0, 50)}{notif.reply.content.length > 50 ? '...' : ''}"</p>
                    )}
                    <span className="notif-time">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
              </div>
            ))}
            </>
          )}
        </div>

        {pendingRequests.length > 0 && (
          <button className="notif-viewall" onClick={() => { navigate('/friends'); onClose(); }}>
            View All
          </button>
        )}
      </div>
      
      {/* Post Detail Modal - opens when clicking post-related notifications */}
      {viewingPostId && (
        <PostDetailModal 
          postId={viewingPostId} 
          onClose={() => {
            setViewingPostId(null);
            setViewingNotificationId(null);
            onClose(); // Also close notification dropdown
          }}
          onPostNotFound={() => {
            // Post doesn't exist anymore, remove the notification
            if (viewingNotificationId) {
              removeNotification(viewingNotificationId);
            }
            setViewingPostId(null);
            setViewingNotificationId(null);
          }}
        />
      )}
    </div>
  );
}

export default NotificationModal;