// ProfileSection.jsx - Avatar, song, mood, and about me
import { useState } from 'react';
import { EditIcon, UserIcon } from '@assets/icons';
import './ProfileSection.scss';

// Import avatars for picker
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
import av17 from '@assets/icons/avatars/av17.png';
import myAvatar from '@assets/icons/avatars/my-avatar.png';

const AVATAR_LIBRARY = [
  { id: 'my-avatar', src: myAvatar, label: 'default' },
  { id: 'av2', src: av2 },
  { id: 'av3', src: av3 },
  { id: 'av4', src: av4 },
  { id: 'av5', src: av5 },
  { id: 'av6', src: av6 },
  { id: 'av7', src: av7 },
  { id: 'av8', src: av8 },
  { id: 'av9', src: av9 },
  { id: 'av10', src: av10 },
  { id: 'av11', src: av11 },
  { id: 'av12', src: av12 },
  { id: 'av13', src: av13 },
  { id: 'av14', src: av14 },
  { id: 'av15', src: av15 },
  { id: 'av16', src: av16 },
  { id: 'av17', src: av17 },
];

const MOOD_OPTIONS = [
  { id: 'chillin', label: 'chillin' },
  { id: 'hyped', label: 'hyped' },
  { id: 'tired', label: 'tired' },
  { id: 'in-love', label: 'in love' },
  { id: 'pissed', label: 'pissed' },
  { id: 'rockin', label: 'rockin' },
  { id: 'bored', label: 'bored' },
  { id: 'on-fire', label: 'on fire' },
  { id: 'whatever', label: 'whatever' },
  { id: 'emo', label: 'emo' },
];

function ProfileSection({ 
  avatarSrc, 
  displayUsername, 
  songTitle, 
  songArtist, 
  mood, 
  customBio, 
  isEditing, 
  onUpdateField,
  isOwnSpace = false,
  onAvatarChange,
  userProfilePicture // Numeneon profile picture URL
}) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(customBio);

  const handleAvatarSelect = (avatar) => {
    if (onAvatarChange) {
      onAvatarChange(avatar.src, avatar.id);
    }
    setShowAvatarPicker(false);
  };

  const handleUseProfilePicture = () => {
    if (onAvatarChange && userProfilePicture) {
      onAvatarChange(userProfilePicture, 'profile-picture');
    }
    setShowAvatarPicker(false);
  };

  const handleBioSave = () => {
    onUpdateField('customBio', tempBio);
    setIsEditingBio(false);
  };

  const handleBioCancel = () => {
    setTempBio(customBio);
    setIsEditingBio(false);
  };

  return (
    <section className="profile-section">
      {/* Avatar */}
      <div className="avatar-container">
        <img 
          src={avatarSrc}
          alt={displayUsername}
          className="mystudio-avatar"
        />
        {/* Edit icon - only show for own space */}
        {isOwnSpace && (
          <button 
            className="avatar-edit-btn"
            onClick={() => setShowAvatarPicker(true)}
            title="Change avatar"
          >
            <EditIcon size={16} />
          </button>
        )}
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="avatar-picker-overlay" onClick={() => setShowAvatarPicker(false)}>
          <div className="avatar-picker-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="picker-title">choose avatar</h3>
            
            {/* Option to use Numeneon profile picture */}
            {userProfilePicture ? (
              <div className="profile-pic-option">
                <button 
                  className="use-profile-pic-btn"
                  onClick={handleUseProfilePicture}
                >
                  <img src={userProfilePicture} alt="Your profile" className="profile-pic-preview" />
                  <span>use my numeneon profile pic</span>
                </button>
              </div>
            ) : (
              <div className="profile-pic-option profile-pic-option--empty">
                <p className="no-pic-message">upload a profile pic in your numeneon profile to use it here</p>
              </div>
            )}
            
            <p className="picker-divider">or pick from library</p>
            
            <div className="picker-grid">
              {AVATAR_LIBRARY.map((avatar) => (
                <button
                  key={avatar.id}
                  className={`picker-option ${avatar.label ? 'picker-option--labeled' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img src={avatar.src} alt={avatar.id} />
                  {avatar.label && <span className="picker-label">{avatar.label}</span>}
                </button>
              ))}
            </div>
            <button 
              className="picker-close"
              onClick={() => setShowAvatarPicker(false)}
            >
              cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Song Display */}
      <div className="song-section">
        <p className="song-label">currently vibing to</p>
        {isEditing ? (
          <div className="song-edit">
            <input
              type="text"
              placeholder="song name"
              value={songTitle}
              onChange={(e) => onUpdateField('songTitle', e.target.value)}
              className="song-input"
            />
            <input
              type="text"
              placeholder="artist"
              value={songArtist}
              onChange={(e) => onUpdateField('songArtist', e.target.value)}
              className="song-input"
            />
          </div>
        ) : (
          <p className="song-display">
            {songTitle 
              ? `${songTitle} - ${songArtist}`
              : 'nothing playing...'}
          </p>
        )}
      </div>
      
      {/* Mood */}
      <div className="mood-section">
        <span className="mood-label">mood:</span>
        {isEditing ? (
          <div className="mood-picker">
            {MOOD_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                className={`mood-option ${mood === id ? 'selected' : ''}`}
                onClick={() => onUpdateField('mood', id)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <span className="mood-display">
            {MOOD_OPTIONS.find(m => m.id === mood)?.label || mood}
          </span>
        )}
      </div>

      {/* About Me */}
      <div className="about-section">
        <div className="section-header">
          <h2 className="section-title">about me</h2>
          {/* Edit icon - only show for own space when not already editing */}
          {isOwnSpace && !isEditing && !isEditingBio && (
            <button 
              className="about-edit-btn"
              onClick={() => {
                setTempBio(customBio);
                setIsEditingBio(true);
              }}
              title="Edit bio"
            >
              <EditIcon size={14} />
            </button>
          )}
        </div>
        <div className="about-box">
          {(isEditing || isEditingBio) ? (
            <>
              <textarea
                className="about-textarea"
                placeholder="tell the world about yourself..."
                value={isEditingBio ? tempBio : customBio}
                onChange={(e) => isEditingBio ? setTempBio(e.target.value) : onUpdateField('customBio', e.target.value)}
                rows={4}
              />
              {isEditingBio && (
                <div className="bio-edit-actions">
                  <button className="bio-btn bio-btn--cancel" onClick={handleBioCancel}>
                    cancel
                  </button>
                  <button className="bio-btn bio-btn--save" onClick={handleBioSave}>
                    save
                  </button>
                </div>
              )}
            </>
          ) : (
            <div 
              className="about-content"
              dangerouslySetInnerHTML={{ 
                __html: customBio || 'this user hasn\'t written anything yet...' 
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default ProfileSection;
