// 🔵 PABLO - UI Architect
// MediaLightbox.jsx - Fullscreen media viewer modal

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePosts } from '@contexts/PostsContext';
import { useAuth } from '@contexts/AuthContext';
import { 
  MinimizeIcon, 
  MaximizeIcon, 
  CloseIcon, 
  UserIcon, 
  HeartDynamicIcon, 
  MessageBubbleIcon, 
  ShareIcon, 
  BookmarkIcon,
  ChevronRightIcon,
  EditIcon,
  TrashIcon
} from '@assets/icons';
import './MediaLightbox.scss';

function MediaLightbox({ post, onClose, commentText, setCommentText, threadReplies = {} }) {
  const { likePost, sharePost, createReply, updatePost, deletePost } = usePosts();
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReplies, setLocalReplies] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State for editing/deleting comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  
  if (!post) return null;

  // Get replies from threadReplies or post.replies
  const displayReplies = threadReplies[post.id] || post.replies || [];

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
      // Add to local replies to show immediately
      setLocalReplies(prev => [...prev, result.data]);
      setCommentText('');
      const textarea = document.querySelector('.lightbox-comment-input');
      if (textarea) textarea.style.height = 'auto';
    }
  };

  // Handle comment edit
  const handleEditComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;
    setIsSubmitting(true);
    const result = await updatePost(commentId, { content: editingCommentContent.trim() });
    setIsSubmitting(false);
    if (result.success) {
      setLocalReplies(prev => prev.map(r => r.id === commentId ? { ...r, content: editingCommentContent.trim() } : r));
      setEditingCommentId(null);
      setEditingCommentContent('');
    }
  };

  // Handle comment delete
  const handleDeleteComment = async (commentId) => {
    setIsSubmitting(true);
    const result = await deletePost(commentId);
    setIsSubmitting(false);
    if (result.success) {
      setLocalReplies(prev => prev.filter(r => r.id !== commentId));
      setDeletingCommentId(null);
    }
  };

  // Use React Portal to render at document body level
  // This ensures the lightbox escapes all parent overflow/transform constraints
  return createPortal(
    <div className={`media-lightbox-overlay ${isExpanded ? 'is-expanded' : ''}`} onClick={onClose}>
      <div className={`media-lightbox-content ${isExpanded ? 'is-expanded' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Expand Toggle Button */}
        <button 
          className="expand-toggle-btn" 
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse' : 'Expand to fullscreen'}
        >
          {isExpanded ? (
            <MinimizeIcon size={20} />
          ) : (
            <MaximizeIcon size={20} />
          )}
        </button>
        
        <button className="close-btn-glow" onClick={onClose}>
          <CloseIcon size={24} />
        </button>
        
        <div className="media-lightbox-image-container">
          <img src={post.media_url} alt="Expanded media" className="media-lightbox-image" />
        </div>
        
        <div className="media-lightbox-info">
          <div className="media-lightbox-header">
            <div className="river-avatar">
              <UserIcon size={32} />
            </div>
            <div>
              <div className="media-lightbox-author">
                {post.author?.username || post.author || 'Unknown'}
              </div>
              <div className="media-lightbox-timestamp">{post.timestamp}</div>
            </div>
          </div>
          
          <p className="media-lightbox-caption">{post.content}</p>
          
          {/* Compact Action Bar */}
          <div className="media-lightbox-actions">
            <button 
              className={`media-action-btn media-action-btn--like ${post.is_liked ? 'media-action-btn--liked' : ''}`}
              onClick={handleLike}
            >
              <HeartDynamicIcon size={18} filled={post.is_liked} />
              <span className="action-count">{post.likes_count || 0}</span>
            </button>
            <button className="media-action-btn">
              <MessageBubbleIcon size={18} strokeWidth="1.5" />
              <span className="action-count">{displayReplies.length + localReplies.length}</span>
            </button>
            <button className="media-action-btn" onClick={handleShare}>
              <ShareIcon size={18} strokeWidth="1.5" />
              <span className="action-count">{post.shares_count || 0}</span>
            </button>
            <button className="media-action-btn">
              <BookmarkIcon size={18} strokeWidth="1.5" />
            </button>
          </div>

          {/* Comment Section in Lightbox */}
          <div className="media-lightbox-comments">
            <div className="lightbox-comments-header">
              <MessageBubbleIcon size={16} />
              <span>Comments</span>
            </div>
            
            {/* Compact Comment Composer - send button inside input */}
            <div className="lightbox-comment-composer">
              <div className="lightbox-comment-input-wrapper">
                <textarea
                  className="lightbox-comment-input"
                  placeholder="Add a comment..."
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
                  className="lightbox-comment-submit-btn"
                  disabled={!commentText.trim() || isSubmitting}
                  onClick={handleCommentSubmit}
                >
                  <ChevronRightIcon size={20} strokeWidth="2.5" />
                </button>
              </div>
            </div>

            {/* Comments List - shows real replies */}
            <div className="lightbox-comments-list">
              {/* Show post's existing replies if any */}
              {displayReplies && displayReplies.length > 0 && displayReplies.map(reply => {
                const isOwnComment = currentUser && reply.author?.id === currentUser.id;
                const isEditingThis = editingCommentId === reply.id;
                
                return (
                  <div key={reply.id} className={`lightbox-comment-item ${isEditingThis ? 'is-editing' : ''}`}>
                    <div className="comment-composer-avatar">
                      <UserIcon size={20} />
                    </div>
                    <div className="lightbox-comment-content">
                      <div className="lightbox-comment-header">
                        <div className="lightbox-comment-author">{reply.author?.username || 'User'}</div>
                        {isOwnComment && !isEditingThis && (
                          <div className="lightbox-comment-actions">
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
                        <div className="lightbox-comment-text">{reply.content}</div>
                      )}
                      <div className="lightbox-comment-meta">
                        {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : 'Just now'}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Show locally added replies (before page refresh) */}
              {localReplies.map(reply => {
                const isEditingThis = editingCommentId === reply.id;
                
                return (
                  <div key={reply.id} className={`lightbox-comment-item lightbox-comment-item--new ${isEditingThis ? 'is-editing' : ''}`}>
                    <div className="comment-composer-avatar">
                      <UserIcon size={20} />
                    </div>
                    <div className="lightbox-comment-content">
                      <div className="lightbox-comment-header">
                        <div className="lightbox-comment-author">{reply.author?.username || 'You'}</div>
                        {!isEditingThis && (
                          <div className="lightbox-comment-actions">
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
                        <div className="lightbox-comment-text">{reply.content}</div>
                      )}
                      <div className="lightbox-comment-meta">Just now</div>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty state */}
              {(!post.replies || post.replies.length === 0) && localReplies.length === 0 && (
                <div className="lightbox-comments-empty">
                  No comments yet. Be the first!
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Delete Comment Confirmation Modal */}
        {deletingCommentId && (
          <div className="lightbox-delete-overlay" onClick={() => setDeletingCommentId(null)}>
            <div className="lightbox-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-delete-icon">
                <TrashIcon size={48} stroke="rgba(255,82,82,0.8)" strokeWidth="1.5" />
              </div>
              <h3 className="lightbox-delete-title">Delete Comment?</h3>
              <p className="lightbox-delete-text">This action cannot be undone.</p>
              <div className="lightbox-delete-actions">
                <button 
                  className="lightbox-delete-btn lightbox-delete-btn--cancel"
                  onClick={() => setDeletingCommentId(null)}
                >
                  Cancel
                </button>
                <button 
                  className="lightbox-delete-btn lightbox-delete-btn--delete"
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

export default MediaLightbox;
