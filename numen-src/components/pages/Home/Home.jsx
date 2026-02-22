// 🔵 PABLO - UI/Styling | 🟢 COLIN + 🟠 TITO - API Logic
// Home.jsx - Timeline river feed page

import { useState, useRef, useCallback } from 'react';
import './Home.scss';
import TimelineRiverFeed from './components/TimelineRiverFeed';
import ComposerModal from '@Profile/components/ComposerModal/ComposerModal';
import { usePosts, useFriends, useStories, useAuth } from '@contexts';
import { UserIcon, PostTriangleIcon, ImageIcon, FlagIcon } from '@assets/icons';
// 🛠️ Import shared helpers instead of duplicating them!
import { getInitials } from '@utils/helpers';
import DailyLearning from '@layout/TopBar/DailyLearning';
import { StoryUploadModal, StoryViewer } from '@ui/Stories';

function Home() {
  // Get real data from contexts
  const { posts, createPost, deletePost, updatePost, fetchPosts } = usePosts();
  const { friends } = useFriends();
  const { myStories, friendStories, isStoryViewed } = useStories();
  const { user } = useAuth();

  // Helper: check if a story group has any unviewed stories
  const hasUnviewedStories = (storiesArray) => {
    if (!storiesArray?.length) return false;
    return storiesArray.some(story => !isStoryViewed(story.id));
  };
    
   // 🔵 STATE 1: Controls if the big composer modal is open/closed
  const [showComposer, setShowComposer] = useState(false);
  
  // Story modals state
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState(0);
  const [composerType, setComposerType] = useState('thought'); // 'thought', 'media', or 'milestone'

  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 80; // pixels to pull before refresh triggers

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e) => {
    // Only enable pull-to-refresh when at top of page
    if (window.scrollY === 0) {
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY.current;
    
    // Only track downward pulls when at top
    if (diff > 0 && window.scrollY === 0) {
      const progress = Math.min(diff / PULL_THRESHOLD, 1);
      setPullProgress(progress);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    
    if (pullProgress >= 1 && !isRefreshing) {
      setIsRefreshing(true);
      setPullProgress(1);
      
      // Refresh the feed
      await fetchPosts();
      
      // Small delay for visual feedback
      setTimeout(() => {
        setIsRefreshing(false);
        setPullProgress(0);
      }, 500);
    } else {
      setPullProgress(0);
    }
  }, [pullProgress, isRefreshing, fetchPosts]);

  // STATE: Inline composer text
  const [composerText, setComposerText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

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
    const result = await createPost({ content: composerText.trim(), type: 'thoughts' });
    setIsPosting(false);
    
    if (result.success) {
      setComposerText('');
    } else {
      alert(result.error || 'Failed to create post');
    }
  };

    // STATE 2: Tracks WHICH post has its comment box open (null = none open)
    // (Which post's comment box is open?)
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  //↑ variable (number or null)   ↑ setter function   ↑ starts with none open
  // Which post user is commenting on

  // STATE 3: Stores what user is typing in comment box
   // (What's in the comment textarea?)
  const [commentText, setCommentText] = useState('');
    // ↑ variable (string)   ↑ setter function   ↑ starts empty

  // HANDLER 1: Creates 3D tilt effect when mouse moves over story card
  const handleStoryMouseMove = (e) => {
    const card = e.currentTarget;
    // Get the story card element that mouse is over
    const rect = card.getBoundingClientRect();
    // Get card's position/size on screen

    // Calculate mouse position RELATIVE to card (not whole screen)
    const x = e.clientX - rect.left;// Mouse Y position relative to card
    // Mouse X position from LEFT edge of browser window

    const y = e.clientY - rect.top; // Mouse Y position relative to card
    // Mouse Y position from TOP edge of browser window
  
    // Find center of card- calculate how far mouse is from center
    const centerX = rect.width / 2; // Find center of card
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -1; // Max 1 degree
                                                    // Vertical tilt
     // Calculate rotation based on distance from center                                          
    // If mouse is at center → no rotation (0deg)
    // If mouse is at edge → max rotation (±1deg)
     const rotateY = ((x - centerX) / centerX) * 1; // Max 1 degree
                                                   // Horizontal tilt
    // Apply 3D transform to card (lift + tilt)
    card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };
   // HANDLER 2: Reset card when mouse leaves
  const handleStoryMouseLeave = (e) => {
    // Remove transform → card returns to normal
    e.currentTarget.style.transform = ''; // Reset animation
  
  };

  // 🛠️ getInitials is now imported from @/utils/helpers

  // Build stories from real data:
  // 1) Always show "+" card to add new story
  // 2) Show your username card if you have stories  
  // 3) Show friends with stories
  const stories = [
    // Always show + card to add stories
    { id: 'add', name: "Add Story", avatar: "+", hasStory: false, isYours: true, isAddCard: true },
    // Your story card (only if you have stories)
    ...(myStories.length > 0 ? [{
      id: user?.id,
      name: user?.username || 'You',
      avatar: getInitials(user),
      hasStory: hasUnviewedStories(myStories), // Ring only if unviewed
      isYours: true,
      // Use profile_picture from stories API as fallback (backend returns it with story.user)
      profilePicture: user?.profile_picture || myStories[0]?.user?.profile_picture,
    }] : []),
    // Map friend story groups to story cards
    ...friendStories.map(group => ({
      id: group.user_id,
      name: group.user?.username || 'User',
      avatar: getInitials(group.user),
      hasStory: hasUnviewedStories(group.stories), // Ring only if unviewed
      profilePicture: group.user?.profile_picture,
    }))
  ];

  return (
    <div 
      className="feed-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullProgress > 0 || isRefreshing) && (
        <div 
          className={`pull-to-refresh-indicator ${isRefreshing ? 'refreshing' : ''}`}
          style={{ 
            opacity: pullProgress,
            transform: `translateY(${pullProgress * 40}px)`
          }}
        >
          <span className="refresh-icon">↻</span>
        </div>
      )}
      
       {/* 🟢 Section 1: Composer (click to open modal) */}
      <div className="composer-section">
        <div className="composer-avatar">
          <UserIcon size={24} />
        </div>
        <div className="composer-input-wrapper">
          {/* Action buttons on left */}
          <div className="composer-actions">
            <button 
              className="composer-action-btn media-btn"
              onClick={() => {
                setComposerType('media');
                setShowComposer(true);
              }}
              title="Add photo"
            >
              <ImageIcon size={22} />
            </button>
            <button 
              className="composer-action-btn milestone-btn"
              onClick={() => {
                setComposerType('milestone');
                setShowComposer(true);
              }}
              title="Add milestone"
            >
              <FlagIcon size={22} />
            </button>
          </div>
          <textarea
            className="composer-input"
            placeholder="Share something…"
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={handleInlineKeyDown}
            rows={1}
            disabled={isPosting}
          />
          {/* Post icon - shows when there's text */}
          {composerText.trim() && !isPosting && (
            <span 
              className="composer-post-icon"
              onClick={handleInlinePost}
              title="Post"
            >
              <PostTriangleIcon size={16} />
            </span>
          )}
        </div>
      </div>

       {/* 🟢 Section 2: Stories carousel */}
      <div className="stories-section">
        <div className="stories-scroll">
          {stories.map((story, index) => ( // 🔵 Loop through stories array
            <div 
              key={story.id} 
              className={`story-card ${story.isAddCard ? 'add-story' : ''} ${story.isYours && !story.isAddCard ? 'your-story' : ''}`}
              onMouseMove={handleStoryMouseMove}
              onMouseLeave={handleStoryMouseLeave}
              onClick={() => {
                if (story.isAddCard) {
                  // + card always opens upload modal
                  setShowStoryUpload(true);
                } else if (story.isYours) {
                  // Your story card - view your stories
                  setStoryViewerIndex(0); // User's stories are always first
                  setShowStoryViewer(true);
                } else if (friendStories.length > 0) {
                  // Find the index in friendStories that matches this story
                  const friendIndex = friendStories.findIndex(s => s.user_id === story.id);
                  if (friendIndex >= 0) {
                    // Offset by 1 if user has their own stories (they're at index 0)
                    const viewerIndex = myStories.length > 0 ? friendIndex + 1 : friendIndex;
                    setStoryViewerIndex(viewerIndex);
                    setShowStoryViewer(true);
                  }
                }
              }}
            >
              <div className={`story-avatar ${story.hasStory ? 'has-story' : ''} avatar-color-${index % 3}`}>
                {story.isAddCard ? (
                  // Add Story card - show + icon
                  <div className="add-story-icon">+</div>
                ) : story.profilePicture ? (
                  // Has profile picture - show it
                  <img src={story.profilePicture} alt={story.name} className="story-avatar-img" />
                ) : (
                  // No profile picture - show initials or icon
                  <span className="story-initials">{story.avatar || <UserIcon size={28} />}</span>
                )}
              </div>
              <div className="story-name">{story.name}</div>
            </div>
          ))}
        </div>
        {/* Daily Learning Widget - fits in space next to stories */}
        <DailyLearning variant="sidebar" />
      </div>

       {/* 🟢 Section 3: Timeline River Feed (the main posts) */}
      <TimelineRiverFeed
      // PROP 1: Pass the entire posts array (data)
        posts={posts}// ⚠️ CRITICAL: Passes posts data to child component
      //↑ name of prop   ↑ value (the array)

      // PROP 2: Pass state variable (so child knows which comment is open)
        activeCommentPostId={activeCommentPostId}

        // PROP 3: Pass state SETTER (so child can CHANGE parent's state!)
        setActiveCommentPostId={setActiveCommentPostId}

        // PROP 4: Pass state variable (comment text)
        commentText={commentText}
        //          ↑ current value
        setCommentText={setCommentText}
         // PROP 5: Pass state SETTER (so child can update text)
        
        // PROP 6 & 7: Delete and update actions
        onDeletePost={deletePost}
        onUpdatePost={updatePost}
      />

    {/* 🟢 Section 4: Composer Modal (shared with Profile) */}
      <ComposerModal 
        showComposer={showComposer}
        setShowComposer={setShowComposer}
        composerType={composerType}
        setComposerType={setComposerType}
        initialContent={composerText}
        onOpen={() => setComposerText('')}
      />

      {/* 🟢 Section 5: Story Modals */}
      <StoryUploadModal 
        isOpen={showStoryUpload} 
        onClose={() => setShowStoryUpload(false)} 
      />
      <StoryViewer 
        isOpen={showStoryViewer}
        onClose={() => setShowStoryViewer(false)}
        initialUserIndex={storyViewerIndex}
        storyGroups={
          // Combine user's stories (first) with friend stories
          myStories.length > 0 
            ? [{ user_id: user?.id, user: user, stories: myStories }, ...friendStories]
            : friendStories
        }
      />
    </div>
  );
}

export default Home;