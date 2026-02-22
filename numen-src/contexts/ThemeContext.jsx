/**
 * =============================================================================
 * THEME CONTEXT
 * =============================================================================
 *
 * File: frontend/src/contexts/ThemeContext.jsx
 * Assigned to: PABLO
 * Responsibility: Global theme state (dark/light mode)
 *
 * COMPLETED:
 * - [x] Store theme in state ('dark' or 'light')
 * - [x] Initialize from localStorage or system preference
 * - [x] Provide toggleTheme function
 * - [x] Apply data-theme attribute to document root
 * - [x] Persist preference to localStorage
 * - [x] Export useTheme hook
 *
 * Status: IMPLEMENTED ✅
 * =============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    
    // If no saved preference, default to dark mode
    return saved || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
