// 🔵 PABLO - UI Architect
// PostDetailModal.jsx - Modal to view a single post with comments
// Used when clicking notifications to see the post someone commented on

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '@contexts/PostsContext';
import { useAuth } from '@contexts/AuthContext';
import postsService from '@services/postsService';
import { 
  CloseIcon, 
  UserIcon, 
  HeartDynamicIcon, 
  MessageBubbleIcon, 
  ShareIcon,
  ChevronRightIcon,
  EditIcon,
  TrashIcon,
  ImageIcon
} from '@assets/icons';
import './PostDetailModal.scss';

function PostDetailModal({ postId, onClose, onPostNotFound }) {
  const navigate = useNavigate();
  const { posts, likePost, sharePost, createReply, fetchReplies, updatePost, deletePost } = usePosts();
  const { user: currentUser } = useAuth();
  
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  
  // State for the post itself (may need to fetch from API)
  const [post, setPost] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postError, setPostError] = useState(null);
  
  // State for editing/deleting comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  
  // Fetch post - first check context, then fetch from API
  useEffect(() => {
    if (!postId) return;
    
    // First, try to find in local context
    const localPost = posts.find(p => p.id === postId);
    if (localPost) {
      setPost(localPost);
      setIsLoadingPost(false);
    } else {
      // Not in context, fetch from API
      setIsLoadingPost(true);
      postsService.getById(postId)
        .then(fetchedPost => {
          setPost(fetchedPost);
          setIsLoadingPost(false);
        })
        .catch(err => {
          console.error('Failed to fetch post:', err);
          setPostError('Could not load post');
          setIsLoadingPost(false);
          // Notify parent that post doesn't exist (for removing stale notifications)
          if (onPostNotFound) {
            onPostNotFound(postId);
          }
        });
    }
  }, [postId, posts, onPostNotFound]);
  
  // Fetch replies when modal opens
  useEffect(() => {
    if (postId) {
      setIsLoadingReplies(true);
      fetchReplies(postId).then(result => {
        if (result.success) {
          setReplies(result.data);
        }
        setIsLoadingReplies(false);
      });
    }
  }, [postId, fetchReplies]);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Show loading or error state
  if (isLoadingPost || !post) {
    return createPortal(
      <div className="post-detail-overlay" onClick={onClose}>
        <div className="post-detail-content post-detail-content--loading" onClick={(e) => e.stopPropagation()}>
          <button className="post-detail-close" onClick={onClose}>
            <CloseIcon size={24} />
          </button>
          <div className="post-detail-loading">
            {postError ? (
              <p style={{ color: '#ff6b6b' }}>{postError}</p>
            ) : (
              <p>Loading post...</p>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const handleLike = async (e) => {
    e.stopPropagation();
    await likePost(post.id);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    await sharePost(post.id);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const result = await createReply(post.id, { content: commentText.trim(), type: 'thoughts' });
    setIsSubmitting(false);
    
    if (result.success) {
      setReplies(prev => [...prev, result.data]);
      setCommentText('');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;
    setIsSubmitting(true);
    const result = await updatePost(commentId, { content: editingCommentContent.trim() });
    setIsSubmitting(false);
    if (result.success) {
      setReplies(prev => prev.map(r => r.id === commentId ? { ...r, content: editingCommentContent.trim() } : r));
      setEditingCommentId(null);
      setEditingCommentContent('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    setIsSubmitting(true);
    const result = await deletePost(commentId);
    setIsSubmitting(false);
    if (result.success) {
      setReplies(prev => prev.filter(r => r.id !== commentId));
      setDeletingCommentId(null);
    }
  };
  
  const navigateToProfile = (username) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return createPortal(
    <div className="post-detail-overlay" onClick={onClose}>
      <div className="post-detail-content" onClick={(e) => e.stopPropagation()}>
        <button className="post-detail-close" onClick={onClose}>
          <CloseIcon size={24} />
        </button>
        
        {/* Post Content */}
        <div className="post-detail-main">
          {/* Author Header */}
          <div className="post-detail-header">
            <div 
              className="post-detail-avatar"
              onClick={() => navigateToProfile(post.author?.username)}
            >
              <UserIcon size={36} />
            </div>
            <div className="post-detail-author-info">
              <span 
                className="post-detail-author"
                onClick={() => navigateToProfile(post.author?.username)}
              >
                {post.author?.first_name || post.author?.username || 'Unknown'}
              </span>
              <span className="post-detail-username">@{post.author?.username}</span>
              <span className="post-detail-timestamp">{formatDate(post.created_at)}</span>
            </div>
          </div>
          
          {/* Post Body */}
          <div className="post-detail-body">
            <p className="post-detail-text">{post.content}</p>
            
            {/* Media if present */}
            {post.media_url && (
              <div className="post-detail-media">
                <img src={post.media_url} alt="Post media" />
              </div>
            )}
          </div>
          
          {/* Action Bar */}
          <div className="post-detail-actions">
            <button 
              className={`post-action-btn ${post.is_liked ? 'post-action-btn--liked' : ''}`}
              onClick={handleLike}
            >
              <HeartDynamicIcon size={20} filled={post.is_liked} />
              <span>{post.likes_count || 0}</span>
            </button>
            <button className="post-action-btn">
              <MessageBubbleIcon size={20} strokeWidth="1.5" />
              <span>{post.reply_count || replies.length || 0}</span>
            </button>
            <button className="post-action-btn" onClick={handleShare}>
              <ShareIcon size={20} strokeWidth="1.5" />
              <span>{post.shares_count || 0}</span>
            </button>
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="post-detail-comments">
          <div className="post-detail-comments-header">
            <MessageBubbleIcon size={16} />
            <span>Comments</span>
          </div>
          
          {/* Comment Composer */}
          <div className="post-detail-composer">
            <div className="post-detail-composer-avatar">
              <UserIcon size={24} />
            </div>
            <div className="post-detail-composer-input-wrapper">
              <textarea
                className="post-detail-composer-input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                }}
                rows={1}
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button 
                className="post-detail-composer-submit"
                disabled={!commentText.trim() || isSubmitting}
                onClick={handleCommentSubmit}
              >
                <ChevronRightIcon size={20} strokeWidth="2.5" />
              </button>
            </div>
          </div>
          
          {/* Comments List */}
          <div className="post-detail-comments-list">
            {isLoadingReplies ? (
              <div className="post-detail-comments-loading">Loading comments...</div>
            ) : replies.length === 0 ? (
              <div className="post-detail-comments-empty">
                No comments yet. Be the first!
              </div>
            ) : (
              replies.map(reply => {
                const isOwnComment = currentUser && reply.author?.id === currentUser.id;
                const isEditingThis = editingCommentId === reply.id;
                
                return (
                  <div key={reply.id} className={`post-detail-comment ${isEditingThis ? 'is-editing' : ''}`}>
                    <div 
                      className="post-detail-comment-avatar"
                      onClick={() => navigateToProfile(reply.author?.username)}
                    >
                      <UserIcon size={20} />
                    </div>
                    <div className="post-detail-comment-content">
                      <div className="post-detail-comment-header">
                        <span 
                          className="post-detail-comment-author"
                          onClick={() => navigateToProfile(reply.author?.username)}
                        >
                          {reply.author?.first_name || reply.author?.username || 'User'}
                        </span>
                        {isOwnComment && !isEditingThis && (
                          <div className="post-detail-comment-actions">
                            <button 
                              className="comment-action-btn" 
                              title="Edit"
                              onClick={() => {
                                setEditingCommentId(reply.id);
                                setEditingCommentContent(reply.content);
                              }}
                            >
                              <EditIcon size={14} />
                            </button>
                            <button 
                              className="comment-action-btn comment-action-btn--delete" 
                              title="Delete"
                              onClick={() => setDeletingCommentId(reply.id)}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditingThis ? (
                        <div className="comment-edit-form">
                          <textarea
                            className="comment-edit-input"
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleEditComment(reply.id);
                              }
                              if (e.key === 'Escape') {
                                setEditingCommentId(null);
                                setEditingCommentContent('');
                              }
                            }}
                          />
                          <div className="comment-edit-actions">
                            <button 
                              className="comment-edit-btn comment-edit-btn--cancel"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentContent('');
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="comment-edit-btn comment-edit-btn--save"
                              disabled={!editingCommentContent.trim() || isSubmitting}
                              onClick={() => handleEditComment(reply.id)}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="post-detail-comment-text">{reply.content}</p>
                      )}
                      <span className="post-detail-comment-time">{formatDate(reply.created_at)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Delete Comment Confirmation Modal */}
        {deletingCommentId && (
          <div className="post-detail-delete-overlay" onClick={() => setDeletingCommentId(null)}>
            <div className="post-detail-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="post-detail-delete-icon">
                <TrashIcon size={48} stroke="rgba(255,82,82,0.8)" strokeWidth="1.5" />
              </div>
              <h3>Delete Comment?</h3>
              <p>This action cannot be undone.</p>
              <div className="post-detail-delete-actions">
                <button 
                  className="post-detail-delete-btn post-detail-delete-btn--cancel"
                  onClick={() => setDeletingCommentId(null)}
                >
                  Cancel
                </button>
                <button 
                  className="post-detail-delete-btn post-detail-delete-btn--delete"
                  disabled={isSubmitting}
                  onClick={() => handleDeleteComment(deletingCommentId)}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default PostDetailModal;
