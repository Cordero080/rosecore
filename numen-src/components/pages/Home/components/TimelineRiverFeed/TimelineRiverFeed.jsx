/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    [ ARCHITECTURAL SIGNATURE ]                               ║
 * ║   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀   ║
 * ║   RIVER TIMELINE PROTOCOL v1.0                                               ║
 * ║   ─────────────────────────────────────────────────────────────────────────  ║
 * ║                                                                              ║
 * ║   Designed & Authored by: Pablo Cordero                                      ║
 * ║   With contributions from: Colin Weir, Crystal Ruiz, Natalia Pricop, Tito    ║
 * ║                                                                              ║
 * ║   This module implements the RIVER TIMELINE architecture—a proprietary       ║
 * ║   3-column feed design that groups posts into parallel streams.              ║
 * ║   Logic belongs to the creator.                                              ║
 * ║                                                                              ║
 * ║   ⚠️  NOTICE: Unauthorized replication, modification, or commercial use      ║
 * ║       of this River Timeline protocol is prohibited under CC BY-NC-ND 4.0   ║
 * ║                                                                              ║
 * ║   © 2026 NUMENEON Contributors. All Rights Reserved.                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// 🔵 PABLO - UI/Styling | 🟢 COLIN + 🟠 TITO - Posts Data Logic
// TimelineRiverFeed.jsx - Main timeline feed with 3-column river layout
//
// ROW-CHUNKING: Posts are chunked into rows of max 12 per category.
// When a category overflows (e.g., 13 thoughts), the overflow goes to a NEW row.
// Categories that haven't overflowed stay together in the original row.

import { groupPostsByUser, sortGroupedPosts } from '@components/pages/Home/utils/groupPosts';
import TimelineRiverRow from '../TimelineRiverRow';
import { MessageBubbleIcon, ClockIcon } from '@assets/icons';
import { useAuth } from '@contexts';
import './TimelineRiverFeed.scss';

const CAROUSEL_LIMIT = 12;
// ↑ Max posts per category per row — design decision

/**
 * Chunk posts into groups of max CAROUSEL_LIMIT (12)
 * Newest posts in first chunk, older in subsequent chunks
 */
const chunkPostsIntoRows = (posts) => {
  // GUARD 1: No posts? Return one empty row
  if (!posts || posts.length === 0) return [[]];
  if (posts.length <= CAROUSEL_LIMIT) return [posts];// GUARD 2: 12 or fewer? No splitting needed — return as single row


  // MORE THAN 12 — need to split
  const rows = [];
  const totalPosts = posts.length;
  const remainder = totalPosts % CAROUSEL_LIMIT;
  // e.g. 13 % 12 = 1
  // IF there's leftover ↑ modulo gives us the "leftover" after dividing by 12
  if (remainder > 0) {
    // FIRST ROW: gets the remainder (the newest posts)
    rows.push(posts.slice(0, remainder));
    // ↑ posts.slice(0, 1) → grabs posts at index 0 up to (not including) index 1
    // since new post gets pushed to the front of array in PostsContext logic

    // REMAINING ROWS: get 12 each
    // i=1 start when the first row ends
    // keep going while i < totalPosts(13)
    for (let i = remainder; i < totalPosts; i += CAROUSEL_LIMIT) {
      rows.push(posts.slice(i, i + CAROUSEL_LIMIT));
      // ↑ posts.slice(1, 13) → grabs posts at index 1 through 12 to fill up the row that was left
    }
  } else {
    // EVENLY DIVISIBLE (e.g. 24 posts)
    for (let i = 0; i < totalPosts; i += CAROUSEL_LIMIT) {
      rows.push(posts.slice(i, i + CAROUSEL_LIMIT));
      // we
    }
  }
  
  return rows;
};

/**
 * Split a user's grouped data into multiple rows if ANY category exceeds 12 posts,
 * OR if some categories hit exactly 12 while others haven't.
 * 
 * KEY DESIGN:
 * - Categories at exactly 12 (maxed) group together in their own row
 * - Categories below 12 (incomplete) start on a NEW row
 * - Categories that overflow (13+) split normally across rows
 * 
 * Example: 12 thoughts, 12 media, 7 milestones
 *   Row 0: thoughts[all 12], media[all 12]  ← maxed categories together
 *   Row 1: milestones[all 7]                ← incomplete starts new row
 * 
 * Example: 13 thoughts, 5 media, 3 milestones
 *   Row 0: thoughts[0]                      ← overflow only
 *   Row 1: thoughts[1-12], media[all], milestones[all] ← rest together
 */
const splitGroupIntoRows = (groupData) => {
  const { user, thoughts = [], media = [], milestones = [] } = groupData;
  
  const categories = [
    { name: 'thoughts', posts: thoughts },
    { name: 'media', posts: media },
    { name: 'milestones', posts: milestones },
  ];
  
  // Calculate how many rows we need based on the LARGEST category
  const maxCategoryLength = Math.max(thoughts.length, media.length, milestones.length);
  
  // Check if any category is exactly maxed (at 12) while others are incomplete
  const hasMaxedCategories = categories.some(c => c.posts.length === CAROUSEL_LIMIT);
  const hasIncompleteCategories = categories.some(c => c.posts.length > 0 && c.posts.length < CAROUSEL_LIMIT);
  const needsSplitForMaxed = hasMaxedCategories && hasIncompleteCategories && maxCategoryLength <= CAROUSEL_LIMIT;
  
  // Simple case: no overflow AND no maxed/incomplete split needed
  if (maxCategoryLength <= CAROUSEL_LIMIT && !needsSplitForMaxed) {
    return [{
      user,
      thoughts,
      media,
      milestones,
      rowIndex: 0,
    }];
  }
  
  // SPECIAL CASE: Some categories at exactly 12, others incomplete
  // Split into: Row 0 = maxed categories, Row 1 = incomplete categories
  if (needsSplitForMaxed) {
    const maxedRow = {
      user,
      thoughts: thoughts.length === CAROUSEL_LIMIT ? thoughts : [],
      media: media.length === CAROUSEL_LIMIT ? media : [],
      milestones: milestones.length === CAROUSEL_LIMIT ? milestones : [],
      rowIndex: 0,
    };
    
    const incompleteRow = {
      user,
      thoughts: thoughts.length > 0 && thoughts.length < CAROUSEL_LIMIT ? thoughts : [],
      media: media.length > 0 && media.length < CAROUSEL_LIMIT ? media : [],
      milestones: milestones.length > 0 && milestones.length < CAROUSEL_LIMIT ? milestones : [],
      rowIndex: 1,
    };
    
    // Only include rows that have content
    const rows = [];
    if (maxedRow.thoughts.length || maxedRow.media.length || maxedRow.milestones.length) {
      rows.push(maxedRow);
    }
    if (incompleteRow.thoughts.length || incompleteRow.media.length || incompleteRow.milestones.length) {
      rows.push({ ...incompleteRow, rowIndex: rows.length });
    }
    
    return rows;
  }
  
  // OVERFLOW CASE: Calculate row count based on largest category
  const rowCount = Math.ceil(maxCategoryLength / CAROUSEL_LIMIT);
  
  // Helper: chunk a single category's posts aligned to global row structure
  // Categories that OVERFLOW: Row 0 = remainder (newest), subsequent rows = 12 each
  // Categories that DON'T overflow: All posts go to LAST row (aligned with original content)
  const chunkAligned = (posts, totalRows) => {
    if (!posts || posts.length === 0) {
      return Array(totalRows).fill([]);
    }
    
    // Categories that haven't overflowed go to the LAST row
    if (posts.length <= CAROUSEL_LIMIT) {
      const chunks = Array(totalRows - 1).fill([]);
      chunks.push(posts);
      return chunks;
    }
    
    // OVERFLOW case: chunk normally (remainder/newest in Row 0, then 12 each)
    const chunks = [];
    const remainder = posts.length % CAROUSEL_LIMIT;
    
    if (remainder > 0) {
      chunks.push(posts.slice(0, remainder));
      for (let i = remainder; i < posts.length; i += CAROUSEL_LIMIT) {
        chunks.push(posts.slice(i, i + CAROUSEL_LIMIT));
      }
    } else {
      for (let i = 0; i < posts.length; i += CAROUSEL_LIMIT) {
        chunks.push(posts.slice(i, i + CAROUSEL_LIMIT));
      }
    }
    
    while (chunks.length < totalRows) {
      chunks.push([]);
    }
    
    return chunks;
  };
  
  // Chunk each category aligned to the same row structure
  const thoughtChunks = chunkAligned(thoughts, rowCount);
  const mediaChunks = chunkAligned(media, rowCount);
  const milestoneChunks = chunkAligned(milestones, rowCount);
  
  // Build rows
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push({
      user,
      thoughts: thoughtChunks[i] || [],
      media: mediaChunks[i] || [],
      milestones: milestoneChunks[i] || [],
      rowIndex: i,
    });
  }
  
  return rows;
};


import { useMemo } from 'react';

function TimelineRiverFeed(props) {
  const {
    posts,
    activeCommentPostId,
    setActiveCommentPostId,
    commentText,
    setCommentText,
    onDeletePost,
    onUpdatePost,
  } = props;

  // Get current user for profile picture matching
  const { user: currentUser } = useAuth();

  // Memoize grouped and sorted posts for performance
  const groupedAndSortedPosts = useMemo(() => {
    const grouped = groupPostsByUser(posts, currentUser);
    return sortGroupedPosts(grouped);
  }, [posts, currentUser]);

  // Handle comment toggle (open/close comment box)
  const handleCommentClick = (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      setCommentText('');
    } else {
      setActiveCommentPostId(postId);
      setCommentText('');
    }
  };

  // Empty state: Show message if no posts
  if (!posts || posts.length === 0) {
    return (
      <div className="timeline-river-empty">
        <MessageBubbleIcon size={48} />
        <p>No posts yet. Be the first to share!</p>
      </div>
    );
  }

  // Main render: Loop through grouped posts
  return (
    <div className="timeline-river-feed">
      <div className="timeline-canopy"></div>
      {groupedAndSortedPosts.map(({ date, orderId, data }) => {
        const rowDataArray = splitGroupIntoRows(data);
        return (
          <div key={orderId} className="timeline-river-section">
            <div className="river-date-header">
              <div className="river-date-badge">
                <ClockIcon size={16} />
                Last active: {new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="river-divider"></div>
            </div>
            {rowDataArray.map((rowData, rowIndex) => (
              <TimelineRiverRow
                key={`${orderId}-row-${rowIndex}`}
                rowData={rowData}
                onCommentClick={handleCommentClick}
                activeCommentPostId={activeCommentPostId}
                commentText={commentText}
                setCommentText={setCommentText}
                setActiveCommentPostId={setActiveCommentPostId}
                onDeletePost={onDeletePost}
                onUpdatePost={onUpdatePost}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default TimelineRiverFeed;
