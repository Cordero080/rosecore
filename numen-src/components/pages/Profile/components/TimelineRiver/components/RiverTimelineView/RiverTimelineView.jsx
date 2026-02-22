// 🔵 PABLO - UI/Styling
// RiverTimelineView.jsx - Timeline mode view for own profile posts
// 
// ROW-CHUNKING DESIGN: Posts are grouped into rows of max 12 per category.
// Newest posts appear in the FIRST row (top), older posts flow to subsequent rows.
// This prevents feed clutter from prolific users and maintains chronological clarity.

import React from 'react';
import {
  MessageBubbleIcon,
  ImageIcon,
  ExpandIcon,
  MilestoneIcon,
  UserIcon,
} from '@assets/icons';
import RiverSmartDeck from '../RiverSmartDeck';
import './RiverTimelineView.scss';

const CAROUSEL_LIMIT = 12;

/**
 * Chunk a single category's posts aligned to a specified row count.
 * Row 0 gets the remainder (newest), subsequent rows get 12 each.
 * Empty arrays fill rows where this category has no posts.
 * 
 * KEY DESIGN: When ANY category hits 12+, ALL categories get aligned to the same row count.
 * This keeps newest posts synchronized across all types in Row 0.
 */
const chunkPostsAligned = (posts, totalRows) => {
  if (!posts || posts.length === 0) {
    return Array(totalRows).fill([]);
  }
  
  const chunks = [];
  const remainder = posts.length % CAROUSEL_LIMIT;
  
  if (posts.length <= CAROUSEL_LIMIT) {
    // Fits in one row
    chunks.push(posts);
  } else if (remainder > 0) {
    // Row 0: gets remainder (newest posts)
    chunks.push(posts.slice(0, remainder));
    // Remaining rows get 12 each
    for (let i = remainder; i < posts.length; i += CAROUSEL_LIMIT) {
      chunks.push(posts.slice(i, i + CAROUSEL_LIMIT));
    }
  } else {
    // Evenly divisible - each row gets 12
    for (let i = 0; i < posts.length; i += CAROUSEL_LIMIT) {
      chunks.push(posts.slice(i, i + CAROUSEL_LIMIT));
    }
  }
  
  // Pad with empty arrays if this category has fewer rows than total
  while (chunks.length < totalRows) {
    chunks.push([]);
  }
  
  return chunks;
};

/**
 * Calculate how many rows we need based on the largest category
 */
const calculateRowCount = (textPosts, mediaPosts, achievementPosts) => {
  const maxCategoryLength = Math.max(
    (textPosts || []).length,
    (mediaPosts || []).length,
    (achievementPosts || []).length
  );
  if (maxCategoryLength <= CAROUSEL_LIMIT) return 1;
  return Math.ceil(maxCategoryLength / CAROUSEL_LIMIT);
};

/**
 * Determine which category has the most recent post
 */
const getMostRecentType = (textPosts, mediaPosts, achievementPosts) => {
  const getLatestTimestamp = (posts) => {
    if (!posts || posts.length === 0) return 0;
    return Math.max(...posts.map(p => new Date(p.created_at || 0).getTime()));
  };
  
  const timestamps = {
    thoughts: getLatestTimestamp(textPosts),
    media: getLatestTimestamp(mediaPosts),
    milestones: getLatestTimestamp(achievementPosts)
  };
  
  let mostRecent = null;
  let maxTime = 0;
  for (const [type, time] of Object.entries(timestamps)) {
    if (time > maxTime) {
      maxTime = time;
      mostRecent = type;
    }
  }
  
  // Fallback: if no timestamps found, return first non-empty category
  if (!mostRecent) {
    if (textPosts && textPosts.length > 0) return 'thoughts';
    if (mediaPosts && mediaPosts.length > 0) return 'media';
    if (achievementPosts && achievementPosts.length > 0) return 'milestones';
  }
  
  return mostRecent;
};

function RiverTimelineView({
  textPosts,
  mediaPosts,
  achievementPosts,
  profileUser,
  mobileCategory,
  setMobileCategory,
  getDeckIndex,
  handleDeckIndexChange,
  setExpandedMediaPost,
  renderPostActions,
  renderCommentSection,
  formatDate,
  onCardClick,
  collapsedDecks = new Set(),
  onCollapseDeck,
  onExpandDeck,
}) {
  // Handle card click - don't trigger on interactive elements
  const handleCardClick = (e, post) => {
    if (e.target.closest('button') || 
        e.target.closest('.river-post-actions') ||
        e.target.closest('.river-card-media') ||
        e.target.closest('.inline-comment-composer') ||
        e.target.closest('.thread-view')) {
      return;
    }
    onCardClick?.(post);
  };
  // Calculate total rows needed (based on largest category)
  const rowCount = calculateRowCount(textPosts, mediaPosts, achievementPosts);
  
  // Chunk each category into aligned rows
  // KEY: All categories align to same row count when ANY exceeds 12
  const textRows = chunkPostsAligned(textPosts, rowCount);
  const mediaRows = chunkPostsAligned(mediaPosts, rowCount);
  const achievementRows = chunkPostsAligned(achievementPosts, rowCount);
  
  // Determine which category is most recent
  const mostRecentType = getMostRecentType(textPosts, mediaPosts, achievementPosts);
  
  // Check which categories have posts (for auto-hiding empty ones)
  const hasThoughts = textPosts && textPosts.length > 0;
  const hasMedia = mediaPosts && mediaPosts.length > 0;
  const hasMilestones = achievementPosts && achievementPosts.length > 0;
  
  // Count how many categories have content
  const categoriesWithContent = [hasThoughts, hasMedia, hasMilestones].filter(Boolean).length;

  // Helper to render a thoughts column for a specific row
  const renderThoughtsColumn = (rowIndex) => {
    const posts = textRows[rowIndex];
    const deckKey = `${profileUser?.username || 'me'}-thoughts-row${rowIndex}`;
    
    if (!posts || posts.length === 0) {
      return <div className="empty-column">{rowIndex === 0 ? 'No thoughts yet' : ''}</div>;
    }
    
    const currentIndex = getDeckIndex(profileUser?.username || 'me', `thoughts-row${rowIndex}`);
    const currentPost = posts[currentIndex] || posts[0];
    
    return (
      <>
        <div 
          className="river-card text-card"
          onClick={(e) => handleCardClick(e, currentPost)}
          style={{ cursor: 'pointer' }}
        >
          {/* Avatar header */}
          <div className="river-card-header">
            <div className="river-avatar">
              {currentPost?.author?.profile_picture ? (
                <img 
                  src={currentPost.author.profile_picture} 
                  alt={currentPost?.author?.username || profileUser?.username || 'Me'} 
                />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <span className="river-author">{currentPost?.author?.username || profileUser?.username || 'Me'}</span>
          </div>
          <div className="river-card-content">
            <p className="river-post-text">{currentPost?.content}</p>
            <span className="river-timestamp">{formatDate(currentPost?.created_at)}</span>
          </div>
          {renderPostActions(currentPost, false, 'thoughts')}
          {renderCommentSection(currentPost, 'thoughts')}
        </div>
        <RiverSmartDeck
          items={posts}
          deckKey={deckKey}
          currentIndex={currentIndex}
          onIndexChange={(key, idx) => handleDeckIndexChange(key, idx)}
        />
      </>
    );
  };

  // Helper to render a media column for a specific row
  const renderMediaColumn = (rowIndex) => {
    const posts = mediaRows[rowIndex];
    const deckKey = `${profileUser?.username || 'me'}-media-row${rowIndex}`;
    
    if (!posts || posts.length === 0) {
      return <div className="empty-column">{rowIndex === 0 ? 'No media yet' : ''}</div>;
    }
    
    const currentIndex = getDeckIndex(profileUser?.username || 'me', `media-row${rowIndex}`);
    const currentPost = posts[currentIndex] || posts[0];
    
    return (
      <>
        <div 
          className="river-card media-card"
          onClick={(e) => handleCardClick(e, currentPost)}
          style={{ cursor: 'pointer' }}
        >
          {/* Avatar header */}
          <div className="river-card-header">
            <div className="river-avatar">
              {currentPost?.author?.profile_picture ? (
                <img 
                  src={currentPost.author.profile_picture} 
                  alt={currentPost?.author?.username || profileUser?.username || 'Me'} 
                />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <span className="river-author">{currentPost?.author?.username || profileUser?.username || 'Me'}</span>
          </div>
          <div 
            className="river-card-media" 
            onClick={() => setExpandedMediaPost(currentPost)}
            title="Click to expand"
          >
            {currentPost?.media_url ? (
              <>
                <img src={currentPost.media_url} alt="" className="media-image" />
                <div className="media-expand-hint">
                  <ExpandIcon size={20} />
                </div>
              </>
            ) : (
              <div className="media-placeholder">
                <ImageIcon size={40} strokeWidth="1.5" />
              </div>
            )}
          </div>
          <div className="river-card-content">
            <p className="river-post-text">{currentPost?.content}</p>
            <span className="river-timestamp">{formatDate(currentPost?.created_at)}</span>
          </div>
          {renderPostActions(currentPost, false, 'media')}
          {renderCommentSection(currentPost, 'media')}
        </div>
        <RiverSmartDeck
          items={posts}
          deckKey={deckKey}
          currentIndex={currentIndex}
          onIndexChange={(key, idx) => handleDeckIndexChange(key, idx)}
        />
      </>
    );
  };

  // Helper to render a milestones column for a specific row
  const renderMilestonesColumn = (rowIndex) => {
    const posts = achievementRows[rowIndex];
    const deckKey = `${profileUser?.username || 'me'}-milestones-row${rowIndex}`;
    
    if (!posts || posts.length === 0) {
      return <div className="empty-column">{rowIndex === 0 ? 'No milestones yet' : ''}</div>;
    }
    
    const currentIndex = getDeckIndex(profileUser?.username || 'me', `milestones-row${rowIndex}`);
    const currentPost = posts[currentIndex] || posts[0];
    
    return (
      <>
        <div 
          className="river-card achievement-card"
          onClick={(e) => handleCardClick(e, currentPost)}
          style={{ cursor: 'pointer' }}
        >
          {/* Avatar header */}
          <div className="river-card-header">
            <div className="river-avatar">
              {currentPost?.author?.profile_picture ? (
                <img 
                  src={currentPost.author.profile_picture} 
                  alt={currentPost?.author?.username || profileUser?.username || 'Me'} 
                />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <span className="river-author">{currentPost?.author?.username || profileUser?.username || 'Me'}</span>
          </div>
          <div className="achievement-badge">
            <MilestoneIcon size={24} />
          </div>
          <div className="river-card-content">
            <p className="river-post-text">{currentPost?.content}</p>
            <span className="river-timestamp">{formatDate(currentPost?.created_at)}</span>
          </div>
          {renderPostActions(currentPost, false, 'milestones')}
          {renderCommentSection(currentPost, 'milestones')}
        </div>
        <RiverSmartDeck
          items={posts}
          deckKey={deckKey}
          currentIndex={currentIndex}
          onIndexChange={(key, idx) => handleDeckIndexChange(key, idx)}
        />
      </>
    );
  };

  return (
    <>
      {/* Mobile Category Tabs */}
      <div className="mobile-category-tabs">
        <button 
          className={`mobile-category-tab ${mobileCategory === 'thoughts' ? 'active' : ''}`}
          onClick={() => setMobileCategory('thoughts')}
        >
          <MessageBubbleIcon size={18} />
          <span>Thoughts</span>
        </button>
        <button 
          className={`mobile-category-tab ${mobileCategory === 'media' ? 'active' : ''}`}
          onClick={() => setMobileCategory('media')}
        >
          <ImageIcon size={18} />
          <span>Media</span>
        </button>
        <button 
          className={`mobile-category-tab ${mobileCategory === 'milestones' ? 'active' : ''}`}
          onClick={() => setMobileCategory('milestones')}
        >
          <MilestoneIcon size={18} />
          <span>Milestones</span>
        </button>
      </div>

      {/* River Column Labels - desktop only, hide empty categories */}
      <div className="river-labels">
        {hasThoughts && (
          <button 
            className={`river-label river-label--thoughts${collapsedDecks.has('thoughts') ? ' river-label--collapsed' : ''}${mostRecentType && mostRecentType !== 'thoughts' ? ' river-label--not-recent' : ''}`}
            onClick={() => collapsedDecks.has('thoughts') ? onExpandDeck?.('thoughts') : onCollapseDeck?.('thoughts')}
          >
            <MessageBubbleIcon size={20} />
            <span>Thoughts</span>
            <span className="river-label-count">{textPosts?.length || 0}</span>
            <span className="river-label-collapse-icon">{collapsedDecks.has('thoughts') ? '+' : '−'}</span>
          </button>
        )}
        {hasMedia && (
          <button 
            className={`river-label river-label--media${collapsedDecks.has('media') ? ' river-label--collapsed' : ''}${mostRecentType && mostRecentType !== 'media' ? ' river-label--not-recent' : ''}`}
            onClick={() => collapsedDecks.has('media') ? onExpandDeck?.('media') : onCollapseDeck?.('media')}
          >
            <ImageIcon size={20} />
            <span>Media</span>
            <span className="river-label-count">{mediaPosts?.length || 0}</span>
            <span className="river-label-collapse-icon">{collapsedDecks.has('media') ? '+' : '−'}</span>
          </button>
        )}
        {hasMilestones && (
          <button 
            className={`river-label river-label--milestones${collapsedDecks.has('milestones') ? ' river-label--collapsed' : ''}${mostRecentType && mostRecentType !== 'milestones' ? ' river-label--not-recent' : ''}`}
            onClick={() => collapsedDecks.has('milestones') ? onExpandDeck?.('milestones') : onCollapseDeck?.('milestones')}
          >
            <MilestoneIcon size={20} />
            <span>Milestones</span>
            <span className="river-label-count">{achievementPosts?.length || 0}</span>
            <span className="river-label-collapse-icon">{collapsedDecks.has('milestones') ? '+' : '−'}</span>
          </button>
        )}
      </div>

      {/* Render all rows - newest posts in first row (top) */}
      {Array.from({ length: rowCount }, (_, rowIndex) => {
        // Count visible columns (has content AND not collapsed)
        const visibleCount = [
          hasThoughts && !collapsedDecks.has('thoughts'),
          hasMedia && !collapsedDecks.has('media'),
          hasMilestones && !collapsedDecks.has('milestones')
        ].filter(Boolean).length;
        
        return (
          <div 
            key={rowIndex} 
            className={`river-streams river-row-${rowIndex} mobile-show-${mobileCategory} river-streams--expanded-${visibleCount}`}
          >
            {/* Left Stream - Thoughts (only if has posts) */}
            {hasThoughts && !collapsedDecks.has('thoughts') && (
              <div className="river-column left-stream" data-category="thoughts">
                {renderThoughtsColumn(rowIndex)}
              </div>
            )}
            
            {/* Center Stream - Media (only if has posts) */}
            {hasMedia && !collapsedDecks.has('media') && (
              <div className="river-column center-stream" data-category="media">
                {renderMediaColumn(rowIndex)}
              </div>
            )}
            
            {/* Right Stream - Milestones (only if has posts) */}
            {hasMilestones && !collapsedDecks.has('milestones') && (
              <div className="river-column right-stream" data-category="milestones">
                {renderMilestonesColumn(rowIndex)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default RiverTimelineView;
