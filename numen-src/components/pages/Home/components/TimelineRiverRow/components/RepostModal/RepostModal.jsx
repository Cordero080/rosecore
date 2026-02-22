// 🔵 PABLO - UI Component
// RepostModal.jsx - Modal for sharing/reposting a post

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatRelativeTime } from '@components/pages/Home/utils/timeFormatters';
import {
  UserIcon,
  CloseIcon,
  RepostIcon,
  LinkIcon,
  CheckIcon
} from '@assets/icons';
import './RepostModal.scss';

function RepostModal({
  post,
  user,
  type,
  onClose,
  onRepost,
  onCopyLink
}) {
  const [copied, setCopied] = useState(false);
  const [reposted, setReposted] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    onCopyLink?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRepost = async () => {
    setReposted(true);
    await onRepost?.(post.id);
    setTimeout(() => {
      setReposted(false);
      onClose();
    }, 1500);
  };

  return createPortal(
    <div className="repost-modal-overlay" onClick={onClose}>
      <div className="repost-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button - uses global close-btn-glow with rotate on hover */}
        <button className="close-btn-glow repost-modal-close" onClick={onClose}>
          <CloseIcon size={20} />
        </button>

        {/* Header */}
        <div className="repost-modal-header">
          <RepostIcon size={24} />
          <h3>Share</h3>
        </div>

        {/* Enlarged Post Preview */}
        <div className={`repost-preview-card post--${type}`}>
          <div className="repost-preview-header">
            <div className="repost-preview-avatar">
              <UserIcon size={28} />
            </div>
            <div className="repost-preview-info">
              <span className="repost-preview-name">{user.name}</span>
              <span className="repost-preview-meta">
                @{user.username} · {formatRelativeTime(post.created_at || post.createdAt)}
              </span>
            </div>
          </div>
          
          {/* Media if present */}
          {type === 'media' && post.media_url && (
            <div className="repost-preview-media">
              <img src={post.media_url} alt="Post media" />
            </div>
          )}
          
          <p className="repost-preview-content">{post.content}</p>
          
          {/* Post stats */}
          <div className="repost-preview-stats">
            <span>{post.likes_count || 0} likes</span>
            <span>·</span>
            <span>{post.reply_count || 0} comments</span>
            <span>·</span>
            <span>{post.shares_count || 0} shares</span>
          </div>
        </div>

        {/* Share Actions - icon only */}
        <div className="repost-actions">
          <button 
            className={`repost-action-btn repost-action-btn--repost ${reposted ? 'success' : ''}`}
            onClick={handleRepost}
            disabled={reposted}
            title={reposted ? 'Reposted!' : 'Repost to your timeline'}
          >
            {reposted ? <CheckIcon size={22} /> : <RepostIcon size={22} />}
          </button>
          
          <button 
            className={`repost-action-btn repost-action-btn--link ${copied ? 'success' : ''}`}
            onClick={handleCopyLink}
            title={copied ? 'Link copied!' : 'Copy link'}
          >
            {copied ? <CheckIcon size={22} /> : <LinkIcon size={22} />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default RepostModal;
