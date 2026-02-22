/**
 * AuthLoader - Fun "Revving Up" loading overlay for auth operations
 * Simple, lightweight spinner with rotating messages
 */
import { useState, useEffect } from 'react';
import './AuthLoader.scss';


// Only show 'revving' for all modes
const LOADING_MESSAGES = {
  login: ["Revving..."],
  signup: ["Revving..."],
};

function AuthLoader({ isVisible, mode = 'login' }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = LOADING_MESSAGES[mode] || LOADING_MESSAGES.login;

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 900);

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  if (!isVisible) return null;

  return (
    <div className="auth-loader-overlay">
      <div className="auth-loader-content">
        {/* Spinning ring with dashes */}
        <div className="spinner-ring"></div>
        <div className="spinner-ring spinner-ring-reverse"></div>
        
        {/* Center bolt icon */}
        <div className="center-icon">⚡</div>
        
        {/* Message */}
        <div className="loader-message">
          <span className="message-text">{messages[messageIndex]}</span>
        </div>
      </div>
    </div>
  );
}

export default AuthLoader;
