// 🔵 PABLO - UI Architect
// SideNavContext.jsx - Manages mobile sidenav open/closed state

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SideNavContext = createContext();

export function SideNavProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // Track mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-close when switching to desktop
      if (!mobile) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close nav on route change (mobile) - only when path actually changes
  useEffect(() => {
    if (prevPathRef.current !== location.pathname && isMobile && isOpen) {
      setIsOpen(false);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, isMobile, isOpen]);

  const openNav = useCallback(() => setIsOpen(true), []);
  const closeNav = useCallback(() => setIsOpen(false), []);
  const toggleNav = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <SideNavContext.Provider value={{
      isOpen,
      isMobile,
      openNav,
      closeNav,
      toggleNav,
    }}>
      {children}
    </SideNavContext.Provider>
  );
}

export function useSideNav() {
  const context = useContext(SideNavContext);
  if (!context) {
    throw new Error('useSideNav must be used within a SideNavProvider');
  }
  return context;
}
