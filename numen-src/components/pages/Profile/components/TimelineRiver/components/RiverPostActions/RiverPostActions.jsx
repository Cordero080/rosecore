/**
 * RiverPostActions - Action buttons for TimelineRiver posts
 * 
 * Renders the like, comment, share, edit, delete buttons
 * Different buttons show depending on isOwnProfile:
 * - Own profile: edit, delete buttons visible
 * - Friend view: message, bookmark buttons visible
 * 
 * 🔗 CONNECTION: Used by TimelineRiver.jsx for both friend and own posts
 */
import { useState, useRef } from 'react';
import './RiverPostActions.scss';
import {
  HeartDynamicIcon,
  BoltDynamicIcon,
  MessageBubbleIcon,
  RepostIcon,
  BookmarkIcon,
  EditIcon,
  TrashIcon,
  MessageLineIcon,
} from '@assets/icons';
import ReactionPicker from '@Home/components/TimelineRiverRow/components/ReactionPicker';

const RiverPostActions = ({
  post,
  postType = 'thoughts', // For heart color
  isOwnProfile = false,
  animatingHeartId,
  onLike,
  onComment,
  onEdit,
  onDelete,
  onMessage,
}) => {
  // Reaction picker state (long-press)
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionType, setReactionType] = useState(post?.reaction_type || 'like');
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const longPressTimer = useRef(null);
  const LONG_PRESS_DURATION = 400;
  
  // Type-based heart colors
  const heartColors = {
    thoughts: '#31fcfcff',    // cyan/blue
    media: '#ad7afeff',       // purple  
    milestones: '#ffd700ff'   // gold
  };
  const heartColor = heartColors[postType] || '#2fcefaff';
  
  if (!post) return null;

  // Long-press handlers for reaction picker
  const handleReactionMouseDown = (e) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, LONG_PRESS_DURATION);
  };
  
  const handleReactionMouseUp = async (e) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      
      if (!showReactionPicker) {
        setIsHeartAnimating(true);
        setTimeout(() => setIsHeartAnimating(false), 300);
        await onLike?.(post.id);
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
    setReactionType(selectedReaction);
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    
    if (!post.is_liked) {
      await onLike?.(post.id);
    }
  };

  // Determine CSS class based on context
  const actionsClass = isOwnProfile 
    ? 'river-post-actions my-post-actions' 
    : 'river-post-actions friend-post-actions';
  
  const isAnimating = isHeartAnimating || animatingHeartId === post.id;

  return (
    <div className={`${actionsClass} ${showReactionPicker ? 'picker-open' : ''}`}>
      {/* ❤️/⚡ Like button with long-press reaction picker */}
      <div
        className={`river-post-likes ${post.is_liked ? 'is-liked' : ''} ${isAnimating ? 'heart-pulse' : ''}`}
        onMouseDown={handleReactionMouseDown}
        onMouseUp={handleReactionMouseUp}
        onMouseLeave={handleReactionMouseLeave}
        onTouchStart={handleReactionMouseDown}
        onTouchEnd={handleReactionMouseUp}
        title={post.is_liked ? 'Unlike (hold for more)' : 'Like (hold for more)'}
        style={{ cursor: 'pointer', '--heart-color': heartColor, position: 'relative' }}
      >
        {reactionType === 'emphasis' ? (
          <BoltDynamicIcon size={18} filled={post.is_liked} fillColor={heartColor} />
        ) : (
          <HeartDynamicIcon size={18} filled={post.is_liked} />
        )}
        {post.likes_count || 0}
        
        <ReactionPicker
          isOpen={showReactionPicker}
          onSelect={handleReactionSelect}
          onClose={() => setShowReactionPicker(false)}
          reactionColor={heartColor}
          currentReaction={reactionType}
        />
      </div>

      {/* 💬 Comment button - always visible */}
      <button
        className={`river-action-btn ${post.reply_count > 0 ? 'has-replies' : ''}`}
        title="Comment"
        onClick={() => onComment?.(post.id)}
      >
        <MessageBubbleIcon size={18} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
        {post.reply_count > 0 && <span className="reply-count">{post.reply_count}</span>}
      </button>

      {/* 🔄 Share/Repost button - always visible */}
      <button className="river-action-btn" title={isOwnProfile ? 'Share' : 'Repost'}>
        <RepostIcon size={18} stroke="rgba(79,255,255,0.5)" />
      </button>

      {/* === FRIEND VIEW ONLY === */}
      {!isOwnProfile && (
        <>
          {/* ✉️ Message button */}
          <button
            className="river-action-btn river-action-btn--message"
            title={`Message ${post.author?.username || 'user'}`}
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.({
                id: post.author?.id,
                username: post.author?.username,
                displayName: post.author?.username,
              });
            }}
          >
            <MessageLineIcon size={18} stroke="rgba(0,212,255,0.5)" />
          </button>

          {/* 🔖 Bookmark button */}
          <button className="river-action-btn" title="Bookmark">
            <BookmarkIcon size={18} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
          </button>
        </>
      )}

      {/* === OWN PROFILE ONLY === */}
      {isOwnProfile && (
        <>
          {/* ✏️ Edit button */}
          <button
            className="river-action-btn river-action-btn--edit"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(post);
            }}
          >
            <EditIcon size={18} stroke="rgba(255,193,7,0.6)" strokeWidth="1.5" />
          </button>

          {/* 🗑️ Delete button */}
          <button
            className="river-action-btn river-action-btn--delete"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(post.id);
            }}
          >
            <TrashIcon size={18} stroke="rgba(255,82,82,0.6)" strokeWidth="1.5" />
          </button>
        </>
      )}
    </div>
  );
};

export default RiverPostActions;
