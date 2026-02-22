import { useState, useEffect, useRef, useCallback } from 'react';
import { useStories } from '@contexts/StoriesContext';
import { useAuth } from '@contexts/AuthContext';
import messagesService from '@services/messagesService';
import {
  CloseIcon,
  HeartDynamicIcon,
  BoltDynamicIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SendIcon,
} from '@assets/icons';
import { getInitials } from '@utils/helpers';
// Reuse existing styles
import '@pages/Home/Home.scss';
import '@Profile/components/ComposerModal/ComposerModal.scss';

function StoryViewer({ isOpen, onClose, initialUserIndex = 0, storyGroups }) {
  const { user } = useAuth();
  const { markStoryViewed, reactToStory, isStoryViewed } = useStories();
  
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const progressInterval = useRef(null);
  const touchStartX = useRef(0);
  const replyInputRef = useRef(null);

  const STORY_DURATION = 5000; // 5 seconds per story

  // Current user's story group
  const currentGroup = storyGroups?.[currentUserIndex];
  const currentStory = currentGroup?.stories?.[currentStoryIndex];

  // Navigate to next story
  const goToNextStory = useCallback(() => {
    if (!currentGroup) return;
    
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < storyGroups.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
    setProgress(0);
  }, [currentStoryIndex, currentUserIndex, currentGroup, storyGroups, onClose]);

  // Navigate to previous story
  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      const prevGroup = storyGroups[currentUserIndex - 1];
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(prevGroup.stories.length - 1);
    }
    setProgress(0);
  }, [currentStoryIndex, currentUserIndex, storyGroups]);

  // Reset when opening with new user
  useEffect(() => {
    if (isOpen) {
      setCurrentUserIndex(initialUserIndex);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  }, [isOpen, initialUserIndex]);

  // Auto-advance progress bar
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;

    setProgress(0);
    const startTime = Date.now();
    
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;
      
      if (newProgress >= 100) {
        goToNextStory();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    // Mark as viewed
    if (currentStory && !isStoryViewed(currentStory.id)) {
      markStoryViewed(currentStory.id);
    }

    return () => clearInterval(progressInterval.current);
  }, [isOpen, currentUserIndex, currentStoryIndex, isPaused, currentStory, goToNextStory, isStoryViewed, markStoryViewed]);

  // Handle tap navigation (left 30% = prev, right 70% = next)
  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const threshold = rect.width * 0.3;
    
    if (x < threshold) {
      goToPrevStory();
    } else {
      goToNextStory();
    }
  };

  // Swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextStory();
      } else {
        goToPrevStory();
      }
    }
    setIsPaused(false);
  };

  // Handle reactions
  const handleReaction = async (type) => {
    if (!currentStory) return;
    await reactToStory(currentStory.id, type);
  };

  // Handle reply - sends DM to story owner with story context
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !storyUser || !currentStory) return;
    
    try {
      // Send message directly with story reference
      await messagesService.sendMessage(
        storyUser.id,
        replyText.trim(),
        currentStory.id // reply_to_story
      );
      setReplyText('');
      // Optionally open DM to show the conversation
      // await openMessages(storyUser);
      // onClose();
    } catch (err) {
      console.error('Failed to send story reply:', err);
    }
  };

  // Pause progress when typing
  const handleReplyFocus = () => setIsPaused(true);
  const handleReplyBlur = () => setIsPaused(false);

  if (!isOpen || !currentGroup || !currentStory) return null;

  const storyUser = currentGroup.user;
  const isOwnStory = storyUser.id === user?.id;

  // Phone-frame layout styles
  const styles = {
    // Backdrop with blur
    backdrop: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    },
    // Phone frame container - holographic metallic look
    phoneFrame: {
      position: 'relative',
      width: '100%',
      maxWidth: '480px',
      height: '100%',
      maxHeight: '85vh',
      aspectRatio: '9 / 16',
      background: `
        linear-gradient(145deg, rgba(30, 41, 47, 0.7), rgba(0, 0, 0, 0.55)),
        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.5), transparent 50%),
        linear-gradient(45deg, rgba(26, 115, 231, 0.05), rgba(220, 8, 188, 0.05), rgba(26, 115, 231, 0.05))
      `,
      backgroundSize: '100% 100%, 150% 150%, 150% 150%, 200% 200%',
      backgroundBlendMode: 'overlay, multiply, overlay',
      backgroundPosition: '0% 50%, 75% 75%, 75% 75%, 50% 50%',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid rgba(26, 115, 231, 0.3)',
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 -1px 3px rgba(0, 0, 0, 0.5),
        0 0 60px rgba(79, 255, 255, 0.1)
      `,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
    },
    // Progress bars at top
    progressContainer: {
      display: 'flex',
      gap: '4px',
      padding: '12px 12px 0',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    progressBar: {
      flex: 1,
      height: '3px',
      background: 'rgba(255,255,255,0.25)',
      borderRadius: '2px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'var(--cyan)',
      boxShadow: '0 0 8px var(--cyan)',
      transition: 'width 0.05s linear',
    },
    // Header with user info
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 12px 8px',
      position: 'relative',
      zIndex: 10,
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid var(--cyan)',
    },
    username: {
      color: '#fff',
      fontWeight: 600,
      fontSize: '14px',
    },
    time: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: '12px',
      marginLeft: '8px',
    },
    // Media content area
    content: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    media: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    caption: {
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      right: '16px',
      color: '#fff',
      textAlign: 'center',
      fontSize: '14px',
      textShadow: '0 2px 8px rgba(0,0,0,0.9)',
      padding: '10px 14px',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '12px',
      backdropFilter: 'blur(8px)',
    },
    // Nav buttons (desktop)
    navBtn: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#fff',
      padding: '10px',
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'flex',
      opacity: 0.7,
      transition: 'opacity 0.2s, background 0.2s',
      zIndex: 20,
    },
    closeBtn: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#fff',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'flex',
      zIndex: 30,
      transition: 'background 0.2s',
    },
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      {/* Close button outside frame */}
      <button 
        style={styles.closeBtn}
        onClick={onClose}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
      >
        <CloseIcon size={20} />
      </button>

      {/* Navigation arrows outside frame (desktop) */}
      <button 
        style={{ ...styles.navBtn, left: '20px' }}
        onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
      >
        <ChevronLeftIcon size={24} />
      </button>
      <button 
        style={{ ...styles.navBtn, right: '20px' }}
        onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
      >
        <ChevronRightIcon size={24} />
      </button>

      {/* Phone frame */}
      <div 
        style={styles.phoneFrame}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div style={styles.progressContainer}>
          {currentGroup.stories.map((story, idx) => (
            <div key={story.id} style={styles.progressBar}>
              <div 
                style={{ 
                  ...styles.progressFill,
                  width: idx < currentStoryIndex ? '100%' : 
                         idx === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.userInfo}>
            {storyUser.profile_picture ? (
              <img 
                src={storyUser.profile_picture} 
                alt={storyUser.username} 
                style={styles.avatar} 
              />
            ) : (
              <div 
                style={{
                  ...styles.avatar,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--cyan), var(--accent))',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {getInitials(storyUser)}
              </div>
            )}
            <div>
              <span style={styles.username}>{storyUser.username}</span>
              <span style={styles.time}>
                {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Story content - tap to navigate */}
        <div 
          style={styles.content}
          onClick={handleTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {currentStory.media_type === 'video' ? (
            <video 
              src={currentStory.media_url} 
              autoPlay 
              muted 
              playsInline
              style={styles.media}
              onEnded={goToNextStory}
            />
          ) : (
            <img src={currentStory.media_url} alt="Story" style={styles.media} />
          )}
          
          {currentStory.caption && (
            <div style={styles.caption}>{currentStory.caption}</div>
          )}
        </div>

        {/* Footer - Reply input + reactions (only for others' stories) */}
        {!isOwnStory && (
          <div className="story-reply-footer">
            <form className="story-reply-form" onSubmit={handleReply}>
              <div className="story-reply-input-wrapper">
                {/* Reaction buttons inline */}
                <div className="story-reply-actions">
                  <button 
                    type="button"
                    className={`story-reaction-btn heart-btn ${currentStory.user_reaction === 'heart' ? 'active' : ''}`}
                    onClick={() => handleReaction('heart')}
                  >
                    <HeartDynamicIcon size={20} filled={currentStory.user_reaction === 'heart'} />
                  </button>
                  <button 
                    type="button"
                    className={`story-reaction-btn bolt-btn ${currentStory.user_reaction === 'thunder' ? 'active' : ''}`}
                    onClick={() => handleReaction('thunder')}
                  >
                    <BoltDynamicIcon size={20} filled={currentStory.user_reaction === 'thunder'} />
                  </button>
                </div>
                <input
                  ref={replyInputRef}
                  type="text"
                  className="story-reply-input"
                  placeholder={`Reply to ${storyUser.username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={handleReplyFocus}
                  onBlur={handleReplyBlur}
                />
                {replyText.trim() && (
                  <span className="story-send-icon" onClick={handleReply}>
                    <SendIcon size={16} />
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryViewer;
