// 🔵 PABLO - UI/Styling | 🟡 NATALIA - User Posts Data
// TimelineRiver.jsx - Profile timeline showing user's posts in river format

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './TimelineRiver.scss';
import {
  CloseIcon,
  CheckIcon,
  EditIcon,
} from '@assets/icons';
import DeleteConfirmModal from '@Home/components/DeleteConfirmModal/DeleteConfirmModal';
import MediaLightbox from '@Home/components/MediaLightbox/MediaLightbox';
import { usePosts, useMessages, useAuth } from '@contexts';
import { RiverPostActions, RiverSmartDeck, RiverComposer, RiverThread, RiverTimelineView, RiverFeedView } from './components';

// Helper to format dates nicely
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to determine which category has the most recent post
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
  
  let mostRecent = 'thoughts'; // fallback default
  let maxTime = 0;
  for (const [type, time] of Object.entries(timestamps)) {
    if (time > maxTime) {
      maxTime = time;
      mostRecent = type;
    }
  }
  return mostRecent;
};

function TimelineRiver({ 
  viewMode, 
  textPosts: textPostsProps, 
  mediaPosts: mediaPostsProps, 
  achievementPosts: achievementPostsProps,
  feedTextPosts,
  feedMediaPosts,
  feedAchievementPosts,
  onDeletePost,
  onUpdatePost,
  isOwnProfile = true, // Default to own profile for backwards compatibility
  profileUser // The user whose profile we're viewing
}) {
  // Get likePost and reply functions from context
  const { posts: allPosts, likePost, createReply, fetchReplies, updatePost: updateReply, deletePost: deleteReply, collapsedDecks, collapseDeck, expandDeck } = usePosts();
  const { openMessages } = useMessages(); // For DM button on friend posts
  const { user: currentUser } = useAuth(); // For checking if user owns a comment
  const navigate = useNavigate(); // For navigating to user profiles
  
  // Get fresh post data from context (props may have stale snapshots)
  const getFreshPost = (postId) => allPosts.find(p => p.id === postId);
  
  // Map prop posts to fresh versions from context
  const textPosts = (textPostsProps || []).map(p => getFreshPost(p.id) || p);
  const mediaPosts = (mediaPostsProps || []).map(p => getFreshPost(p.id) || p);
  const achievementPosts = (achievementPostsProps || []).map(p => getFreshPost(p.id) || p);
  
  // Helper to get initials from author
  const getInitials = (author) => {
    if (!author) return '??';
    const first = author.first_name?.[0] || '';
    const last = author.last_name?.[0] || '';
    if (first && last) return `${first}${last}`.toUpperCase();
    if (first) return first.toUpperCase();
    if (author.username) return author.username.slice(0, 2).toUpperCase();
    return '??';
  };
  
  // Group friends' posts by username for feed mode
  const friendsGrouped = useMemo(() => {
    if (viewMode !== 'feed') return [];
    
    // Combine all friends posts
    const allFriendsPosts = [...(feedTextPosts || []), ...(feedMediaPosts || []), ...(feedAchievementPosts || [])];
    
    // Group by username
    const grouped = {};
    allFriendsPosts.forEach(post => {
      const username = post.author?.username || 'unknown';
      if (!grouped[username]) {
        grouped[username] = {
          username,
          avatar: getInitials(post.author),
          thoughts: [],
          media: [],
          milestones: []
        };
      }
      if (post.type === 'thoughts') grouped[username].thoughts.push(post);
      else if (post.type === 'media') grouped[username].media.push(post);
      else if (post.type === 'milestones') grouped[username].milestones.push(post);
    });
    
    return Object.values(grouped);
  }, [viewMode, feedTextPosts, feedMediaPosts, feedAchievementPosts]);

  // State for inline comment composer
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  // State for thread/replies
  const [expandedThreadId, setExpandedThreadId] = useState(null);
  const [threadReplies, setThreadReplies] = useState({});
  const [loadingThread, setLoadingThread] = useState(null);
  const [showAllReplies, setShowAllReplies] = useState({});
  
  // State for editing replies
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');
  const [editingReplyParentId, setEditingReplyParentId] = useState(null);
  
  // State for edit/delete
  const [deleteModalPostId, setDeleteModalPostId] = useState(null);
  const [deleteModalIsReply, setDeleteModalIsReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [isComposerFullPage, setIsComposerFullPage] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for media lightbox
  const [expandedMediaPost, setExpandedMediaPost] = useState(null);

  // State for mobile category tabs - initialized to most recent post type
  const [mobileCategory, setMobileCategory] = useState('thoughts');
  const [hasInitializedMobileCategory, setHasInitializedMobileCategory] = useState(false);
  
  // Initialize mobile category to most recent post type (only once on mount/data load)
  useEffect(() => {
    if (!hasInitializedMobileCategory) {
      // For timeline view (own profile)
      if (viewMode === 'timeline') {
        const mostRecent = getMostRecentType(textPosts, mediaPosts, achievementPosts);
        if (mostRecent) {
          setMobileCategory(mostRecent);
          setHasInitializedMobileCategory(true);
        }
      }
      // For feed view (friends)
      else if (viewMode === 'feed') {
        const allFeedPosts = [...(feedTextPosts || []), ...(feedMediaPosts || []), ...(feedAchievementPosts || [])];
        if (allFeedPosts.length > 0) {
          // Find the most recent post across all friends
          const feedThoughts = feedTextPosts || [];
          const feedMedia = feedMediaPosts || [];
          const feedMilestones = feedAchievementPosts || [];
          const mostRecent = getMostRecentType(feedThoughts, feedMedia, feedMilestones);
          if (mostRecent) {
            setMobileCategory(mostRecent);
            setHasInitializedMobileCategory(true);
          }
        }
      }
    }
  }, [viewMode, textPosts, mediaPosts, achievementPosts, feedTextPosts, feedMediaPosts, feedAchievementPosts, hasInitializedMobileCategory]);
  
  // Heart animation state - tracks which post ID is animating
  const [animatingHeartId, setAnimatingHeartId] = useState(null);

  // Deck index for carousel - per friend, per type
  const [deckIndices, setDeckIndices] = useState({});
  
  // Collapsed decks state - now from context (shared across pages)
  // Handlers: collapseDeck, expandDeck from usePosts()

  const getDeckIndex = (username, type) => {
    return deckIndices[`${username}-${type}`] || 0;
  };

  // Handler for SmartDeck index changes
  const handleDeckIndexChange = (key, index) => {
    setDeckIndices(prev => ({ ...prev, [key]: index }));
  };

  // Handler for like with animation
  const handleLike = async (postId) => {
    setAnimatingHeartId(postId);
    setTimeout(() => setAnimatingHeartId(null), 300);
    await likePost(postId);
  };

  // Handler for edit button
  const handleEdit = (post) => {
    // Clear any existing comment state first
    setActiveCommentPostId(null);
    // Then set edit state
    setEditingPostId(post.id);
    setCommentText(post.content);
    setIsEditMode(true);
    setIsComposerFullPage(true);
  };

  // Handler for card click - opens expanded view with comments
  const handleCardClick = async (post) => {
    setActiveCommentPostId(post.id);
    setIsComposerFullPage(true);
    setIsEditMode(false);
    // Fetch replies if not already loaded
    if (!threadReplies[post.id]) {
      setLoadingThread(post.id);
      const result = await fetchReplies(post.id);
      if (result.success) {
        setThreadReplies(prev => ({ ...prev, [post.id]: result.data }));
      }
      setLoadingThread(null);
    }
  };

  // Handler for delete button
  const handleDelete = (postId) => {
    setDeleteModalPostId(postId);
  };

  const handleCommentClick = (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      setCommentText('');
    } else {
      setActiveCommentPostId(postId);
      setCommentText('');
    }
  };

  // Toggle thread view and fetch replies
  const toggleThread = async (postId) => {
    if (expandedThreadId === postId) {
      setExpandedThreadId(null);
    } else {
      setExpandedThreadId(postId);
      // Fetch replies if not already loaded
      if (!threadReplies[postId]) {
        setLoadingThread(postId);
        const result = await fetchReplies(postId);
        if (result.success) {
          setThreadReplies(prev => ({ ...prev, [postId]: result.data }));
        }
        setLoadingThread(null);
      }
    }
  };

  // Handle comment/reply submission
  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;
    
    const result = await createReply(postId, { content: commentText.trim(), type: 'thoughts' });
    if (result.success) {
      // Add new reply to local state
      setThreadReplies(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), result.data]
      }));
      setCommentText('');
      setActiveCommentPostId(null);
      // Auto-expand thread to show new reply
      setExpandedThreadId(postId);
    }
  };

  // Handle reply to comment (with @mention)
  const handleReplyToComment = async (postId, replyData) => {
    // replyData contains: content, mentioned_user_id, mentioned_username, parent_comment_id
    const result = await createReply(postId, { 
      content: replyData.content, 
      type: 'thoughts'
    });
    if (result.success) {
      // Add new reply to local state - immediate UI update
      setThreadReplies(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), result.data]
      }));
      setExpandedThreadId(postId);
      return true;
    }
    return false;
  };

  // Handle editing a reply
  const handleEditReply = async (replyId, parentPostId) => {
    if (!editingReplyContent.trim()) return;
    
    const result = await updateReply(replyId, { content: editingReplyContent.trim() });
    if (result.success) {
      // Update reply in local state
      setThreadReplies(prev => ({
        ...prev,
        [parentPostId]: (prev[parentPostId] || []).map(reply =>
          reply.id === replyId ? { ...reply, content: editingReplyContent.trim() } : reply
        )
      }));
      setEditingReplyId(null);
      setEditingReplyContent('');
      setEditingReplyParentId(null);
    }
  };

  // Format relative time for replies
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Render comment section using extracted components
  const renderCommentSection = (post, postType = 'thoughts') => {
    if (!post) return null;
    
    return (
      <>
        {/* Composer (inline + full-page) */}
        <RiverComposer
          post={post}
          postType={postType}
          isOpen={activeCommentPostId === post.id}
          isFullPage={isComposerFullPage}
          isEditMode={isEditMode}
          commentText={commentText}
          setCommentText={setCommentText}
          threadReplies={threadReplies[post.id] || []}
          onSubmit={() => handleCommentSubmit(post.id)}
          onClose={() => {
            setIsComposerFullPage(false);
            setIsEditMode(false);
            setActiveCommentPostId(null);
            setCommentText('');
          }}
          onExpand={() => setIsComposerFullPage(true)}
          onSaveEdit={async () => {
            if (commentText.trim() && editingPostId && onUpdatePost) {
              setIsSaving(true);
              try {
                await onUpdatePost(editingPostId, { content: commentText.trim() });
                setIsComposerFullPage(false);
                setIsEditMode(false);
                setEditingPostId(null);
                setCommentText('');
              } finally {
                setIsSaving(false);
              }
            }
          }}
          onLike={handleLike}
          formatRelativeTime={formatRelativeTime}
          isSaving={isSaving}
        />

        {/* Thread view (collapsed/expanded replies) */}
        <RiverThread
          post={post}
          postType={post.type}
          isExpanded={expandedThreadId === post.id}
          replies={threadReplies[post.id] || []}
          isLoading={loadingThread === post.id}
          showAllReplies={showAllReplies[post.id]}
          currentUserId={currentUser?.id}
          editingReplyId={editingReplyId}
          editingReplyContent={editingReplyContent}
          formatRelativeTime={formatRelativeTime}
          onToggleThread={toggleThread}
          onShowMore={(postId) => setShowAllReplies(prev => ({ ...prev, [postId]: true }))}
          onEditStart={(replyId, content, parentId) => {
            setEditingReplyId(replyId);
            setEditingReplyContent(content);
            setEditingReplyParentId(parentId);
          }}
          onEditChange={setEditingReplyContent}
          onEditSave={handleEditReply}
          onEditCancel={() => {
            setEditingReplyId(null);
            setEditingReplyContent('');
          }}
          onDelete={(replyId, parentId) => {
            setDeleteModalPostId(replyId);
            setDeleteModalIsReply(true);
            setEditingReplyParentId(parentId);
          }}
          onReplyToComment={handleReplyToComment}
        />
      </>
    );
  };

  // Render action buttons using extracted component
  const renderPostActions = (post, isFriendView = false, postType = 'thoughts') => {
    if (!post) return null;
    
    // User can edit/delete if:
    // 1. It's their own profile (isOwnProfile) OR
    // 2. They are the author of this specific post (for wall posts on friend's profile)
    const isPostAuthor = post.author?.id === currentUser?.id || 
                         post.author?.username === currentUser?.username;
    const canEditDelete = !isFriendView && (isOwnProfile || isPostAuthor);
    
    return (
      <RiverPostActions
        post={post}
        postType={postType}
        isOwnProfile={canEditDelete}
        animatingHeartId={animatingHeartId}
        onLike={handleLike}
        onComment={handleCommentClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMessage={openMessages}
      />
    );
  };

  return (
    <div className="timeline-river">
      {/* MY TIMELINE MODE - User's own posts */}
      {viewMode === 'timeline' && (
        <RiverTimelineView
          textPosts={textPosts}
          mediaPosts={mediaPosts}
          achievementPosts={achievementPosts}
          profileUser={profileUser}
          mobileCategory={mobileCategory}
          setMobileCategory={setMobileCategory}
          getDeckIndex={getDeckIndex}
          handleDeckIndexChange={handleDeckIndexChange}
          setExpandedMediaPost={setExpandedMediaPost}
          renderPostActions={renderPostActions}
          renderCommentSection={renderCommentSection}
          formatDate={formatDate}
          onCardClick={handleCardClick}
          collapsedDecks={collapsedDecks}
          onCollapseDeck={collapseDeck}
          onExpandDeck={expandDeck}
        />
      )}

      {/* FRIENDS FEED MODE - Each friend in their own row */}
      {viewMode === 'feed' && (
        <RiverFeedView
          friendsGrouped={friendsGrouped}
          mobileCategory={mobileCategory}
          setMobileCategory={setMobileCategory}
          getDeckIndex={getDeckIndex}
          handleDeckIndexChange={handleDeckIndexChange}
          navigate={navigate}
          renderPostActions={renderPostActions}
          renderCommentSection={renderCommentSection}
          formatDate={formatDate}
          onCardClick={handleCardClick}
          collapsedDecks={collapsedDecks}
          onCollapseDeck={collapseDeck}
          onExpandDeck={expandDeck}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalPostId && (
        <DeleteConfirmModal
          isOpen={!!deleteModalPostId}
          onClose={() => {
            setDeleteModalPostId(null);
            setDeleteModalIsReply(false);
            setEditingReplyParentId(null);
          }}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              if (deleteModalIsReply) {
                // Deleting a reply/comment
                await deleteReply(deleteModalPostId);
                // Update thread replies
                if (editingReplyParentId) {
                  setThreadReplies(prev => ({
                    ...prev,
                    [editingReplyParentId]: (prev[editingReplyParentId] || []).filter(r => r.id !== deleteModalPostId)
                  }));
                }
              } else if (onDeletePost) {
                // Deleting a post
                await onDeletePost(deleteModalPostId);
              }
              setDeleteModalPostId(null);
              setDeleteModalIsReply(false);
              setEditingReplyParentId(null);
            } catch (error) {
              console.error('Failed to delete:', error);
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title={deleteModalIsReply ? "Delete Comment" : "Delete Post"}
          message={deleteModalIsReply ? "Are you sure you want to delete this comment? This action cannot be undone." : undefined}
        />
      )}

      {/* Edit Modal (Expanded Composer) */}
      {isComposerFullPage && isEditMode && createPortal(
        <div className="expanded-composer-overlay" onClick={() => {
          setIsComposerFullPage(false);
          setIsEditMode(false);
          setEditingPostId(null);
          setCommentText('');
        }}>
          <div className="expanded-composer-modal edit-mode" onClick={(e) => e.stopPropagation()}>
            <div className="expanded-composer-header">
              <h3>
                <EditIcon size={20} />
                Edit Post
              </h3>
              <button 
                className="close-btn-glow"
                onClick={() => {
                  setIsComposerFullPage(false);
                  setIsEditMode(false);
                  setEditingPostId(null);
                  setCommentText('');
                }}
              >
                <CloseIcon size={24} />
              </button>
            </div>
            <div className="expanded-composer-body">
              <textarea
                className="composer-textarea"
                placeholder="Edit your post..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="expanded-composer-footer">
              <button 
                className="submit-btn icon-btn"
                disabled={!commentText.trim()}
                onClick={async () => {
                  if (commentText.trim() && editingPostId && onUpdatePost) {
                    try {
                      await onUpdatePost(editingPostId, { content: commentText.trim() });
                      setIsComposerFullPage(false);
                      setIsEditMode(false);
                      setEditingPostId(null);
                      setCommentText('');
                    } catch (error) {
                      console.error('Failed to update post:', error);
                    }
                  }
                }}
                title="Save"
              >
                <CheckIcon size={24} strokeWidth="2.5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Media Lightbox */}
      <MediaLightbox 
        post={expandedMediaPost ? (allPosts.find(p => p.id === expandedMediaPost.id) || expandedMediaPost) : null}
        onClose={() => setExpandedMediaPost(null)}
        commentText={commentText}
        setCommentText={setCommentText}
      />
    </div>
  );
}

export default TimelineRiver;