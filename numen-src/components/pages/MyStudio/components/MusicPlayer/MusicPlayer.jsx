// MusicPlayer.jsx - Retro MySpace-style music player with actual audio playback
import { useState, useEffect, useRef, useCallback } from 'react';
import { searchSongs } from '@services/myStudioService';
import './MusicPlayer.scss';

// Custom SVG Icons for player controls
const ShuffleIcon = ({ size = 16, active }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5" />
    <path d="M4 20L21 3" />
    <path d="M21 16v5h-5" />
    <path d="M15 15l6 6" />
    <path d="M4 4l5 5" />
  </svg>
);

const RepeatIcon = ({ size = 16, active }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    {active && <circle cx="12" cy="12" r="2" fill="currentColor" />}
  </svg>
);

const PrevIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="5" width="3" height="14" rx="1" />
    <polygon points="21,5 21,19 8,12" />
  </svg>
);

const NextIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="18" y="5" width="3" height="14" rx="1" />
    <polygon points="3,5 3,19 16,12" />
  </svg>
);

const PlayIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const PauseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="3" width="5" height="18" rx="1" />
    <rect x="14" y="3" width="5" height="18" rx="1" />
  </svg>
);

const SLIDER_STYLES = [
  { id: 1, name: 'star', colors: ['#dcb004', '#e34f1e'] },
  { id: 2, name: 'cyan', colors: ['#0010d5', '#00d1de'] },
  { id: 3, name: 'pink', colors: ['#cc040d', '#d44dbf'] },
  { id: 4, name: 'green', colors: ['#08c300', '#aaca00'] },
  { id: 5, name: 'gray', colors: ['#0f0f0f', '#737373'] },
  { id: 6, name: 'octagon', colors: ['#8b5cf6', '#a855f7'] },
  { id: 7, name: 'diamond', colors: ['#06b6d4', '#14b8a6'] },
  { id: 8, name: 'heart', colors: ['#f43f5e', '#ec4899'] },
  { id: 9, name: 'hexagon', colors: ['#f97316', '#fb923c'] },
  { id: 10, name: 'cross', colors: ['#22c55e', '#4ade80'] },
];



// Format seconds to M:SS
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function MusicPlayer({ 
  playlist, 
  currentTrack, 
  isPlaying, 
  volume, 
  sliderStyle,
  isEditing,
  onUpdateField,
  onAddSong,
  onRemoveSong
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [audioError, setAudioError] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  const track = playlist?.[currentTrack] || playlist?.[0] || { 
    title: 'no music', 
    artist: '...', 
    duration: '0:00',
    preview_url: null
  };

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    // Event listeners
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioError(null); // Clear error on successful load
    };
    const handleError = () => {
      setAudioError('Preview unavailable');
      onUpdateField('isPlaying', false);
    };
    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else if (shuffle) {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        onUpdateField('currentTrack', randomIndex);
      } else {
        // Auto-advance to next track
        const nextTrack = currentTrack + 1;
        if (nextTrack < playlist.length) {
          onUpdateField('currentTrack', nextTrack);
        } else {
          onUpdateField('isPlaying', false);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, playlist.length, repeat, shuffle, isPlaying, onUpdateField]);

  // Get the audio URL - only use preview_url
  const getAudioUrl = (trackIndex) => {
    const t = playlist?.[trackIndex];
    return t?.preview_url || null;
  };

  // Handle track change
  useEffect(() => {
    if (audioRef.current) {
      const audioUrl = getAudioUrl(currentTrack);
      setAudioError(null);
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.currentTime = 0;
      } else {
        setAudioError('No preview available');
      }
    }
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      const audioUrl = getAudioUrl(currentTrack);
      if (isPlaying && audioUrl) {
        audioRef.current.play().catch(err => {
          console.log('Playback error:', err);
          setAudioError('Preview unavailable');
          onUpdateField('isPlaying', false);
        });
      } else if (!audioUrl && isPlaying) {
        setAudioError('No preview available');
        onUpdateField('isPlaying', false);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, onUpdateField]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (volume || 75) / 100;
    }
  }, [volume]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search by 400ms
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchSongs(searchQuery);
        setSearchResults(results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle adding a song
  const handleAddSong = async (song) => {
    if (onAddSong) {
      await onAddSong(song);
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle removing a song
  const handleRemoveSong = async (songId, e) => {
    e.stopPropagation();
    if (onRemoveSong) {
      await onRemoveSong(songId);
    }
  };

  // Progress bar click handler
  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-player-section">
      <h2 className="section-title">my music</h2>
      <div className="music-player">
        {/* Player Display */}
        <div className="player-display">
          <div className="now-playing">
            <span className="np-label">now playing:</span>
            {audioError ? (
              <span className="np-error">{audioError}</span>
            ) : (
              <marquee className="np-track" scrollamount="2">
                {track.title} - {track.artist}
              </marquee>
            )}
          </div>
          <div className="player-time">
            <span>{formatTime(currentTime)}</span>
            <div className="progress-bar" onClick={handleProgressClick}>
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span>{formatTime(duration) || track.duration}</span>
          </div>
        </div>
        
        {/* Player Controls */}
        <div className="player-controls">
          <button 
            className="control-btn"
            onClick={() => onUpdateField('currentTrack', Math.max(0, currentTrack - 1))}
            title="Previous"
          >
            <PrevIcon />
          </button>
          <button 
            className={`control-btn play-btn ${audioError ? 'disabled' : ''}`}
            onClick={() => !audioError && onUpdateField('isPlaying', !isPlaying)}
            title={audioError ? 'Preview unavailable' : isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button 
            className="control-btn"
            onClick={() => onUpdateField('currentTrack', Math.min(playlist.length - 1, currentTrack + 1))}
            title="Next"
          >
            <NextIcon />
          </button>
          <button 
            className={`control-btn icon-btn ${shuffle ? 'active' : ''}`}
            onClick={() => setShuffle(!shuffle)}
            title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <ShuffleIcon active={shuffle} />
          </button>
          <button 
            className={`control-btn icon-btn ${repeat ? 'active' : ''}`}
            onClick={() => setRepeat(!repeat)}
            title={repeat ? 'Repeat On' : 'Repeat Off'}
          >
            <RepeatIcon active={repeat} />
          </button>
        </div>

        {/* Volume Slider - CodePen Style */}
        <div className="volume-section">
          <div className="volume-row">
            <span className="volume-label">volume</span>
            <input 
              type="range" 
              className={`codepen-slider style-${sliderStyle || 1}`}
              min="0" 
              max="100" 
              value={volume || 75}
              style={{ '--val': volume || 75 }}
              onChange={(e) => onUpdateField('volume', parseInt(e.target.value))}
            />
          </div>
          
          {/* Slider Style Picker (Edit Mode) */}
          {isEditing && (
            <div className="slider-picker">
              <span className="picker-label">slider style:</span>
              <div className="slider-options">
                {SLIDER_STYLES.map(({ id, name, colors }) => (
                  <button
                    key={id}
                    className={`slider-option ${sliderStyle === id ? 'selected' : ''}`}
                    style={{ 
                      '--c0': colors[0], 
                      '--c1': colors[1] 
                    }}
                    onClick={() => onUpdateField('sliderStyle', id)}
                    title={name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Playlist */}
        <div className="playlist">
          <div className="playlist-header">playlist</div>
          {playlist.map((t, index) => (
            <div 
              key={t.id}
              className={`playlist-item ${index === currentTrack ? 'active' : ''}`}
              onClick={() => onUpdateField('currentTrack', index)}
            >
              <span className="track-num">{index + 1}.</span>
              <span className="track-info">
                <span className="track-title">{t.title}</span>
                <span className="track-artist">{t.artist}</span>
              </span>
              <span className="track-duration">{t.duration}</span>
              {isEditing && (
                <button 
                  className="track-remove"
                  onClick={(e) => handleRemoveSong(t.id, e)}
                  title="Remove from playlist"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Search & Add Song (Edit Mode) */}
        {isEditing && (
          <div className="song-search">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="search songs on deezer..." 
                className="song-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <span className="search-spinner">...</span>}
            </div>
            
            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((song) => (
                  <div key={song.id || song.deezer_id} className="search-result-item">
                    {song.album_art && (
                      <img src={song.album_art} alt="" className="result-art" />
                    )}
                    <div className="result-info">
                      <span className="result-title">{song.title}</span>
                      <span className="result-artist">{song.artist}</span>
                    </div>
                    <span className="result-duration">{song.duration}</span>
                    <button 
                      className="result-add-btn"
                      onClick={() => handleAddSong(song)}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {showResults && searchResults.length === 0 && !isSearching && (
              <div className="search-no-results">no results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicPlayer;
