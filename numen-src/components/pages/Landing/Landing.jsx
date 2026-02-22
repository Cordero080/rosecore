// 🔵 PABLO - UI Architect
// Landing.jsx - Welcome/landing page

import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState, useRef } from 'react';
import { useAuth } from '@contexts/AuthContext';
import './Landing.scss';

// Golden ratio - the most aesthetically pleasing irrational number
const PHI = (1 + Math.sqrt(5)) / 2; // ≈ 1.618033988749895

function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check if user just signed up (came from signup page with welcome flag)
  const isWelcome = location.state?.welcome === true;
  
  // Track which letters have been hovered (for "hover all" replay)
  const hoveredRef = useRef(new Set());
  const isAnimatingRef = useRef(false);
  const [replayGlitch, setReplayGlitch] = useState(false);
  
  // Generate delays using golden ratio for beautiful pseudo-randomness
  // Uses the Weyl sequence: (n * φ) mod 1 - produces low-discrepancy sequence
  // This creates apparent randomness while being mathematically harmonious
  const BLOB_FADE_DELAY = 1.0;   // Wait for blobs to start fading in
  const PAGE_FADE_DURATION = 0.8; // Page fade-in duration
  const TOTAL_WAIT = BLOB_FADE_DELAY + PAGE_FADE_DURATION; // ~1.8s total before title
  const letterDelays = useMemo(() => {
    const letters = 'NUMENEON'.split('');
    return letters.map((_, i) => {
      // Weyl sequence with golden ratio - spreads evenly yet appears random
      const weyl = ((i + 1) * PHI) % 1;
      // Scale to 0.6s max delay for snappy feel, offset by blob + page fade
      return TOTAL_WAIT + (weyl * 0.6);
    });
  }, []);

  // Random-ish hover delays for each letter (50-150ms range)
  const hoverDelays = [0.08, 0.12, 0.05, 0.14, 0.09, 0.11, 0.07, 0.13];
  
  // Unique color variant for each letter (8 letters in NUMENEON)
  const colorVariants = ['magenta', 'cyan', 'aqua', 'purple', 'blue', 'orange', 'pink', 'green'];
  
  // Track letter hovers - when all 5 are hovered, trigger replay
  const handleLetterHover = (index) => {
    // Don't track while animating
    if (isAnimatingRef.current) return;
    
    // Add this letter to hovered set
    hoveredRef.current.add(index);
    
    // Check if all 8 letters have been hovered
    if (hoveredRef.current.size === 8) {
      isAnimatingRef.current = true;
      
      // Reset tracking immediately
      hoveredRef.current = new Set();
      
      // Trigger replay animation
      setReplayGlitch('reset');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setReplayGlitch('replay');
          
          // After animation completes, allow tracking again
          setTimeout(() => {
            setReplayGlitch(false);
            isAnimatingRef.current = false;
          }, 4000);
        });
      });
    }
  };

  return (
    <div className="landing-container">
      {isWelcome && (
        <p className="landing-welcome">Welcome to</p>
      )}
      <h1 className={`landing-title ${replayGlitch === 'reset' ? 'landing-title--reset' : ''} ${replayGlitch === 'replay' ? 'landing-title--replay' : ''}`}>
        {'NUMENEON'.split('').map((letter, index) => {
          const isFlipped = index === 0 || index === 7; // First N and last N
          return (
            <span 
              key={index} 
              className={`title-letter ${isFlipped ? 'title-letter--flip' : ''} title-letter--${colorVariants[index]}`}
              style={{ 
                animationDelay: `${letterDelays[index]}s`,
                '--hover-delay': `${hoverDelays[index]}s`
              }}
              data-letter={letter}
              onMouseEnter={() => handleLetterHover(index)}
            >
              {letter}
            </span>
          );
        })}
      </h1>
      <div className="auth-buttons">
        {!isLoading && isAuthenticated ? (
          <button className="btn-enter" onClick={() => navigate('/home')}>
            Enter
          </button>
        ) : (
          <>
            <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
            <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}
      </div>
      <button className="btn-about" onClick={() => navigate('/about')}>
        about
      </button>
      
      {/* Copyright Footer */}
      <footer className="copyright-footer">
        <span>© 2026 Pablo Cordero & NUMENEON Contributors</span>
      </footer>
    </div>
  );
}

export default Landing;
