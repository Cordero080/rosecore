// 🔵 PABLO - UI Component
// ThreadView.jsx - Twitter-style inline replies thread with reply-to-comment

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatRelativeTime } from '@components/pages/Home/utils/timeFormatters';
import {
  UserIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
  MaximizeIcon,
  MessageBubbleIcon,
  ChevronRightIcon
} from '@assets/icons';
import './ThreadView.scss';

function ThreadView({
  postId,
  postType = 'thoughts',
  replies,
  isLoading,
  currentUser,
  onCollapse,
  onDeleteReply,
  onUpdateReply,
  onReplyToComment, // New prop for replying to comments
  showAllReplies,
  onToggleShowAll
}) {
  // Color based on post type
  const authorColorClass = `reply-author--${postType}`;
  // Local state for inline editing
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // State for expanded edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  // State for replying to a comment
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyingToUser, setReplyingToUser] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const allReplies = replies || [];
  const visibleReplies = showAllReplies ? allReplies : allReplies.slice(0, 3);
  const hasMore = allReplies.length > 3;

  // Start replying to a comment
  const handleStartReply = (reply) => {
    setReplyingToId(reply.id);
    setReplyingToUser(reply.author);
    setReplyContent(`@${reply.author?.username || 'user'} `);
  };

  // Cancel replying
  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyingToUser(null);
    setReplyContent('');
  };

  // Submit reply to comment
  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !replyingToUser) return;
    
    setIsSaving(true);
    try {
      // Call parent's reply handler with mention info
      if (onReplyToComment) {
        await onReplyToComment(postId, {
          content: replyContent.trim(),
          mentioned_user_id: replyingToUser.id,
          mentioned_username: replyingToUser.username,
          parent_comment_id: replyingToId
        });
      }
      handleCancelReply();
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
    setIsSaving(false);
  };

  const handleStartEdit = (reply) => {
    setEditingReplyId(reply.id);
    setEditContent(reply.content);
    setEditingReply(reply);
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditContent('');
    setIsEditModalOpen(false);
    setEditingReply(null);
  };

  const handleSaveEdit = async (replyId) => {
    if (!editContent.trim()) return;
    
    setIsSaving(true);
    const success = await onUpdateReply(replyId, { content: editContent.trim() });
    if (success) {
      setEditingReplyId(null);
      setEditContent('');
      setIsEditModalOpen(false);
      setEditingReply(null);
    }
    setIsSaving(false);
  };

  const handleExpandEdit = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="thread-view">
      <button 
        className="collapse-thread-btn"
        onClick={onCollapse}
      >
        Hide replies
      </button>
      
      {isLoading ? (
        <div className="thread-loading">Loading replies...</div>
      ) : (
        <div className="thread-replies">
          {visibleReplies.map((reply) => (
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
                  <span className={`reply-author ${authorColorClass}`}>{reply.author?.username || 'User'}</span>
                  <span className="reply-time">{formatRelativeTime(reply.created_at)}</span>
                  
                  {/* Reply button - available to all users */}
                  <div className="reply-actions">
                    {currentUser && (
                      <button 
                        className="reply-action-btn reply-action-btn--reply"
                        title={`Reply to ${reply.author?.username || 'user'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartReply(reply);
                        }}
                      >
                        <MessageBubbleIcon size={14} />
                      </button>
                    )}
                    
                    {/* Edit/Delete for owner */}
                    {currentUser && reply.author?.id === currentUser.id && (
                      <>
                        <button 
                          className="reply-action-btn"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(reply);
                          }}
                        >
                          <EditIcon size={14} />
                        </button>
                        <button 
                          className="reply-action-btn reply-action-btn--delete"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteReply(reply.id, postId);
                          }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Reply content - show edit form if editing this reply */}
                {editingReplyId === reply.id && !isEditModalOpen ? (
                  <div className="reply-edit-form">
                    <div className="reply-edit-input-wrapper">
                      <textarea
                        className="reply-edit-input"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveEdit(reply.id);
                          }
                        }}
                      />
                      <button 
                        className="expand-edit-btn"
                        onClick={handleExpandEdit}
                        title="Expand editor"
                      >
                        <MaximizeIcon size={12} strokeWidth="2.5" />
                      </button>
                    </div>
                    <div className="reply-edit-actions">
                      <button 
                        className="reply-edit-cancel"
                        onClick={handleCancelEdit}
                        title="Cancel"
                      >
                        <CloseIcon size={16} />
                      </button>
                      <button 
                        className="reply-edit-save"
                        disabled={!editContent.trim() || isSaving}
                        onClick={() => handleSaveEdit(reply.id)}
                        title="Save"
                      >
                        {isSaving ? (
                          <span className="saving-dots">...</span>
                        ) : (
                          <CheckIcon size={20} strokeWidth="2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="reply-content">
                    {/* Render @mentions with special styling */}
                    {reply.content.split(/(@\w+)/g).map((part, index) => {
                      if (part.startsWith('@')) {
                        return (
                          <span key={index} className={`mention-tag mention-tag--${postType}`}>
                            {part}
                          </span>
                        );
                      }
                      return part;
                    })}
                  </p>
                )}
                
                {/* Reply to comment input */}
                {replyingToId === reply.id && (
                  <div className="reply-to-comment-form">
                    <div className="reply-to-input-wrapper">
                      <textarea
                        className="reply-to-input"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to @${reply.author?.username}...`}
                        autoFocus
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleCancelReply();
                          }
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitReply();
                          }
                        }}
                      />
                    </div>
                    <div className="reply-to-actions">
                      <button 
                        className="reply-to-cancel"
                        onClick={handleCancelReply}
                        title="Cancel"
                      >
                        <CloseIcon size={14} />
                      </button>
                      <button 
                        className="reply-to-submit"
                        disabled={!replyContent.trim() || isSaving}
                        onClick={handleSubmitReply}
                        title="Send reply"
                      >
                        {isSaving ? (
                          <span className="saving-dots">...</span>
                        ) : (
                          <ChevronRightIcon size={18} strokeWidth="2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Show more/less button */}
          {hasMore && (
            <button 
              className="show-more-replies-btn"
              onClick={onToggleShowAll}
            >
              {showAllReplies 
                ? 'Show less' 
                : `Show ${allReplies.length - 3} more ${allReplies.length - 3 === 1 ? 'reply' : 'replies'}`
              }
            </button>
          )}
          
          {allReplies.length === 0 && (
            <div className="no-replies">No replies yet</div>
          )}
        </div>
      )}

      {/* Expanded Edit Modal */}
      {isEditModalOpen && editingReply && createPortal(
        <div className="expanded-composer-overlay" onClick={handleCancelEdit}>
          <div className="expanded-composer-modal edit-mode" onClick={(e) => e.stopPropagation()}>
            <div className="expanded-composer-header">
              <h3>
                <EditIcon size={20} />
                Edit Comment
              </h3>
              <button 
                className="close-btn-glow"
                onClick={handleCancelEdit}
              >
                <CloseIcon size={24} />
              </button>
            </div>
            <div className="expanded-composer-body">
              <textarea
                className="composer-textarea"
                placeholder="Edit your comment..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
            </div>
            <div className="expanded-composer-footer">
              <button 
                className="submit-btn icon-btn"
                disabled={!editContent.trim() || isSaving}
                onClick={() => handleSaveEdit(editingReplyId)}
                title="Save"
              >
                {isSaving ? (
                  <span className="saving-dots">...</span>
                ) : (
                  <CheckIcon size={24} strokeWidth="2.5" />
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ThreadView;
