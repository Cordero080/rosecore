// ProfileCardFront.jsx - Public profile view (front of flip card)
// 🔵 PABLO - UI/Styling

import { useState, useRef } from 'react';
import './ProfileCardFront.scss';
import {
  UserIcon,
  LocationIcon,
  LinkIcon,
  CalendarIcon,
  BookmarkIcon,
  ShareIcon,
  CheckIcon,
  MoreHorizontalIcon,
  AddFriendIcon,
  FriendsIcon,
  ClockIcon,
  MessageLineIcon,
  CameraLensIcon
} from '@assets/icons';
import { useFriends, useMessages } from '@contexts';
import AvatarUploadModal from '../AvatarUploadModal';

// Color variants for interactive letters
const colorVariants = ['magenta', 'cyan', 'aqua', 'purple', 'blue'];

function ProfileCardFront({ setIsFlipped, posts, user, isOwnProfile = true }) {
  // DEBUG: Log user data to see what we're receiving
  console.log('🎴 ProfileCardFront user:', user);
  console.log('🎴 user.profile_picture:', user?.profile_picture);
  console.log('🎴 user.profile?.avatar:', user?.profile?.avatar);
  
  // Track which letters have been hovered (for "hover all" replay)
  const hoveredRef = useRef(new Set());
  const isAnimatingRef = useRef(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [replayGlitch, setReplayGlitch] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [friendRequestPending, setFriendRequestPending] = useState(false);
  
  const { friends, pendingRequests, sendRequest, cancelRequest } = useFriends();
  const { openMessages } = useMessages();
  
  // Check friendship status
  const isFriend = friends?.some(f => f.id === user?.id || f.username === user?.username);
  const hasPendingRequest = pendingRequests?.some(r => r.from_user?.id === user?.id || r.to_user?.id === user?.id);
  
  // Handle sending friend request
  const handleAddFriend = async () => {
    if (!user?.id) return;
    setFriendRequestPending(true);
    const result = await sendRequest(user.id);
    if (!result.success) {
      console.error('Failed to send friend request:', result.error);
      setFriendRequestPending(false);
    }
    // Keep pending state to show "Request Sent"
  };
  
  // Handle canceling friend request
  const handleCancelRequest = async () => {
    if (!user?.id) return;
    const result = await cancelRequest(user.id);
    if (result.success) {
      setFriendRequestPending(false);
    } else {
      console.error('Failed to cancel friend request:', result.error);
    }
  };
  
  // Handle opening messages with this user
  const handleMessage = () => {
    if (user?.id) {
      openMessages(user);
    }
  };
  
  // Build display name from first + last name, fallback to username
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  const displayName = fullName || user?.username || 'Loading...';
  
  // Track letter hovers - when all letters are hovered, trigger replay
  const handleLetterHover = (index) => {
    if (isAnimatingRef.current) return;
    
    hoveredRef.current.add(index);
    
    if (hoveredRef.current.size === displayName.replace(/\s/g, '').length) {
      isAnimatingRef.current = true;
      hoveredRef.current = new Set();
      
      setReplayGlitch('reset');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setReplayGlitch('replay');
          
          setTimeout(() => {
            setReplayGlitch(false);
            isAnimatingRef.current = false;
          }, 4000);
        });
      });
    }
  };
  
  // Handle share profile - copy link to clipboard
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${user?.username}`;
    
    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: `${displayName}'s Profile`,
          text: `Check out ${displayName}'s profile on Numeneon!`,
          url: profileUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(profileUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      }
    } catch (err) {
      // User cancelled share or error - try clipboard as fallback
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(profileUrl);
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 2500);
        } catch {
          console.error('Failed to share profile');
        }
      }
    }
  };
  
  // Render name with interactive letters
  const renderInteractiveName = () => {
    let letterIndex = 0;
    return displayName.split('').map((char, i) => {
      if (char === ' ') {
        return <span key={i} className="name-space">&nbsp;</span>;
      }
      const currentIndex = letterIndex;
      const colorVariant = colorVariants[letterIndex % colorVariants.length];
      const hoverDelay = 0.05 + (letterIndex % 5) * 0.02; // Stagger delays
      letterIndex++;
      return (
        <span
          key={i}
          className={`name-letter name-letter--${colorVariant}`}
          style={{ '--hover-delay': `${hoverDelay}s` }}
          data-letter={char}
          onMouseEnter={() => handleLetterHover(currentIndex)}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="profile-card-front">
      <div className="profile-header river-header">
        <div className="profile-header-bg">
          {/* Background image placeholder */}
        </div>
        
        {/* Overlapping avatar container with engagement ring */}
        <div className="avatar-wrapper">
          <div className="avatar-engagement-ring">
            <svg width="150" height="150" viewBox="0 0 150 150">
              {/* Background ring */}
              <circle 
                className="ring-bg" 
                cx="75" cy="75" r="70" 
                fill="none" 
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="6"
              />
              {/* Progress ring - animates on load */}
              <circle 
                className="ring-progress" 
                cx="75" cy="75" r="70" 
                fill="none" 
                stroke="#1ae784"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="440"
                strokeDashoffset="440"
                transform="rotate(-90 75 75)"
              />
            </svg>
          </div>
          <div className="profile-avatar">
            {(user?.profile?.avatar || user?.profile_picture) ? (
              <img src={user?.profile?.avatar || user?.profile_picture} alt={user.username} className="avatar-image" />
            ) : (
              <UserIcon size={90} />
            )}
            {isOwnProfile && (
              <button 
                className="avatar-camera-badge" 
                title="Upload photo"
                onClick={() => setShowAvatarModal(true)}
              >
                <CameraLensIcon size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {isOwnProfile && (
        <AvatarUploadModal 
          isOpen={showAvatarModal} 
          onClose={() => setShowAvatarModal(false)} 
        />
      )}

      {/* Two-Column Profile Meta */}
      <div className="profile-meta river-meta">
        {/* LEFT COLUMN */}
        <div className="profile-left-column">
          <div className="profile-name-section">
            <h1 className={`profile-display-name profile-display-name--interactive ${replayGlitch === 'reset' ? 'profile-display-name--reset' : ''} ${replayGlitch === 'replay' ? 'profile-display-name--replay' : ''}`}>
              {renderInteractiveName()}
            </h1>
            <span className="profile-handle">@{user?.username || 'user'}</span>
            {user?.profile?.location && (
              <div className="profile-location">
                <LocationIcon size={14} />
                <span>{user.profile.location}</span>
              </div>
            )}
          </div>

          {/* Bio Section */}
          <div className="profile-bio">
            <p>{user?.profile?.bio || 'No bio yet'}</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-right-column">
          {/* Profile Details - Each on Own Row */}
          <div className="profile-details">
            {user?.profile?.website && (
              <div className="profile-detail-item">
                <LinkIcon size={16} />
                <a href={user.profile.website} target="_blank" rel="noopener noreferrer">{user.profile.website.replace(/^https?:\/\//, '')}</a>
              </div>
            )}
            <div className="profile-detail-item">
              <CalendarIcon size={16} />
              <span>Joined {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
            </div>
          </div>
          
          {/* Stats - Posts only */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-count">{posts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Icons - Right Side */}
      <div className="profile-actions-pill">
        {/* Friend actions - only on other users' profiles */}
        {!isOwnProfile && (
          <>
            {isFriend ? (
              <>
                <button className="action-icon-btn friend-btn is-friend" title="Friends">
                  <FriendsIcon size={18} />
                </button>
                <button className="action-icon-btn message-btn" title="Message" onClick={handleMessage}>
                  <MessageLineIcon size={18} />
                </button>
                <button className="action-icon-btn save-btn" title="Save Profile">
                  <BookmarkIcon size={18} />
                </button>
                <button className="action-icon-btn share-btn" title="Share Profile" onClick={handleShareProfile}>
                  <ShareIcon size={18} />
                </button>
              </>
            ) : hasPendingRequest || friendRequestPending ? (
              <button 
                className="action-icon-btn pending-btn" 
                title="Cancel Request" 
                onClick={handleCancelRequest}
              >
                <ClockIcon size={18} />
              </button>
            ) : (
              <button className="action-icon-btn add-friend-btn" title="Add Friend" onClick={handleAddFriend}>
                <AddFriendIcon size={20} />
              </button>
            )}
          </>
        )}

        {/* Share toast notification */}
        {showShareToast && (
          <div className="share-toast">
            <CheckIcon size={16} />
            Link copied!
          </div>
        )}
        {/* More options & Analytics - only on own profile */}
        {isOwnProfile && (
          <>
            <button className="action-icon-btn share-btn" title="Share Profile" onClick={handleShareProfile}>
              <ShareIcon size={18} />
            </button>
            <button className="action-icon-btn more-btn" onClick={() => setIsFlipped(true)} title="Analytics">
              <MoreHorizontalIcon size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileCardFront;
