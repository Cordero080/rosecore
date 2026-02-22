// 🔵 PABLO - UI/Styling
// RiverFeedView.jsx - Feed mode view for friends' posts
//
// ROW-CHUNKING DESIGN: Each friend's posts are chunked into rows of max 12.
// If a friend has 15 thoughts, they get 2 rows: [3 newest] then [12 older].
// This prevents prolific users from dominating the feed with scattered posts.
//
// PER-FRIEND COLLAPSE: Each friend row has its own collapsed state (not global)

import React, { useState, useCallback } from 'react';
import './RiverFeedView.scss';
import {
  MessageBubbleIcon,
  ImageIcon,
  MilestoneIcon,
} from '@assets/icons';
import RiverSmartDeck from '../RiverSmartDeck';

const CAROUSEL_LIMIT = 12;

/**
 * Chunk a single category's posts aligned to a specified row count.
 * Row 0 gets the remainder (newest), subsequent rows get 12 each.
 * Empty arrays fill rows where this category has no posts.
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
 * Split a friend's posts into aligned rows.
 * KEY DESIGN: When ANY category hits 12+, ALL categories get aligned to the same row count.
 * This keeps newest posts synchronized across all types in Row 0.
 */
const splitFriendIntoRows = (friend) => {
  const { thoughts = [], media = [], milestones = [] } = friend;
  
  // Calculate max category length to determine row count
  const maxCategoryLength = Math.max(thoughts.length, media.length, milestones.length);
  
  // Single row if nothing exceeds limit
  if (maxCategoryLength <= CAROUSEL_LIMIT) {
    return {
      thoughtRows: thoughts.length > 0 ? [thoughts] : [],
      mediaRows: media.length > 0 ? [media] : [],
      milestoneRows: milestones.length > 0 ? [milestones] : [],
      rowCount: 1
    };
  }
  
  // Multiple rows needed - align all categories
  const rowCount = Math.ceil(maxCategoryLength / CAROUSEL_LIMIT);
  
  return {
    thoughtRows: chunkPostsAligned(thoughts, rowCount),
    mediaRows: chunkPostsAligned(media, rowCount),
    milestoneRows: chunkPostsAligned(milestones, rowCount),
    rowCount
  };
};

/**
 * Determine which category has the most recent post within a row
 */
const getMostRecentTypeForRow = (thoughtsRow, mediaRow, milestonesRow) => {
  const getLatestTimestamp = (posts) => {
    if (!posts || posts.length === 0) return 0;
    return Math.max(...posts.map(p => new Date(p.created_at || 0).getTime()));
  };
  
  const timestamps = {
    thoughts: getLatestTimestamp(thoughtsRow),
    media: getLatestTimestamp(mediaRow),
    milestones: getLatestTimestamp(milestonesRow)
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
    if (thoughtsRow && thoughtsRow.length > 0) return 'thoughts';
    if (mediaRow && mediaRow.length > 0) return 'media';
    if (milestonesRow && milestonesRow.length > 0) return 'milestones';
  }
  
  return mostRecent;
};

function RiverFeedView({
  friendsGrouped,
  mobileCategory,
  setMobileCategory,
  getDeckIndex,
  handleDeckIndexChange,
  navigate,
  renderPostActions,
  renderCommentSection,
  formatDate,
  onCardClick,
  // Note: We ignore the global collapsedDecks - each friend row manages its own
}) {
  // Per-friend collapsed state: Map of "username-rowIndex" -> Set of collapsed types
  const [friendCollapsedDecks, setFriendCollapsedDecks] = useState(new Map());
  
  // Get collapsed set for a specific friend row
  const getCollapsedForRow = useCallback((username, rowIndex) => {
    const key = `${username}-row${rowIndex}`;
    return friendCollapsedDecks.get(key) || new Set();
  }, [friendCollapsedDecks]);
  
  // Collapse a category for a specific friend row
  const handleCollapseForRow = useCallback((username, rowIndex, type) => {
    const key = `${username}-row${rowIndex}`;
    setFriendCollapsedDecks(prev => {
      const newMap = new Map(prev);
      const currentSet = newMap.get(key) || new Set();
      const newSet = new Set(currentSet);
      newSet.add(type);
      newMap.set(key, newSet);
      return newMap;
    });
  }, []);
  
  // Expand a category for a specific friend row
  const handleExpandForRow = useCallback((username, rowIndex, type) => {
    const key = `${username}-row${rowIndex}`;
    setFriendCollapsedDecks(prev => {
      const newMap = new Map(prev);
      const currentSet = newMap.get(key) || new Set();
      const newSet = new Set(currentSet);
      newSet.delete(type);
      newMap.set(key, newSet);
      return newMap;
    });
  }, []);
  
  // Handle card click - don't trigger on interactive elements
  const handleCardClick = (e, post) => {
    if (e.target.closest('button') || 
        e.target.closest('.river-post-actions') ||
        e.target.closest('.river-card-media') ||
        e.target.closest('.river-card-author') ||
        e.target.closest('.inline-comment-composer') ||
        e.target.closest('.thread-view')) {
      return;
    }
    onCardClick?.(post);
  };
  
  // Pre-process friends to chunk their posts into aligned rows
  // KEY: When ANY category exceeds 12, ALL categories align to same row count
  const friendsWithRows = friendsGrouped.map(friend => ({
    ...friend,
    ...splitFriendIntoRows(friend)
  }));

  // Render a thought column for a friend at a specific row
  const renderFriendThoughts = (friend, rowIndex) => {
    const posts = friend.thoughtRows[rowIndex];
    const deckKey = `${friend.username}-thoughts-row${rowIndex}`;
    
    if (!posts || posts.length === 0) {
      return null; // Don't render empty columns
    }
    
    const currentIndex = getDeckIndex(friend.username, `thoughts-row${rowIndex}`);
    const currentPost = posts[currentIndex] || posts[0];
    
    return (
      <div className="river-column-wrapper">
        <div 
          className="river-card text-card"
          onClick={(e) => handleCardClick(e, currentPost)}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="river-card-author clickable-friend"
            onClick={() => navigate(`/profile/${friend.username}`)}
            title={`View ${friend.username}'s profile`}
          >
            <div className="friend-avatar">{friend.avatar}</div>
            <span className="friend-name">{friend.username}</span>
          </div>
          <div className="river-card-content">
            <p className="river-post-text">{currentPost?.content}</p>
            <span className="river-timestamp">{formatDate(currentPost?.created_at)}</span>
          </div>
          {renderPostActions(currentPost, true, 'thoughts')}
          {renderCommentSection(currentPost, 'thoughts')}
        </div>
        <RiverSmartDeck
          items={posts}
          deckKey={deckKey}
          currentIndex={currentIndex}
          onIndexChange={handleDeckIndexChange}
        />
      </div>
    );
  };

  // Render a media column for a friend at a specific row
  const renderFriendMedia = (friend, rowIndex) => {
    const posts = friend.mediaRows[rowIndex];
    const deckKey = `${friend.username}-media-row${rowIndex}`;
    
    if (!posts || posts.length === 0) {
      return null; // Don't render empty columns
    }
    
    const currentIndex = getDeckIndex(friend.username, `media-row${rowIndex}`);
    const currentPost = posts[currentIndex] || posts[0];
    
    return (
      <div className="river-column-wrapper">
        <div 
          className="river-card media-card"
          onClick={(e) => handleCardClick(e, currentPost)}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="river-card-author clickable-friend"
            onClick={() => navigate(`/profile/${friend.username}`)}
            title={`View ${friend.username}'s profile`}
          >
            <div className="friend-avatar">{friend.avatar}</div>
            <span className="friend-name">{friend.username}</span>
          </div>
          <div className="river-card-media">
            {currentPost?.media_url ? (
              <img src={currentPost.media_url} alt="" className="media-image" />
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
          {renderPostActions(currentPost, true, 'media')}
          {renderCommentSection(currentPost, 'media')}
        </div>
        <RiverSmartDeck
          items={posts}
          deckKey={deckKey}
          currentIndex={currentIndex}
          onIndexChange={handleDeckIndexChange}
        />
      </div>
    );
  };

  // Render a milestone column for a friend at a specific row
  const renderFriendMilestones = (friend, rowIndex) => {
    const posts = friend.milestoneRows[rowIndex];
    const deckKey = `${friend.username}-milestones-row${rowIndex}`;
    
    if (!posts || posts.length === 0) {
      return null; // Don't render empty columns
    }
    
    const currentIndex = getDeckIndex(friend.username, `milestones-row${rowIndex}`);
    const currentPost = posts[currentIndex] || posts[0];
    
    return (
      <div className="river-column-wrapper">
        <div 
          className="river-card achievement-card"
          onClick={(e) => handleCardClick(e, currentPost)}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="river-card-author clickable-friend"
            onClick={() => navigate(`/profile/${friend.username}`)}
            title={`View ${friend.username}'s profile`}
          >
            <div className="friend-avatar">{friend.avatar}</div>
            <span className="friend-name">{friend.username}</span>
          </div>
          <div className="river-card-content">
            <p className="river-post-text">{currentPost?.content}</p>
            <span className="river-timestamp">{formatDate(currentPost?.created_at)}</span>
          </div>
          {renderPostActions(currentPost, true, 'milestones')}
          {renderCommentSection(currentPost, 'milestones')}
        </div>
        <RiverSmartDeck
          items={posts}
          deckKey={deckKey}
          currentIndex={currentIndex}
          onIndexChange={handleDeckIndexChange}
        />
      </div>
    );
  };

  return (
    <div className="friends-feed-rows">
      {/* Mobile Category Tabs for Friends Feed */}
      <div className="mobile-category-tabs friends-feed-tabs">
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

      {/* Render each friend's rows */}
      {friendsWithRows.map((friend) => {
        return (
          <div key={friend.username} className="friend-row-group">
            {Array.from({ length: friend.rowCount }, (_, rowIndex) => {
              // Get collapsed state for THIS specific friend row
              const rowCollapsed = getCollapsedForRow(friend.username, rowIndex);
              
              // Calculate column count for this specific row (respecting per-friend collapsed state)
              const hasThoughts = friend.thoughtRows[rowIndex]?.length > 0 && !rowCollapsed.has('thoughts');
              const hasMedia = friend.mediaRows[rowIndex]?.length > 0 && !rowCollapsed.has('media');
              const hasMilestones = friend.milestoneRows[rowIndex]?.length > 0 && !rowCollapsed.has('milestones');
              const expandedCount = [hasThoughts, hasMedia, hasMilestones].filter(Boolean).length;
              
              // Original counts for display (before collapse filtering)
              const originalHasThoughts = friend.thoughtRows[rowIndex]?.length > 0;
              const originalHasMedia = friend.mediaRows[rowIndex]?.length > 0;
              const originalHasMilestones = friend.milestoneRows[rowIndex]?.length > 0;
              
              // Get counts and positions for THIS row
              const thoughtsInRow = friend.thoughtRows[rowIndex]?.length || 0;
              const mediaInRow = friend.mediaRows[rowIndex]?.length || 0;
              const milestonesInRow = friend.milestoneRows[rowIndex]?.length || 0;
              
              const thoughtsPosition = getDeckIndex(friend.username, `thoughts-row${rowIndex}`) + 1;
              const mediaPosition = getDeckIndex(friend.username, `media-row${rowIndex}`) + 1;
              const milestonesPosition = getDeckIndex(friend.username, `milestones-row${rowIndex}`) + 1;
              
              // Determine which category is most recent in this row
              const mostRecentType = getMostRecentTypeForRow(
                friend.thoughtRows[rowIndex],
                friend.mediaRows[rowIndex],
                friend.milestoneRows[rowIndex]
              );
              
              return (
                <div key={`${friend.username}-row-${rowIndex}`} className="friend-row">
                  {/* River Column Labels - all same size, collapsed greyed out, non-recent dimmed */}
                  <div className="river-labels">
                    <button 
                      className={`river-label river-label--thoughts${rowCollapsed.has('thoughts') ? ' river-label--collapsed' : ''}${mostRecentType && mostRecentType !== 'thoughts' ? ' river-label--not-recent' : ''}`}
                      onClick={() => rowCollapsed.has('thoughts') 
                        ? handleExpandForRow(friend.username, rowIndex, 'thoughts') 
                        : handleCollapseForRow(friend.username, rowIndex, 'thoughts')}
                    >
                      <MessageBubbleIcon size={20} />
                      <span>Thoughts</span>
                      <span className="river-label-count">{thoughtsInRow}</span>
                      <span className="river-label-collapse-icon">{rowCollapsed.has('thoughts') ? '+' : '−'}</span>
                    </button>
                    <button 
                      className={`river-label river-label--media${rowCollapsed.has('media') ? ' river-label--collapsed' : ''}${mostRecentType && mostRecentType !== 'media' ? ' river-label--not-recent' : ''}`}
                      onClick={() => rowCollapsed.has('media') 
                        ? handleExpandForRow(friend.username, rowIndex, 'media') 
                        : handleCollapseForRow(friend.username, rowIndex, 'media')}
                    >
                      <ImageIcon size={20} />
                      <span>Media</span>
                      <span className="river-label-count">{mediaInRow}</span>
                      <span className="river-label-collapse-icon">{rowCollapsed.has('media') ? '+' : '−'}</span>
                    </button>
                    <button 
                      className={`river-label river-label--milestones${rowCollapsed.has('milestones') ? ' river-label--collapsed' : ''}${mostRecentType && mostRecentType !== 'milestones' ? ' river-label--not-recent' : ''}`}
                      onClick={() => rowCollapsed.has('milestones') 
                        ? handleExpandForRow(friend.username, rowIndex, 'milestones') 
                        : handleCollapseForRow(friend.username, rowIndex, 'milestones')}
                    >
                      <MilestoneIcon size={20} />
                      <span>Milestones</span>
                      <span className="river-label-count">{milestonesInRow}</span>
                      <span className="river-label-collapse-icon">{rowCollapsed.has('milestones') ? '+' : '−'}</span>
                    </button>
                  </div>
                  
                  <div className={`river-streams river-streams--expanded-${expandedCount} mobile-show-${mobileCategory}`}>
                    {/* Left Stream - Thoughts */}
                    {hasThoughts && (
                      <div className="river-column left-stream" data-category="thoughts">
                        {renderFriendThoughts(friend, rowIndex)}
                      </div>
                    )}

                    {/* Center Stream - Media */}
                    {hasMedia && (
                      <div className="river-column center-stream" data-category="media">
                        {renderFriendMedia(friend, rowIndex)}
                      </div>
                    )}

                    {/* Right Stream - Milestones */}
                    {hasMilestones && (
                      <div className="river-column right-stream" data-category="milestones">
                        {renderFriendMilestones(friend, rowIndex)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default RiverFeedView;
