/**
 * RiverComposer - Comment input for TimelineRiver posts
 * 
 * Two modes:
 * 1. Inline - small textarea under the post
 * 2. Full-page - portal overlay with original post context + thread
 * 
 * 🔗 CONNECTION: Used by TimelineRiver.jsx for commenting on posts
 */
import { createPortal } from 'react-dom';
import './RiverComposer.scss';
import {
  ChevronRightIcon,
  MaximizeIcon,
  PlusIcon,
  CloseIcon,
  ImageIcon,
  CheckIcon,
  UserIcon,
  HeartDynamicIcon,
  MessageBubbleIcon,
  RepostIcon,
  BookmarkIcon,
} from '@assets/icons';

const RiverComposer = ({
  post,
  postType = 'thoughts',
  isOpen,
  isFullPage,
  isEditMode = false,
  commentText,
  setCommentText,
  threadReplies = [],
  onSubmit,
  onClose,
  onExpand,
  onSaveEdit,
  onLike,
  formatRelativeTime,
  isSaving = false,
}) => {
  if (!isOpen || !post) return null;

  // Type-based heart colors
  const heartColors = {
    thoughts: '#31fcfcff',
    media: '#ad7afeff',
    milestones: '#ffd700ff'
  };
  const heartColor = heartColors[postType] || '#2fcefaff';

  // Get author info for full-page context
  const postAuthor = post.author || {};
  const authorName = postAuthor.first_name && postAuthor.last_name
    ? `${postAuthor.first_name} ${postAuthor.last_name}`
    : postAuthor.username || 'User';

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (commentText.trim()) {
        if (isEditMode) {
          onSaveEdit?.();
        } else {
          onSubmit?.();
        }
      }
    }
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  // === INLINE COMPOSER ===
  if (!isFullPage) {
    return (
      <div className="inline-comment-composer">
        <div className="comment-input-wrapper">
          <textarea
            className="comment-input"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            rows={1}
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <button
            className="expand-composer-btn"
            onClick={onExpand}
            title="Add more options"
          >
            <PlusIcon size={14} />
          </button>
        </div>
        <button
          className="comment-submit-btn"
          disabled={!commentText.trim()}
          onClick={onSubmit}
        >
          <ChevronRightIcon size={20} strokeWidth="2.5" />
        </button>
      </div>
    );
  }

  // === FULL PAGE COMPOSER (Portal) ===
  return createPortal(
    <div className="full-page-composer-overlay">
      <div className="full-page-composer">
        {/* Header with close button */}
        <div className="full-page-header">
          <button
            className="close-btn-glow"
            onClick={onClose}
            title="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="full-page-content">
          {/* Original Post Context (not shown in edit mode) */}
          {!isEditMode && (
            <div className="reply-context">
              <div className="reply-context-header">
                <div className="reply-context-avatar">
                  {postAuthor?.profile_picture ? (
                    <img 
                      src={postAuthor.profile_picture} 
                      alt={authorName} 
                    />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </div>
                <span className="reply-context-name">{authorName}</span>
                <span className="reply-context-handle">@{postAuthor.username}</span>
                <span className="reply-context-dot">·</span>
                <span className="reply-context-time">
                  {formatRelativeTime?.(post.created_at)}
                </span>
              </div>
              <p className="reply-context-content">{post.content}</p>
              {post.type === 'media' && post.media_url && (
                <div className="reply-context-media">
                  <img src={post.media_url} alt="Post media" />
                </div>
              )}
            </div>
          )}

          {/* Thread View - show existing replies */}
          {threadReplies.length > 0 && (
            <div className="full-page-thread">
              <div className="thread-view">
                <div className="thread-replies">
                  {threadReplies.map((reply) => (
                    <div key={reply.id} className="thread-reply">
                      <div className="thread-connector">
                        <div className="thread-line-vertical" />
                      </div>
                      <div className="reply-card">
                        <div className="reply-header">
                          <div className="reply-avatar">
                            {reply.author?.profile_picture ? (
                              <img 
                                src={reply.author.profile_picture} 
                                alt={reply.author?.username || 'User'} 
                              />
                            ) : (
                              <UserIcon size={14} />
                            )}
                          </div>
                          <span className="reply-author">
                            {reply.author?.username || 'User'}
                          </span>
                          <span className="reply-time">
                            {formatRelativeTime?.(reply.created_at)}
                          </span>
                        </div>
                        <p className="reply-content">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Composer at Bottom */}
        <div className="full-page-composer-fixed">
          {/* Post Actions - only show when not in edit mode */}
          {!isEditMode && (
            <div className="full-page-actions">
              {/* Like */}
              <div 
                className={`reply-action-btn ${post.is_liked ? 'is-liked' : ''}`}
                onClick={() => onLike?.(post.id)}
                style={{ cursor: 'pointer', '--heart-color': heartColor }}
              >
                <HeartDynamicIcon size={20} filled={post.is_liked} />
                <span>{post.likes_count || 0}</span>
              </div>
              {/* Comment count */}
              <div className="reply-action-btn">
                <MessageBubbleIcon size={20} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
                <span>{post.reply_count || 0}</span>
              </div>
              {/* Share */}
              <div className="reply-action-btn" style={{ cursor: 'pointer' }}>
                <RepostIcon size={20} stroke="rgba(79,255,255,0.5)" strokeWidth="1.5" />
                <span>{post.shares_count || 0}</span>
              </div>
              {/* Bookmark */}
              <div className="reply-action-btn" style={{ cursor: 'pointer' }}>
                <BookmarkIcon size={20} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="comment-input-wrapper">
            <textarea
              className="comment-input"
              placeholder={isEditMode ? 'Edit your post...' : 'Share your thoughts...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              autoFocus
              onKeyDown={handleKeyDown}
            />

            {/* Action buttons inside textarea */}
            <div className="composer-actions">
              {!isEditMode && (
                <button
                  className="comment-media-btn"
                  title="Add media"
                  onClick={() => {}}
                >
                  <ImageIcon size={18} stroke="rgba(220, 8, 188, 0.5)" strokeWidth="1.5" />
                </button>
              )}

              <button
                className={`comment-submit-btn ${isEditMode ? 'edit-submit-btn' : ''}`}
                disabled={!commentText.trim() || isSaving}
                onClick={() => {
                  if (commentText.trim()) {
                    if (isEditMode) {
                      onSaveEdit?.();
                    } else {
                      onSubmit?.();
                    }
                  }
                }}
              >
                {isEditMode ? (
                  <CheckIcon size={20} stroke="rgba(255, 193, 7, 0.5)" strokeWidth="2" />
                ) : (
                  <ChevronRightIcon size={20} stroke="rgba(26, 231, 132, 0.5)" strokeWidth="2" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RiverComposer;
