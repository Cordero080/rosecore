// 🔵 PABLO - UI Component
// PostCard.jsx - Individual post card with actions

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatRelativeTime } from '@components/pages/Home/utils/timeFormatters';
import ThreadView from '../ThreadView';
import RepostModal from '../RepostModal/RepostModal';
import ReactionPicker from '../ReactionPicker';
import {
  UserIcon,
  HeartDynamicIcon,
  BoltDynamicIcon,
  MessageBubbleIcon,
  RepostIcon,
  BookmarkIcon,
  MessageLineIcon,
  GraphLineIcon,
  EditIcon,
  TrashIcon,
  MaximizeIcon,
  ChevronRightIcon,
  CloseIcon,
  ImageIcon,
  VisibilityIcon
} from '@assets/icons';
import './PostCard.scss';

function PostCard({ 
  // Props
  post,
  type,
  user,
  currentUser,
  isSinglePost,
  isShortPost,
  isGridView = false,
  // Actions
  onUserClick,
  onLike,
  onShare,
  onComment,
  onMessage,
  onEdit,
  onDelete,
  onExpandMedia,
  onCardClick,
  // Thread props
  onToggleThread,
  expandedThreadId,
  threadReplies,
  loadingThread,
  showAllReplies,
  onToggleShowAllReplies,
  onReplySubmit,
  onUpdateReply,
  onDeleteReply,
  onReplyToComment, // New: Reply to a comment with @mention
  // Comment composer props
  activeCommentPostId,
  commentText,
  setCommentText,
  setActiveCommentPostId,
  isComposerFullPage,
  setIsComposerFullPage,
  isSaving
}) {
  // Heart animation state
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  
  // Repost modal state
  const [showRepostModal, setShowRepostModal] = useState(false);
  
  // Reaction picker state (long-press)
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionType, setReactionType] = useState(post.reaction_type || 'like'); // 'like' or 'emphasis'
  const longPressTimer = useRef(null);
  const LONG_PRESS_DURATION = 400; // ms
  
  // Type-based heart colors
  const heartColors = {
    thoughts: '#31fcfcff',    // cyan/blue
    media: '#ad7afeff',       // purple  
    milestones: '#0ce77dff'   // green
  };
  const heartColor = heartColors[type] || '#2fcefaff';
  
  // Long-press handlers for reaction picker
  const handleReactionMouseDown = (e) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, LONG_PRESS_DURATION);
  };
  
  const handleReactionMouseUp = async (e) => {
    e.stopPropagation();
    // If timer still running, it was a quick tap - do regular like
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      
      // Only trigger like if picker isn't showing
      if (!showReactionPicker) {
        setIsHeartAnimating(true);
        setTimeout(() => setIsHeartAnimating(false), 300);
        await onLike(post.id);
      }
    }
  };
  
  const handleReactionMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  
  const handleReactionSelect = async (selectedReaction) => {
    setShowReactionPicker(false);
    setReactionType(selectedReaction); // Update which icon to show
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    
    // Only call onLike if not already liked (to add the reaction)
    // If already liked with same reaction, this will unlike
    // If already liked with different reaction, just change the icon (don't toggle)
    if (!post.is_liked) {
      await onLike(post.id);
    }
    // TODO: When backend supports reaction types, pass selectedReaction to API
  };
  
  // Determine current reaction state
  const currentReaction = post.is_liked ? reactionType : null;

  // Handle card click - opens expanded view
  const handleCardClick = (e) => {
    // Don't trigger if clicking on interactive elements
    if (e.target.closest('button') || 
        e.target.closest('.river-avatar') || 
        e.target.closest('.river-author') ||
        e.target.closest('.river-post-actions') ||
        e.target.closest('.river-post-media') ||
        e.target.closest('.inline-comment-composer') ||
        e.target.closest('.thread-view')) {
      return;
    }
    onCardClick?.(post);
  };
  
  return (
    <>
    <div 
      className={`river-post-card post--${type} ${isSinglePost ? 'post--single' : ''} ${isShortPost ? 'post--compact' : ''} ${isGridView ? 'post--grid-view' : ''} fade-in`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Header: Avatar + Name + Type Badge */}
      <div className="river-post-header">
        <div 
          className="river-avatar clickable-user" 
          onClick={(e) => onUserClick(e, user.id, user.username)}
          title={`View ${user.name}'s profile`}
        >
          {user.profile_picture ? (
            <img 
              src={user.profile_picture} 
              alt={user.name} 
              className="river-avatar-img"
            />
          ) : (
            <UserIcon size={24} />
          )}
        </div>
        <div className="river-post-info">
          <div 
            className="river-author clickable-user"
            onClick={(e) => onUserClick(e, user.id, user.username)}
            title={`View ${user.name}'s profile`}
          >
            {user.name}
          </div>
          <div className="river-meta">
            <span className="river-timestamp">{formatRelativeTime(post.created_at || post.createdAt)}</span>
          </div>
        </div>
        {/* Privacy icon */}
        <VisibilityIcon visibility={post.visibility} size={20} className="privacy-icon" />
      </div>

      {/* Media Image (only for media posts) */}
      {type === 'media' && post.media_url && (
        <div className="river-post-media" onClick={(e) => {
          e.stopPropagation();
          onExpandMedia(post);
        }}>
          <img src={post.media_url} alt="Post media" className="river-media-image" />
          <div className="media-expand-hint">
            <MaximizeIcon size={20} />
          </div>
        </div>
      )}
      
      {/* Post Content - truncated in grid view */}
      <p className={`river-post-content ${isGridView ? 'river-post-content--truncated' : ''}`}>
        {post.content}
      </p>
      {isGridView && post.content && post.content.length > 80 && (
        <span className="see-more-link" onClick={(e) => { e.stopPropagation(); onCardClick?.(post); }}>
          See more
        </span>
      )}

      {/* Post Actions */} 
      <div className={`river-post-actions ${showReactionPicker ? 'picker-open' : ''}`}>
        {/* Likes - with long-press reaction picker */}
        <div 
          className={`river-post-likes ${post.is_liked ? 'is-liked' : ''} ${isHeartAnimating ? 'heart-pulse' : ''}`}
          onMouseDown={handleReactionMouseDown}
          onMouseUp={handleReactionMouseUp}
          onMouseLeave={handleReactionMouseLeave}
          onTouchStart={handleReactionMouseDown}
          onTouchEnd={handleReactionMouseUp}
          title={post.is_liked ? 'Unlike (hold for more)' : 'Like (hold for more)'}
          style={{ cursor: 'pointer', '--heart-color': heartColor, position: 'relative' }}
        >
          {/* Show heart or bolt based on reaction type */}
          {reactionType === 'emphasis' ? (
            <BoltDynamicIcon size={18} filled={post.is_liked} fillColor={heartColor} />
          ) : (
            <HeartDynamicIcon size={18} filled={post.is_liked} />
          )}
          {post.likes_count || 0}
          
          {/* Reaction Picker Popup - shows to the right */}
          <ReactionPicker
            isOpen={showReactionPicker}
            onSelect={handleReactionSelect}
            onClose={() => setShowReactionPicker(false)}
            reactionColor={heartColor}
            currentReaction={currentReaction}
          />
        </div>
        
        {/* Comment */}
        <button 
          className={`river-action-btn ${post.reply_count > 0 ? 'has-replies' : ''}`}
          title="Comment"
          onClick={() => onComment(post.id)}
        >
          <MessageBubbleIcon size={20} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
          {post.reply_count > 0 && <span className="reply-count">{post.reply_count}</span>}
        </button>
        
        {/* Repost/Share */}
        <button 
          className="river-action-btn" 
          title="Repost"
          onClick={(e) => {
            e.stopPropagation();
            setShowRepostModal(true);
          }}
        >
          <RepostIcon size={20} stroke="rgba(79,255,255,0.5)" strokeWidth="1.5" />
          {post.shares_count > 0 && <span className="share-count">{post.shares_count}</span>}
        </button>
        
        {/* Bookmark */}
        <button className="river-action-btn" title="Bookmark">
          <BookmarkIcon size={20} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
        </button>
        
        {/* Message button - only on OTHER people's posts */}
        {currentUser && post.author?.id !== currentUser.id && (
          <button 
            className="river-action-btn river-action-btn--message" 
            title={`Message ${post.author?.username || 'user'}`}
            onClick={(e) => {
              e.stopPropagation();
              onMessage({
                id: post.author?.id,
                username: post.author?.username,
                displayName: post.author?.username,
              });
            }}
          >
            <MessageLineIcon size={20} stroke="rgba(0,212,255,0.5)" strokeWidth="1.5" />
          </button>
        )}
        
        {/* Analytics, Edit & Delete - only for your own posts */}
        {currentUser && post.author?.id === currentUser.id && (
          <>
            <button className="river-action-btn" title="Analytics">
              <GraphLineIcon size={20} stroke="rgba(26,231,132,0.5)" strokeWidth="1.5" />
            </button>
            <button 
              className="river-action-btn river-action-btn--edit" 
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(post);
              }}
            >
              <EditIcon size={20} stroke="rgba(255,193,7,0.6)" strokeWidth="1.5" />
            </button>
            <button 
              className="river-action-btn river-action-btn--delete" 
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post.id);
              }}
            >
              <TrashIcon size={20} stroke="rgba(255,82,82,0.6)" strokeWidth="1.5" />
            </button>
          </>
        )}
      </div>

      {/* Inline Comment Composer */}
      {activeCommentPostId === post.id && !isComposerFullPage && (
        <div className="inline-comment-composer-wrapper">
          <div className="inline-comment-composer">
            <div className="comment-input-wrapper">
              <textarea
                className="comment-input"
                placeholder="Comment..."
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                rows={1}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (commentText.trim()) {
                      onReplySubmit(post.id, commentText);
                    }
                  }
                  if (e.key === 'Escape') {
                    setActiveCommentPostId(null);
                    setCommentText('');
                  }
                }}
              />
              <button 
                className="expand-composer-btn"
                onClick={() => setIsComposerFullPage(true)}
                title="Expand to full page"
              >
                <MaximizeIcon size={12} strokeWidth="2.5" />
              </button>
            </div>
            <button 
              className="comment-submit-btn"
              disabled={!commentText.trim()}
              onClick={async () => {
                if (commentText.trim()) {
                  await onReplySubmit(post.id, commentText);
                }
              }}
            >
              <ChevronRightIcon size={22} strokeWidth="2.5" />
            </button>
          </div>
          <button 
            className={`inline-composer-cancel inline-composer-cancel--${type}`}
            onClick={() => {
              setActiveCommentPostId(null);
              setCommentText('');
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* View Thread Link */}
      {post.reply_count > 0 && expandedThreadId !== post.id && (
        <button 
          className="view-thread-btn"
          onClick={() => onToggleThread(post.id)}
        >
          <span className="thread-line" />
          View {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
        </button>
      )}

      {/* Thread View */}
      {expandedThreadId === post.id && (
        <ThreadView
          postId={post.id}
          postType={type}
          replies={threadReplies[post.id]}
          isLoading={loadingThread === post.id}
          currentUser={currentUser}
          onCollapse={() => onToggleThread(post.id)}
          onUpdateReply={onUpdateReply}
          onDeleteReply={onDeleteReply}
          onReplyToComment={onReplyToComment}
          showAllReplies={showAllReplies[post.id]}
          onToggleShowAll={() => onToggleShowAllReplies(post.id)}
        />
      )}


      {/* Full Page Composer View */}
      {activeCommentPostId === post.id && isComposerFullPage && createPortal(
        <div className="full-page-composer-overlay">
          <div className="full-page-composer">
            {/* Header with close button */}
            <div className="full-page-header">
              <button 
                className="close-btn-glow"
                onClick={() => {
                  setIsComposerFullPage(false);
                  setActiveCommentPostId(null);
                  setCommentText('');
                }}
                title="Close"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="full-page-content">
              {/* Original Post Context */}
              <div className="reply-context">
                <div className="reply-context-header">
                  <div className="reply-context-avatar">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.name} 
                        className="reply-context-avatar-img"
                      />
                    ) : (
                      <UserIcon size={20} />
                    )}
                  </div>
                  <span className="reply-context-name">{user.name}</span>
                  <span className="reply-context-handle">@{user.username}</span>
                  <span className="reply-context-dot">·</span>
                  <span className="reply-context-time">{formatRelativeTime(post.created_at || post.createdAt)}</span>
                </div>
                <p className="reply-context-content">{post.content}</p>
                  {type === 'media' && post.media_url && (
                    <div className="reply-context-media">
                      <img src={post.media_url} alt="Post media" />
                    </div>
                  )}
                </div>

              {/* Thread View - show existing replies */}
              {threadReplies[post.id] && threadReplies[post.id].length > 0 && (
                <div className="full-page-thread">
                  <ThreadView
                    postId={post.id}
                    postType={type}
                    replies={threadReplies[post.id]}
                    isLoading={loadingThread === post.id}
                    currentUser={currentUser}
                    onCollapse={() => {}}
                    onUpdateReply={onUpdateReply}
                    onDeleteReply={onDeleteReply}
                    onReplyToComment={onReplyToComment}
                    showAllReplies={showAllReplies[post.id]}
                    onToggleShowAll={() => onToggleShowAllReplies(post.id)}
                  />
                </div>
              )}
            </div>

            {/* Fixed Bottom Area - Actions + Composer */}
            <div className="full-page-composer-fixed">
              {/* Post Actions */}
              <div className="full-page-actions">
                {/* Like */}
                <div 
                  className={`reply-action-btn ${post.is_liked ? 'is-liked' : ''}`}
                  onClick={async () => await onLike(post.id)}
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
                <div 
                  className="reply-action-btn"
                  onClick={() => setShowRepostModal(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <RepostIcon size={20} stroke="rgba(79,255,255,0.5)" strokeWidth="1.5" />
                  <span>{post.shares_count || 0}</span>
                </div>
                {/* Bookmark */}
                <div className="reply-action-btn" style={{ cursor: 'pointer' }}>
                  <BookmarkIcon size={20} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
                </div>
              </div>

              {/* Composer - flexbox layout: input with media btn + send btn on right */}
              <div className="expanded-composer-row">
                <div className="comment-input-wrapper">
                  <textarea
                    className="comment-input"
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (commentText.trim()) {
                          onReplySubmit(post.id, commentText);
                          setCommentText('');
                        }
                      }
                      if (e.key === 'Escape') {
                        setIsComposerFullPage(false);
                      }
                    }}
                  />
                  <button 
                    className="comment-media-btn"
                    title="Add media"
                    onClick={() => {}}
                  >
                    <ImageIcon size={18} stroke="rgba(220, 8, 188, 0.5)" strokeWidth="1.5" />
                  </button>
                </div>
                <button 
                  className="expanded-send-btn"
                  disabled={!commentText.trim() || isSaving}
                  onClick={async () => {
                    if (commentText.trim()) {
                      await onReplySubmit(post.id, commentText);
                      setCommentText('');
                    }
                  }}
                >
                  <ChevronRightIcon size={24} stroke="currentColor" strokeWidth="2.5" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    
    {/* Repost Modal */}
    {showRepostModal && (
      <RepostModal
        post={post}
        user={user}
        type={type}
        onClose={() => setShowRepostModal(false)}
        onRepost={onShare}
        onCopyLink={() => {}}
      />
    )}
    </>
  );
}

export default PostCard;
