import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
// 🔵 PABLO - UI/Styling | 🟡 NATALIA - API Logic
// Profile.jsx - User profile page with timeline
// Supports viewing own profile (/profile) and other users' profiles (/profile/:username)

import './Profile.scss';
// 🛠️ Import shared helpers instead of duplicating them!
import { getDisplayName, getInitials, formatRelativeTime } from '@utils/helpers';
import { getUserByUsername } from '@services/usersService';
import {
  UserIcon,
  FriendsIcon,
  MilestoneIcon,
  ExpandIcon,
  HeartDynamicIcon,
  MessageBubbleIcon,
  RepostIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  ChevronRightIcon,
  MaximizeIcon,
  MessageLineIcon,
  GridIcon,
  PostTriangleIcon,
  ImageIcon,
  FlagIcon
} from '@assets/icons';
import ProfileCard from './components/ProfileCard';
import ComposerModal from './components/ComposerModal';
import TimelineRiver from './components/TimelineRiver';
import MediaLightbox from '@Home/components/MediaLightbox/MediaLightbox';
import { usePosts, useAuth, useFriends, useMessages } from '@contexts';

function Profile() {
  const { posts, deletePost, updatePost, createPost, likePost, createReply } = usePosts();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { friends } = useFriends();
  const { openMessages } = useMessages();
  const { username: profileUsername } = useParams(); // Get username from URL if viewing someone else
  
  // ALL useState hooks MUST be called before any early returns (React rules of hooks)
  const [isFlipped, setIsFlipped] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [composerType, setComposerType] = useState('thought'); // 'thought' or 'media'
  const [composerText, setComposerText] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'feed'
  const [isPosting, setIsPosting] = useState(false);
  
  // State for All Posts section actions
  const [allPostsDeleteId, setAllPostsDeleteId] = useState(null);
  const [allPostsEditId, setAllPostsEditId] = useState(null);
  const [allPostsEditContent, setAllPostsEditContent] = useState('');
  
  // State for All Posts inline commenting
  const [allPostsCommentId, setAllPostsCommentId] = useState(null);
  const [allPostsCommentText, setAllPostsCommentText] = useState('');
  const [allPostsComposerFullPage, setAllPostsComposerFullPage] = useState(false);
  
  // State for All Posts media lightbox
  const [allPostsLightboxPost, setAllPostsLightboxPost] = useState(null);
  
  // Heart animation state for All Posts section
  const [allPostsAnimatingHeartId, setAllPostsAnimatingHeartId] = useState(null);
  
  // State for fetched user data (when viewing someone else's profile)
  const [fetchedUser, setFetchedUser] = useState(null);
  
  // Determine if viewing own profile or someone else's
  const isOwnProfile = !profileUsername || profileUsername === currentUser?.username;
  
  // DEBUG: Log at component level
  console.log('🏠 Profile.jsx rendering - profileUsername:', profileUsername, 'isOwnProfile:', isOwnProfile);
  
  // Fetch user data when viewing someone else's profile
  useEffect(() => {
    console.log('🔄 Profile useEffect running - isOwnProfile:', isOwnProfile, 'profileUsername:', profileUsername);
    let isMounted = true;
    
    if (!isOwnProfile && profileUsername) {
      console.log('📡 Calling getUserByUsername for:', profileUsername);
      getUserByUsername(profileUsername)
        .then(userData => {
          if (isMounted) {
            console.log('🔍 Fetched user data:', userData);
            console.log('🔍 profile_picture:', userData?.profile_picture);
            console.log('🔍 profile?.avatar:', userData?.profile?.avatar);
            setFetchedUser(userData);
          }
        })
        .catch(err => {
          console.error('❌ Failed to fetch user profile:', err);
        });
    }
    
    return () => {
      isMounted = false;
      setFetchedUser(null); // Reset on cleanup
    };
  }, [isOwnProfile, profileUsername]);
  
  // Check if the profile user is a friend of the current user
  const isFriend = friends?.some(f => f.username === profileUsername);
  
  // Can post: own profile OR viewing a friend's profile (wall posting)
  const canPost = isOwnProfile || isFriend;
  
  // Get the profile user data
  const profileUser = useMemo(() => {
    if (isOwnProfile) {
      return currentUser;
    }
    
    // Use fetched user data if available and matches the current profile (most complete data from API)
    if (fetchedUser && fetchedUser.username === profileUsername) {
      return fetchedUser;
    }
    
    // Try to find from post authors first (they have the most complete data)
    const postMatch = posts.find(p => p.author?.username === profileUsername)?.author;
    if (postMatch) {
      return postMatch;
    }
    
    // Find the user from friends list
    const friendMatch = friends?.find(f => f.username === profileUsername);
    if (friendMatch) {
      return friendMatch;
    }
    
    // Fallback - at minimum show the username from URL
    return { 
      username: profileUsername, 
      first_name: profileUsername, // Use username as display if we can't find real name
      last_name: '' 
    };
  }, [isOwnProfile, currentUser, fetchedUser, friends, posts, profileUsername]);
  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="user-profile-page river-profile">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }
  
  // 🛠️ getDisplayName, getInitials, formatRelativeTime are now imported from @/utils/helpers

  // HANDLER: Submit from inline composer (Cmd/Ctrl + Enter)
  const handleInlineKeyDown = async (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleInlinePost();
    }
  };

  // HANDLER: Post from inline composer
  const handleInlinePost = async () => {
    if (!composerText.trim() || isPosting) return;
    
    setIsPosting(true);
    
    // Build post data - include target_profile_id for wall posts
    const postData = { 
      content: composerText.trim(), 
      type: 'thoughts'
    };
    
    // If posting on a friend's wall, include their user ID
    if (!isOwnProfile && isFriend && profileUser?.id) {
      postData.target_profile_id = profileUser.id;
    }
    
    const result = await createPost(postData);
    setIsPosting(false);
    
    if (result.success) {
      setComposerText('');
    } else {
      alert(result.error || 'Failed to create post');
    }
  };
  
  // Filter posts for this profile's timeline:
  // 1. Posts authored BY the profile user
  // 2. Wall posts made TO this profile (target_profile_id matches)
  const profilePosts = posts.filter(p => 
    p.author?.username === profileUser?.username || 
    p.target_profile_id === profileUser?.id ||
    p.target_profile?.id === profileUser?.id ||
    p.target_profile?.username === profileUser?.username
  );
  
  // Friends' posts for "Friends Feed" - ONLY show on own profile
  // EXCLUDE wall posts (posts with target_profile_id) - they belong only on the target's wall
  const friendsPosts = isOwnProfile 
    ? posts.filter(p => 
        p.author?.username !== currentUser?.username && 
        !p.target_profile_id && 
        !p.target_profile
      )
    : [];

  // Categorize profile user's posts into river columns
  const textPosts = profilePosts.filter(p => p.type === 'thoughts');
  const mediaPosts = profilePosts.filter(p => p.type === 'media');
  const achievementPosts = profilePosts.filter(p => p.type === 'milestones');

  // Categorize friends' posts
  const feedTextPosts = friendsPosts.filter(p => p.type === 'thoughts');
  const feedMediaPosts = friendsPosts.filter(p => p.type === 'media');
  const feedAchievementPosts = friendsPosts.filter(p => p.type === 'milestones');

  return (
    <div className="user-profile-page river-profile">
      {/* Background accent blobs */}
      <div className="page-blob-top"></div>
      <div className="page-blob-bottom"></div>

      {/* Flippable Profile Header Card */}
      <ProfileCard 
        isFlipped={isFlipped} 
        setIsFlipped={setIsFlipped} 
        posts={profilePosts} 
        user={profileUser}
        isOwnProfile={isOwnProfile}
      />

      {/* View Mode Toggle - Only show Friends Feed on OWN profile */}
      {isOwnProfile && (
        <div className="view-mode-toggle">
          <button 
            className={`view-toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            <UserIcon size={18} />
            My Timeline
          </button>
          <button 
            className={`view-toggle-btn feed-btn ${viewMode === 'feed' ? 'active' : ''}`}
            onClick={() => setViewMode('feed')}
          >
            <FriendsIcon size={18} />
            Friends Feed
          </button>
        </div>
      )}
      
      {/* Viewing another user's profile - show their name with message button */}
      {!isOwnProfile && (
        <div className="profile-header-label">
          <h2 className="other-user-label">
            {getDisplayName(profileUser)}'s Timeline
          </h2>
          <button 
            className="profile-message-btn"
            onClick={() => openMessages({
              id: profileUser?.id,
              username: profileUser?.username,
              displayName: getDisplayName(profileUser),
            })}
            title={`Message ${getDisplayName(profileUser)}`}
          >
            <MessageLineIcon size={20} />
          </button>
        </div>
      )}

      {/* Quick Composer - Show on own profile OR friend's profile */}
      {canPost && (
        <div className="quick-composer-buttons">
          <div className="quick-composer-section unified-composer">
            <div className="quick-composer-avatar">
              <UserIcon size={24} />
            </div>
            <div className="quick-composer-input-wrapper">
              {/* Action buttons on left */}
              <div className="quick-composer-actions">
                <button 
                  className="quick-composer-action-btn media-btn"
                  onClick={() => {
                    setComposerType('media');
                    setShowComposer(true);
                  }}
                  title="Add photo"
                >
                  <ImageIcon size={18} />
                </button>
                <button 
                  className="quick-composer-action-btn milestone-btn"
                  onClick={() => {
                    setComposerType('milestone');
                    setShowComposer(true);
                  }}
                  title="Add milestone"
                >
                  <FlagIcon size={18} />
                </button>
              </div>
              <textarea
                id="quick-composer-input"
                name="quick-composer"
                className="quick-composer-textarea"
                placeholder={isOwnProfile ? "Share something…" : `Write on ${getDisplayName(profileUser)}'s wall…`}
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={handleInlineKeyDown}
                rows={1}
                disabled={isPosting}
              />
              {/* Post icon - shows when there's text */}
              {composerText.trim() && !isPosting && (
                <span 
                  className="quick-composer-post-icon"
                  onClick={handleInlinePost}
                  title="Post"
                >
                  <PostTriangleIcon size={16} />
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Composer Modal - Show on own profile OR friend's profile */}
      {canPost && (
        <ComposerModal 
          showComposer={showComposer}
          setShowComposer={setShowComposer}
          composerType={composerType}
          setComposerType={setComposerType}
          targetProfileId={!isOwnProfile && isFriend ? profileUser?.id : null}
          targetDisplayName={!isOwnProfile ? getDisplayName(profileUser) : null}
          initialContent={composerText}
          onOpen={() => setComposerText('')}
        />
      )}

      {/* Timeline River Flow - Three Column Layout */}
      {/* Pass ALL posts - TimelineRiver handles row-chunking internally */}
      <TimelineRiver 
        viewMode={isOwnProfile ? viewMode : 'timeline'}
        textPosts={textPosts}
        mediaPosts={mediaPosts}
        achievementPosts={achievementPosts}
        feedTextPosts={feedTextPosts}
        feedMediaPosts={feedMediaPosts}
        feedAchievementPosts={feedAchievementPosts}
        onDeletePost={deletePost}
        onUpdatePost={updatePost}
        isOwnProfile={isOwnProfile}
        profileUser={profileUser}
      />

      {/* All Posts Section - Only show on OWN profile when there are more than 12 posts in any category */}
      {isOwnProfile && viewMode === 'timeline' && profilePosts.length > 12 && (
        <div className="all-posts-section river-style">
          <div className="all-posts-header">
            <h3 className="all-posts-title">
              <GridIcon size={18} />
              All Posts
            </h3>
            <span className="all-posts-count">{profilePosts.length} posts</span>
          </div>
          <div className="all-posts-feed river-feed">
            {[...profilePosts]
              .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
              .map(post => {
                const cardTypeClass = post.type === 'thoughts' ? 'text-card' : post.type === 'media' ? 'media-card' : 'achievement-card';
                return (
                  <div key={post.id} className={`river-card ${cardTypeClass}`}>
                    {/* User header inside card */}
                    <div className="river-card-author">
                      <div className="friend-avatar">{getInitials(profileUser)}</div>
                      <span className="friend-name">{profileUser?.username || 'User'}</span>
                    </div>
                    {/* Achievement badge for milestones */}
                    {post.type === 'milestones' && (
                      <div className="achievement-badge">
                        <MilestoneIcon size={24} />
                      </div>
                    )}
                    {/* Clickable media - opens lightbox */}
                    {post.media_url && (
                      <div 
                        className="river-card-media clickable"
                        onClick={() => setAllPostsLightboxPost(post)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={post.media_url} alt="" loading="lazy" className="media-image" />
                        <div className="media-expand-hint">
                          <ExpandIcon size={20} />
                        </div>
                      </div>
                    )}
                    <div className="river-card-content">
                      {post.content && (
                        <p className="river-post-text">{post.content}</p>
                      )}
                      <span className="river-timestamp">
                        {new Date(post.created_at || post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(post.created_at || post.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })}
                      </span>
                    </div>
                    <div className="river-post-actions my-post-actions">
                      {/* Like button */}
                      <div 
                        className={`river-post-likes ${post.is_liked ? 'is-liked' : ''} ${allPostsAnimatingHeartId === post.id ? 'heart-pulse' : ''}`} 
                        title={post.is_liked ? 'Unlike' : 'Like'} 
                        style={{ cursor: 'pointer' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setAllPostsAnimatingHeartId(post.id);
                          setTimeout(() => setAllPostsAnimatingHeartId(null), 300);
                          await likePost(post.id);
                        }}
                      >
                        <HeartDynamicIcon size={18} filled={post.is_liked} />
                        {post.likes_count || 0}
                      </div>
                      {/* Comment button - opens inline composer */}
                      <button 
                        className={`river-action-btn ${post.reply_count > 0 ? 'has-replies' : ''} ${allPostsCommentId === post.id ? 'active' : ''}`} 
                        title="Comment"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (allPostsCommentId === post.id) {
                            setAllPostsCommentId(null);
                            setAllPostsCommentText('');
                          } else {
                            setAllPostsCommentId(post.id);
                            setAllPostsCommentText('');
                          }
                        }}
                      >
                        <MessageBubbleIcon size={18} stroke="rgba(201,168,255,0.5)" strokeWidth="1.5" />
                        {post.reply_count > 0 && <span className="reply-count">{post.reply_count}</span>}
                      </button>
                      {/* Share/Repost button */}
                      <button 
                        className="river-action-btn" 
                        title="Share"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `${window.location.origin}/post/${post.id}`;
                          navigator.clipboard.writeText(url);
                        }}
                      >
                        <RepostIcon size={18} stroke="rgba(79,255,255,0.5)" />
                      </button>
                      {/* Expand to lightbox button for media posts */}
                      {post.media_url && (
                        <button 
                          className="river-action-btn" 
                          title="Expand"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAllPostsLightboxPost(post);
                          }}
                        >
                          <ExpandIcon size={18} stroke="rgba(167,131,255,0.6)" strokeWidth="1.5" />
                        </button>
                      )}
                      {/* Edit button */}
                      <button 
                        className="river-action-btn river-action-btn--edit" 
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAllPostsEditId(post.id);
                          setAllPostsEditContent(post.content || '');
                        }}
                      >
                        <EditIcon size={18} stroke="rgba(255,193,7,0.6)" strokeWidth="1.5" />
                      </button>
                      {/* Delete button */}
                      <button 
                        className="river-action-btn river-action-btn--delete" 
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAllPostsDeleteId(post.id);
                        }}
                      >
                        <TrashIcon size={18} stroke="rgba(255,82,82,0.6)" strokeWidth="1.5" />
                      </button>
                    </div>
                    
                    {/* Inline Comment Composer */}
                    {allPostsCommentId === post.id && !allPostsComposerFullPage && (
                      <div className="inline-comment-composer">
                        <div className="comment-input-wrapper">
                          <textarea
                            className="comment-input"
                            placeholder="Write a comment..."
                            value={allPostsCommentText}
                            onChange={(e) => {
                              setAllPostsCommentText(e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            rows={1}
                            autoFocus
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (allPostsCommentText.trim()) {
                                  await createReply(post.id, { content: allPostsCommentText.trim(), type: 'thoughts' });
                                  setAllPostsCommentText('');
                                  setAllPostsCommentId(null);
                                }
                              }
                              if (e.key === 'Escape') {
                                setAllPostsCommentId(null);
                                setAllPostsCommentText('');
                              }
                            }}
                          />
                          <button 
                            className="expand-composer-btn"
                            onClick={() => setAllPostsComposerFullPage(true)}
                            title="Expand to full page"
                          >
                            <MaximizeIcon size={12} strokeWidth="2.5" />
                          </button>
                        </div>
                        <button 
                          className="comment-submit-btn"
                          disabled={!allPostsCommentText.trim()}
                          onClick={async () => {
                            if (allPostsCommentText.trim()) {
                              await createReply(post.id, { content: allPostsCommentText.trim(), type: 'thoughts' });
                              setAllPostsCommentText('');
                              setAllPostsCommentId(null);
                            }
                          }}
                        >
                          <ChevronRightIcon size={20} strokeWidth="2.5" />
                        </button>
                      </div>
                    )}
                    
                    {/* Full Page Composer for All Posts */}
                    {allPostsCommentId === post.id && allPostsComposerFullPage && createPortal(
                      <div className="full-page-composer-overlay">
                        <div className="full-page-composer">
                          {/* Header with close button */}
                          <div className="full-page-header">
                            <button 
                              className="close-btn-glow"
                              onClick={() => {
                                setAllPostsComposerFullPage(false);
                                setAllPostsCommentId(null);
                                setAllPostsCommentText('');
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
                                  {profileUser?.profile_picture ? (
                                    <img 
                                      src={profileUser.profile_picture} 
                                      alt={getDisplayName(profileUser)} 
                                    />
                                  ) : (
                                    <UserIcon size={20} />
                                  )}
                                </div>
                                <span className="reply-context-name">{getDisplayName(profileUser)}</span>
                                <span className="reply-context-handle">@{profileUser?.username}</span>
                                <span className="reply-context-dot">·</span>
                                <span className="reply-context-time">{formatRelativeTime(post.created_at || post.createdAt)}</span>
                              </div>
                              <p className="reply-context-content">{post.content}</p>
                              {post.media_url && (
                                <div className="reply-context-media">
                                  <img src={post.media_url} alt="Post media" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Fixed Composer at Bottom */}
                          <div className="full-page-composer-fixed">
                            <div className="comment-input-wrapper">
                              <textarea
                                className="comment-input"
                                placeholder="Share your thoughts..."
                                value={allPostsCommentText}
                                onChange={(e) => setAllPostsCommentText(e.target.value)}
                                rows={3}
                                autoFocus
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (allPostsCommentText.trim()) {
                                      await createReply(post.id, { content: allPostsCommentText.trim(), type: 'thoughts' });
                                      setAllPostsCommentText('');
                                      setAllPostsComposerFullPage(false);
                                      setAllPostsCommentId(null);
                                    }
                                  }
                                  if (e.key === 'Escape') {
                                    setAllPostsComposerFullPage(false);
                                  }
                                }}
                              />
                              
                              {/* Action buttons inside textarea */}
                              <div className="composer-actions">
                                <button 
                                  className="comment-media-btn"
                                  title="Add media"
                                  onClick={() => {}}
                                >
                                  <ImageIcon size={18} stroke="rgba(220, 8, 188, 0.5)" strokeWidth="1.5" />
                                </button>
                                
                                <button 
                                  className="comment-submit-btn"
                                  disabled={!allPostsCommentText.trim()}
                                  onClick={async () => {
                                    if (allPostsCommentText.trim()) {
                                      await createReply(post.id, { content: allPostsCommentText.trim(), type: 'thoughts' });
                                      setAllPostsCommentText('');
                                      setAllPostsComposerFullPage(false);
                                      setAllPostsCommentId(null);
                                    }
                                  }}
                                >
                                  <ChevronRightIcon size={20} stroke="rgba(26, 231, 132, 0.5)" strokeWidth="2" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Media Lightbox for All Posts */}
      {allPostsLightboxPost && (
        <MediaLightbox
          post={allPostsLightboxPost}
          onClose={() => setAllPostsLightboxPost(null)}
          commentText={allPostsCommentText}
          setCommentText={setAllPostsCommentText}
        />
      )}

      {/* Delete Confirmation Modal for All Posts */}
      {allPostsDeleteId && (
        <div className="delete-confirm-overlay" onClick={() => setAllPostsDeleteId(null)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-icon">
              <TrashIcon size={48} stroke="rgba(255,82,82,0.8)" strokeWidth="1.5" />
            </div>
            <h3 className="delete-confirm-title">Delete Post?</h3>
            <p className="delete-confirm-text">This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                className="delete-confirm-btn delete-confirm-btn--cancel"
                onClick={() => setAllPostsDeleteId(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-btn delete-confirm-btn--delete"
                onClick={async () => {
                  await deletePost(allPostsDeleteId);
                  setAllPostsDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal for All Posts */}
      {allPostsEditId && (
        <div className="edit-modal-overlay" onClick={() => { setAllPostsEditId(null); setAllPostsEditContent(''); }}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Post</h3>
              <button 
                className="edit-modal-close"
                onClick={() => { setAllPostsEditId(null); setAllPostsEditContent(''); }}
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <textarea
              className="edit-modal-textarea"
              value={allPostsEditContent}
              onChange={(e) => setAllPostsEditContent(e.target.value)}
              placeholder="Edit your post..."
              autoFocus
            />
            <div className="edit-modal-actions">
              <button 
                className="edit-modal-btn edit-modal-btn--cancel"
                onClick={() => { setAllPostsEditId(null); setAllPostsEditContent(''); }}
              >
                Cancel
              </button>
              <button 
                className="edit-modal-btn edit-modal-btn--save"
                onClick={async () => {
                  await updatePost(allPostsEditId, { content: allPostsEditContent });
                  setAllPostsEditId(null);
                  setAllPostsEditContent('');
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;