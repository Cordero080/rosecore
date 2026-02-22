import { useState, useEffect } from 'react';
import './ThemeToggle.scss';

/**
 * ThemeToggle - Switches between light and dark mode
 * 
 * Usage: <ThemeToggle />
 * 
 * Theme state is stored in:
 * - document.documentElement.dataset.theme
 * - localStorage.theme
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or default to dark
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <button 
      className={`theme-toggle ${theme === 'light' ? 'theme-toggle--active' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Power/Energy Core - glows bright in light mode, dim in dark */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        className="power-core"
      >
        <defs>
          {/* Glow filter */}
          <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Gradient for the core */}
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" className="core-center"/>
            <stop offset="70%" className="core-mid"/>
            <stop offset="100%" className="core-edge"/>
          </radialGradient>
        </defs>
        {/* Outer ring */}
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill="none" 
          className="core-ring"
          strokeWidth="1.5"
        />
        {/* Inner energy core */}
        <circle 
          cx="12" 
          cy="12" 
          r="6" 
          fill="url(#coreGradient)"
          filter="url(#coreGlow)"
          className="core-orb"
        />
        {/* Center bright spot */}
        <circle 
          cx="12" 
          cy="12" 
          r="2.5" 
          className="core-spark"
        />
      </svg>
    </button>
  );
}

export default ThemeToggle;
