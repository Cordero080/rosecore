// 🔵 PABLO - UI Architect
// SideNav.jsx - Side navigation component

import { useNavigate, useLocation } from 'react-router-dom';
import { useMessages, useSearch, useSideNav } from '@contexts';
import './SideNav.scss';
import {
  HexHomeIcon,
  TargetReticleIcon,
  MessageBubbleIcon,
  SignalIcon,
  FriendsIcon,
  HexProfileIcon,
  CircuitInfoIcon
} from '@assets/icons';

function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMessageModalOpen, openMessages } = useMessages();
  const { openSearch, isSearchModalOpen } = useSearch();
  const { isOpen, isMobile, closeNav } = useSideNav();

  // Don't navigate if message modal is open
  const handleNavClick = (path) => {
    if (isMessageModalOpen) return;
    navigate(path);
  };

  // Always use left-nav styling, just add mobile slide behavior
  const mobileClass = isMobile ? `mobile-slide ${isOpen ? 'is-open' : ''}` : '';

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isMobile && isOpen && (
        <div className="nav-backdrop" onClick={closeNav} />
      )}
      <nav className={`main-nav left-nav ${mobileClass} ${isMessageModalOpen ? 'nav-disabled' : ''}`}>
      <button 
        className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}
        onClick={() => handleNavClick('/home')}
        title="Home"
        disabled={isMessageModalOpen}
      >
        <div className="nav-icon">
          <HexHomeIcon size={24} />
        </div>
      </button>
      <button 
        className={`nav-item ${isSearchModalOpen ? 'active' : ''}`}
        onClick={openSearch}
        title="Search"
        disabled={isMessageModalOpen}
      >
        <div className="nav-icon">
          <TargetReticleIcon size={24} />
        </div>
      </button>
      <button 
        className={`nav-item ${isMessageModalOpen ? 'active' : ''}`}
        onClick={openMessages}
        title="Messages"
      >
        <div className="nav-icon">
          <MessageBubbleIcon size={24} />
        </div>
      </button>
      <button 
        className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`}
        onClick={() => handleNavClick('/notifications')}
        title="Notifications"
        disabled={isMessageModalOpen}
      >
        <div className="nav-icon">
          <SignalIcon size={24} />
        </div>
      </button>
      {location.pathname !== '/friends' && (
        <button 
          className={`nav-item ${location.pathname === '/friends' ? 'active' : ''}`}
          onClick={() => handleNavClick('/friends')}
          title="Friends"
          disabled={isMessageModalOpen}
        >
          <div className="nav-icon">
            <FriendsIcon size={38} />
          </div>
        </button>
      )}
      {location.pathname !== '/profile' && (
        <button 
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => handleNavClick('/profile')}
          title="Profile"
          disabled={isMessageModalOpen}
        >
          <div className="nav-icon">
            <HexProfileIcon size={24} />
          </div>
        </button>
      )}
      {location.pathname !== '/about' && (
        <button 
          className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}
          onClick={() => handleNavClick('/about')}
          disabled={isMessageModalOpen}
        >
          <div className="nav-icon">
            <CircuitInfoIcon size={24} />
          </div>
        </button>
      )}
    </nav>
    </>
  );
}

export default SideNav;
