// 🔵 PABLO & CRYSTAL - MyStudio Setup Flow
// Welcome screen for first-time MyStudio users
// Step 1: Pick avatar from library
// Step 2: Write bio
// Uses MyStudio aesthetic (Doto font, holographic, sharp edges)

import { useState } from 'react';
import './MyStudioSetup.scss';

// Import all avatars from parent
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

const AVATAR_LIBRARY = [
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

function MyStudioSetup({ username, onComplete }) {
  const [step, setStep] = useState(0); // 0: welcome, 1: avatar, 2: bio
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [bio, setBio] = useState('');

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && selectedAvatar) {
      setStep(2);
    } else if (step === 2) {
      // Complete setup
      onComplete({
        avatar: selectedAvatar.id,
        avatarSrc: selectedAvatar.src,
        customBio: bio,
      });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="mystudio-setup">
      <div className="setup-container">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="setup-step setup-welcome">
            <h1 className="setup-title">welcome to mystudio</h1>
            <p className="setup-subtitle">
              your throwback space on numeneon
            </p>
            <p className="setup-description">
              create your personal studio with a custom avatar, bio, and vibe.
              invite friends to see your space.
            </p>
            <button className="setup-btn setup-btn--primary" onClick={handleNext}>
              let's go
            </button>
          </div>
        )}

        {/* Step 1: Avatar Selection */}
        {step === 1 && (
          <div className="setup-step setup-avatar">
            <h2 className="setup-title">pick your avatar</h2>
            <p className="setup-subtitle">choose your studio persona</p>
            
            <div className="avatar-grid">
              {AVATAR_LIBRARY.map((avatar) => (
                <button
                  key={avatar.id}
                  className={`avatar-option ${selectedAvatar?.id === avatar.id ? 'avatar-option--selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img src={avatar.src} alt={avatar.id} />
                </button>
              ))}
            </div>

            <div className="setup-actions">
              <button className="setup-btn setup-btn--secondary" onClick={handleBack}>
                back
              </button>
              <button 
                className="setup-btn setup-btn--primary" 
                onClick={handleNext}
                disabled={!selectedAvatar}
              >
                next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Bio */}
        {step === 2 && (
          <div className="setup-step setup-bio">
            <h2 className="setup-title">write your bio</h2>
            <p className="setup-subtitle">tell visitors about yourself</p>
            
            {/* Preview avatar */}
            <div className="bio-preview">
              <img src={selectedAvatar?.src} alt="Your avatar" className="preview-avatar" />
              <span className="preview-name">{username}</span>
            </div>

            <textarea
              className="bio-input"
              placeholder="about me..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={4}
            />
            <span className="bio-count">{bio.length}/200</span>

            <div className="setup-actions">
              <button className="setup-btn setup-btn--secondary" onClick={handleBack}>
                back
              </button>
              <button className="setup-btn setup-btn--primary" onClick={handleNext}>
                finish
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="setup-progress">
          {[0, 1, 2].map((i) => (
            <span 
              key={i} 
              className={`progress-dot ${step === i ? 'progress-dot--active' : ''} ${step > i ? 'progress-dot--complete' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyStudioSetup;
