// 🔵 PABLO - UI/Styling
// MyStudio.jsx - Nostalgic MySpace-style profile page renamed to MyStudio
// Accessed via the throwback button on ProfileCard
// REBEL VIBES: lorelei-neutral avatars, Doto font, no emojis, sharp edges

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MyStudio.scss';
import { useAuth, useFriends } from '@contexts';
import { ChevronLeftIcon } from '@assets/icons';
import { getMyStudioProfile, updateMyStudioProfile, addSongToPlaylist, removeSongFromPlaylist } from '@services/myStudioService';

// Subcomponents
import { MusicPlayer, Top8Friends, ThemePicker, ProfileSection, SearchBar, MyStudioSetup } from './components';

// Import local rebel avatars

import av2 from '@assets/icons/avatars/av2.jpg';
import av3 from '@assets/icons/avatars/av3.webp';
import av4 from '@assets/icons/avatars/av4.webp';
import av5 from '@assets/icons/avatars/av5.webp';
import av6 from '@assets/icons/avatars/av6.jpg';
import av7 from '@assets/icons/avatars/av7.webp';
import av8 from '@assets/icons/avatars/av8.jpg';
import av9 from '@assets/icons/avatars/av9.webp';
import av10 from '@assets/icons/avatars/av10.webp';
import av11 from '@assets/icons/avatars/av11.webp';
import av12 from '@assets/icons/avatars/av12.png';
import av13 from '@assets/icons/avatars/av13.avif';
import av14 from '@assets/icons/avatars/av14.png';
import av15 from '@assets/icons/avatars/av15.jpg';
import av16 from '@assets/icons/avatars/av16.png';
import av17 from '@assets/icons/avatars/av17.png'
import myAvatar from '@assets/icons/avatars/my-avatar.png';

// Import wallpapers for inline style
import bipolarInvert from '@assets/wallpapers/Bipolar-invert.webp';
import bipolarPink from '@assets/wallpapers/Bipolar-pink.webp';
import bipolarTeal from '@assets/wallpapers/Bipolar-teal.webp';
import triad from '@assets/wallpapers/triad.webp';
import triad2 from '@assets/wallpapers/triad-2.webp';
import triad3 from '@assets/wallpapers/triad-3.webp';
import triad31 from '@assets/wallpapers/triad-3-1.webp';
import triasPattern from '@assets/wallpapers/trias-pattern.webp';
import peacockWarp from '@assets/wallpapers/PEACOCK-warp.webp';
import colorsVertical from '@assets/wallpapers/colors-vertical.webp';

// Image wallpapers
const WALLPAPER_MAP = {
  none: null,
  invert: bipolarInvert,
  pink: bipolarPink,
  teal: bipolarTeal,
  triad: triad,
  triad2: triad2,
  triad3: triad3,
  triad31: triad31,
  triasPattern: triasPattern,
  peacockWarp: peacockWarp,
  colorsVertical: colorsVertical,
};

// CSS gradient wallpapers
const CSS_WALLPAPER_MAP = {
  cyberpunk: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  neonCity: 'linear-gradient(180deg, #0a0015 0%, #1a0030 30%, #ff00ff20 70%, #00ffff10 100%)',
  vaporwave: 'linear-gradient(180deg, #ff71ce 0%, #01cdfe 25%, #05ffa1 50%, #b967ff 75%, #fffb96 100%)',
  matrix: 'linear-gradient(180deg, #000000 0%, #003300 50%, #00ff00 100%)',
  sunset: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 20%, #16213e 40%, #e94560 70%, #ff6b6b 100%)',
  aurora: 'linear-gradient(135deg, #000428 0%, #004e92 25%, #00d4ff 50%, #7b2ff7 75%, #f107a3 100%)',
  deepSpace: 'radial-gradient(ellipse at bottom, #1b2838 0%, #090a0f 100%)',
  hologram: 'linear-gradient(45deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)',
  midnight: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)',
  bloodMoon: 'radial-gradient(circle at 30% 30%, #4a0000 0%, #1a0000 50%, #0a0000 100%)',
  electric: 'linear-gradient(135deg, #000000 0%, #1a0a30 25%, #0a1a30 50%, #00ffff30 100%)',
  fire: 'linear-gradient(180deg, #000000 0%, #1a0a00 30%, #ff4500 70%, #ff8c00 100%)',
  cosmic: 'radial-gradient(ellipse at center, #1a0030 0%, #0d001a 50%, #000000 100%)',
  glitch: 'repeating-linear-gradient(90deg, #ff00ff10 0px, #ff00ff10 2px, transparent 2px, transparent 4px), linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
  grid: 'repeating-linear-gradient(0deg, transparent 0px, transparent 49px, #00ffff20 49px, #00ffff20 50px), repeating-linear-gradient(90deg, transparent 0px, transparent 49px, #00ffff20 49px, #00ffff20 50px), linear-gradient(180deg, #000000 0%, #0a0a1a 100%)',
  // Animated wallpapers (base gradient - animation handled by CSS class)
  floatingOrbs: 'linear-gradient(135deg, #0a0015 0%, #1a0030 100%)',
  starfield: 'radial-gradient(ellipse at bottom, #0d1b2a 0%, #000000 100%)',
  bubbles: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
  fireflies: 'linear-gradient(180deg, #0a0a0a 0%, #1a2a1a 50%, #0a0a0a 100%)',
  neonRain: 'linear-gradient(180deg, #0a0015 0%, #000000 100%)',
};

// Map wallpaper IDs to animation class names
const ANIMATED_WALLPAPER_MAP = {
  floatingOrbs: 'animated-orbs',
  starfield: 'animated-starfield',
  bubbles: 'animated-bubbles',
  fireflies: 'animated-fireflies',
  neonRain: 'animated-neon-rain',
};

// ═══════════════════════════════════════════════════════════════
// 🎯 PABLO: CHANGE AVATARS HERE! 
// Just change the numbers to pick which avatar for each slot
// Example: av3 for slot 1, av7 for slot 2, etc.
// ═══════════════════════════════════════════════════════════════
const TOP8_AVATARS = [
  av16,    // Friend slot 1
  av15,   // Friend slot 2  
  av17,    // Friend slot 3
  av8,    // Friend slot 4
  av13,   // Friend slot 5
  av6,    // Friend slot 6
  av7,    // Friend slot 7
  av8,    // Friend slot 8
];

// Main user avatar - change this one for your profile pic
const MY_AVATAR = myAvatar;
// ═══════════════════════════════════════════════════════════════

// All avatars (for hash fallback)
const REBEL_AVATARS = [av2, av3, av4, av5, av6, av7, av8, av9, av10, av11, av12, av13, av14, av15, av16, av17];

// Mock data until backend is ready (fallback)
// Backend will provide preview_url from Spotify/Deezer API
const DEFAULT_MYSPACE_DATA = {
  songTitle: '',
  songArtist: '',
  mood: 'chillin',
  customBio: '',
  theme: 'classic',
  wallpaper: 'none',
  topFriends: [],
  // Music player playlist - backend will add preview_url for audio playback
  playlist: [
    { id: 1, title: 'Pneuma', artist: 'Tool', duration: '11:53', preview_url: null },
    { id: 2, title: 'The Speaker is Systematically Blown', artist: 'Author Punisher', duration: '4:14', preview_url: null },
    { id: 3, title: 'Sweet Dreams', artist: 'Eurythmics', duration: '3:36', preview_url: null },
  ],
  currentTrack: 0,
  isPlaying: false,
  volume: 75,
  sliderStyle: 1, // 1-10 for different slider styles
};

// Load saved preferences from localStorage (for immediate hydration)
const getSavedPreferences = (username) => {
  if (!username) return {};
  try {
    const saved = localStorage.getItem(`myspace_${username}`);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Get friend avatar from TOP8_AVATARS config
const getFriendAvatar = (index) => TOP8_AVATARS[index] || REBEL_AVATARS[0];

function MyStudio() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { friends } = useFriends();
  
  // Determine if viewing own MyStudio or someone else's
  // These will recalculate on every render when username changes
  const isOwnSpace = !username || username === currentUser?.username;
  const displayUsername = username || currentUser?.username;
  
  // Get the viewed user's data (for avatar when viewing someone else's space)
  // Must be before useState so it's available on first render
  const viewedUser = isOwnSpace 
    ? currentUser 
    : friends.find(f => f.username === username);
  
  // MySpace profile state - initialize with saved preferences for instant load
  const [mySpaceData, setMySpaceData] = useState(() => ({
    ...DEFAULT_MYSPACE_DATA,
    ...getSavedPreferences(displayUsername),
  }));
  const [isEditing, setIsEditing] = useState(false);
  
  // Check if user has completed setup (only for own space)
  const [hasCompletedSetup, setHasCompletedSetup] = useState(() => {
    if (!isOwnSpace) return true; // Always show others' spaces
    const saved = localStorage.getItem(`mystudio_setup_${displayUsername}`);
    return saved === 'true';
  });
  
  // Handle setup completion
  const handleSetupComplete = async (setupData) => {
    // Save setup data
    const newData = {
      ...mySpaceData,
      customBio: setupData.customBio,
      selectedAvatar: setupData.avatar,
    };
    setMySpaceData(newData);
    
    // Mark setup as complete
    localStorage.setItem(`mystudio_setup_${displayUsername}`, 'true');
    localStorage.setItem(`myspace_${displayUsername}`, JSON.stringify(newData));
    setHasCompletedSetup(true);
    
    // Try to save to backend
    try {
      await updateMyStudioProfile(newData);
    } catch {
      // Fallback saved to localStorage already
    }
  };
  
  // Re-load data when username changes (navigating to different user's space)
  useEffect(() => {
    const targetUsername = username || currentUser?.username;
    if (!targetUsername) return;
    
    let cancelled = false;
    
    (async () => {
      try {
        // Always use getMyStudioProfile with username (works for both own and others)
        const data = await getMyStudioProfile(targetUsername);
        if (!cancelled) {
          // Merge data, but keep default playlist if API returns empty
          const mergedData = { ...DEFAULT_MYSPACE_DATA, ...data };
          if (!data.playlist || data.playlist.length === 0) {
            mergedData.playlist = DEFAULT_MYSPACE_DATA.playlist;
          }
          setMySpaceData(mergedData);
          setIsEditing(false);
        }
      } catch {
        // API not available, using localStorage fallback
        // But ONLY for non-playlist data - playlist needs API for preview_url
        if (!cancelled) {
          const saved = localStorage.getItem(`myspace_${targetUsername}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            const mergedData = { ...DEFAULT_MYSPACE_DATA, ...parsed };
            // Always use default playlist (with preview_url) if localStorage has stale data
            mergedData.playlist = DEFAULT_MYSPACE_DATA.playlist;
            setMySpaceData(mergedData);
          }
          setIsEditing(false);
        }
      }
    })();
    
    return () => { cancelled = true; };
  }, [username, currentUser?.username, isOwnSpace]);

  // Save to backend when editing is done
  const handleSaveChanges = async () => {
    if (!isOwnSpace) return;
    
    try {
      await updateMyStudioProfile(mySpaceData);
    } catch {
      // API save failed, using localStorage fallback (but don't save playlist - needs API)
      const dataToSave = { ...mySpaceData };
      delete dataToSave.playlist; // Don't cache playlist - always fetch fresh from API
      localStorage.setItem(`myspace_${displayUsername}`, JSON.stringify(dataToSave));
    }
    setIsEditing(false);
  };
  
  // Save non-playlist data to localStorage as backup
  useEffect(() => {
    if (isOwnSpace && displayUsername) {
      const dataToSave = { ...mySpaceData };
      delete dataToSave.playlist; // Don't cache playlist - needs preview_url from API
      localStorage.setItem(`myspace_${displayUsername}`, JSON.stringify(dataToSave));
    }
  }, [mySpaceData, displayUsername, isOwnSpace]);
  
  // Get top 8 friends (use saved order or default to first 8)
  const topFriends = mySpaceData.topFriends.length > 0
    ? mySpaceData.topFriends
        .map(id => friends.find(f => f.id === id))
        .filter(Boolean)
        .slice(0, 8)
    : friends.slice(0, 8);
  
  // Handlers
  const handleBack = () => {
    navigate(username ? `/profile/${username}` : '/profile');
  };
  
  const updateField = (field, value) => {
    setMySpaceData(prev => ({ ...prev, [field]: value }));
  };

  // Add a song to the playlist (max 5 songs)
  const handleAddSong = async (song) => {
    // Check frontend limit first
    if (mySpaceData.playlist.length >= 5) {
      alert('max 5 songs allowed - remove one first');
      return;
    }
    try {
      const addedSong = await addSongToPlaylist(song);
      setMySpaceData(prev => ({
        ...prev,
        playlist: [...prev.playlist, addedSong]
      }));
    } catch (error) {
      console.error('Failed to add song:', error);
      // Show user-friendly error
      const message = error.response?.data?.detail || error.response?.data?.error || 'failed to add song';
      alert(message);
    }
  };

  // Remove a song from the playlist
  const handleRemoveSong = async (songId) => {
    try {
      await removeSongFromPlaylist(songId);
      setMySpaceData(prev => ({
        ...prev,
        playlist: prev.playlist.filter(s => s.id !== songId),
        currentTrack: Math.min(prev.currentTrack, Math.max(0, prev.playlist.length - 2))
      }));
    } catch (error) {
      console.error('Failed to remove song:', error);
    }
  };

  // Get avatar for current view (prioritize custom avatar from library if set)
  const avatarSrc = isOwnSpace 
    ? (mySpaceData.customAvatarSrc || currentUser?.profile_picture || MY_AVATAR)
    : (viewedUser?.profile_picture || TOP8_AVATARS[topFriends.findIndex(f => f?.username === username)] || REBEL_AVATARS[0]);

  // Get wallpaper style (supports both image and CSS gradient wallpapers)
  const wallpaperSrc = WALLPAPER_MAP[mySpaceData.wallpaper];
  const cssWallpaper = CSS_WALLPAPER_MAP[mySpaceData.wallpaper];
  const animatedClass = ANIMATED_WALLPAPER_MAP[mySpaceData.wallpaper] || '';
  const wallpaperStyle = wallpaperSrc ? {
    backgroundImage: `url(${wallpaperSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center bottom',
    backgroundAttachment: 'fixed',
  } : cssWallpaper ? {
    background: cssWallpaper,
    backgroundAttachment: 'fixed',
  } : {};
  
  // Show setup flow for first-time users (only when viewing own space)
  if (isOwnSpace && !hasCompletedSetup) {
    return (
      <MyStudioSetup 
        username={displayUsername} 
        onComplete={handleSetupComplete} 
      />
    );
  }
  
  return (
    <div 
      className={`mystudio-page theme-${mySpaceData.theme} ${animatedClass}`}
      style={wallpaperStyle}
    >
      <header className="mystudio-header">
        <button className="back-btn" onClick={handleBack}>
          <ChevronLeftIcon size={20} />
          <span>numeneon</span>
        </button>
        <h1 className="mystudio-title">
          {displayUsername}'s studio
        </h1>
        <div className="header-actions">
          {/* Show "my studio" button when viewing someone else's */}
          {!isOwnSpace && (
            <button 
              className="my-studio-btn"
              onClick={() => navigate('/mystudio')}
            >
              my studio
            </button>
          )}
          {isOwnSpace && (
            <button 
              className="edit-toggle-btn"
              onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
            >
              {isEditing ? 'done' : 'edit'}
            </button>
          )}
        </div>
      </header>
      
      {/* Search to invite users - only visible to owner */}
      {isOwnSpace && (
        <div className="mystudio-invite-section">
          <SearchBar />
        </div>
      )}
      
      {/* Main Content */}
      <main className="mystudio-content">
        {/* Left Column - Profile Info */}
        <ProfileSection
          avatarSrc={avatarSrc}
          displayUsername={displayUsername}
          songTitle={mySpaceData.songTitle}
          songArtist={mySpaceData.songArtist}
          mood={mySpaceData.mood}
          customBio={mySpaceData.customBio}
          isEditing={isEditing}
          onUpdateField={updateField}
          isOwnSpace={isOwnSpace}
          onAvatarChange={(src, id) => {
            updateField('selectedAvatar', id);
            updateField('customAvatarSrc', src);
          }}
          userProfilePicture={currentUser?.profile_picture}
        />
        
        {/* Right Column - Music Player & Friends */}
        <section className="content-section">
          {/* RETRO MUSIC PLAYER */}
          <MusicPlayer
            playlist={mySpaceData.playlist}
            currentTrack={mySpaceData.currentTrack}
            isPlaying={mySpaceData.isPlaying}
            volume={mySpaceData.volume}
            sliderStyle={mySpaceData.sliderStyle}
            isEditing={isEditing}
            onUpdateField={updateField}
            onAddSong={handleAddSong}
            onRemoveSong={handleRemoveSong}
          />
          
          {/* Top 8 Friends */}
          <Top8Friends
            topFriends={topFriends}
            getFriendAvatar={getFriendAvatar}
          />
          
          {/* Theme Picker */}
          <ThemePicker
            currentTheme={mySpaceData.theme}
            currentWallpaper={mySpaceData.wallpaper}
            onUpdateField={updateField}
            isVisible={isOwnSpace}
          />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="mystudio-footer">
        <marquee scrollamount="2">
          thanks 4 visiting my studio -- add me on numeneon -- xoxo
        </marquee>
      </footer>
    </div>
  );
}

export default MyStudio;
