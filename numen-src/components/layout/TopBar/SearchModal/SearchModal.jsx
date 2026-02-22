// 🔵 PABLO - UI Architect
// SearchModal.jsx - Global search modal for users and posts

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts, useFriends, useMessages } from '@contexts';
import { TargetReticleIcon, CloseIcon, MessageBubbleIcon } from '@assets/icons';
import { searchUsers } from '@services/usersService';
import './SearchModal.scss';

// Helper to get initials from name
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'users', 'posts'
  const [apiUsers, setApiUsers] = useState([]); // Users from backend search
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  const { posts } = usePosts();
  const { friends } = useFriends();
  const { openMessages } = useMessages();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  // Clear search when modal closes
  const handleClose = () => {
    setSearchQuery('');
    setActiveTab('all');
    setApiUsers([]);
    onClose();
  };

  // Search backend for users when query changes (with debounce)
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setApiUsers([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(query);
        setApiUsers(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
        setActiveTab('all');
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get unique users from posts (post authors)
  const postAuthors = posts.reduce((acc, post) => {
    if (post.author && !acc.find(u => u.username === post.author.username)) {
      acc.push({
        id: post.author.id,
        username: post.author.username,
        displayName: post.author.first_name && post.author.last_name 
          ? `${post.author.first_name} ${post.author.last_name}`
          : post.author.username,
        first_name: post.author.first_name,
        last_name: post.author.last_name,
      });
    }
    return acc;
  }, []);

  // Combine API results, friends, and post authors (API results first, deduped)
  const allUsers = [...apiUsers, ...friends, ...postAuthors].reduce((acc, user) => {
    if (!acc.find(u => u.username === user.username)) {
      acc.push(user);
    }
    return acc;
  }, []);

  // Filter based on search query
  const query = searchQuery.toLowerCase().trim();
  
  // Filter function for matching users
  const matchesQuery = (user) => 
    user.username?.toLowerCase().includes(query) ||
    user.first_name?.toLowerCase().includes(query) ||
    user.last_name?.toLowerCase().includes(query) ||
    user.displayName?.toLowerCase().includes(query);
  
  // Show API results first, then add matching local users (deduped)
  const filteredUsers = query ? [
    ...apiUsers, // API results are already filtered by backend
    ...allUsers.filter(user => 
      // Only include local users that match AND aren't already in API results
      !apiUsers.find(u => u.username === user.username) && matchesQuery(user)
    )
  ] : [];

  const filteredPosts = query ? posts.filter(post =>
    post.content?.toLowerCase().includes(query) ||
    post.author?.username?.toLowerCase().includes(query)
  ).slice(0, 10) : []; // Limit to 10 posts

  // Handle clicking on a user result
  const handleUserClick = (user) => {
    navigate(`/profile/${user.username}`);
    handleClose();
  };

  // Handle clicking message button on user result
  const handleMessageUser = (e, user) => {
    e.stopPropagation(); // Prevent triggering user click
    openMessages({
      id: user.id,
      username: user.username,
      displayName: user.displayName || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
    });
    handleClose();
  };

  // Handle clicking on a post result
  const handlePostClick = (post) => {
    // Navigate to author's profile (could expand to scroll to specific post later)
    navigate(`/profile/${post.author.username}`);
    handleClose();
  };

  const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0;
  const showUsers = activeTab === 'all' || activeTab === 'users';
  const showPosts = activeTab === 'all' || activeTab === 'posts';

  return (
    <div className="search-modal-overlay" onClick={handleClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className="search-header">
          <div className="search-input-wrapper">
            <TargetReticleIcon size={20} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search users or posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button className="close-btn-glow" onClick={handleClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        {query && hasResults && (
          <div className="search-tabs">
            <button 
              className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({filteredUsers.length})
            </button>
            <button 
              className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts ({filteredPosts.length})
            </button>
          </div>
        )}

        {/* Search Results */}
        <div className="search-results">
          {!query && (
            <div className="search-empty">
              <p>Start typing to search...</p>
              <p className="search-hint">Search for users by name or username, or find posts by content</p>
            </div>
          )}

          {query && !hasResults && !isSearching && (
            <div className="search-empty">
              <p>No results for "{searchQuery}"</p>
              <p className="search-hint">Try a different search term</p>
            </div>
          )}

          {query && isSearching && (
            <div className="search-empty">
              <p>Searching...</p>
            </div>
          )}

          {/* Users Results */}
          {query && showUsers && filteredUsers.length > 0 && (
            <div className="search-section">
              <h3 className="search-section-title">Users</h3>
              {filteredUsers.map(user => (
                <div 
                  key={user.username} 
                  className="search-result-item user-result"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="result-avatar">
                    <span>{getInitials(user.displayName || user.username)}</span>
                  </div>
                  <div className="result-info">
                    <span className="result-name">
                      {user.displayName || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
                    </span>
                    <span className="result-username">@{user.username}</span>
                  </div>
                  <button 
                    className="result-action"
                    onClick={(e) => handleMessageUser(e, user)}
                    title="Send message"
                  >
                    <MessageBubbleIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Posts Results */}
          {query && showPosts && filteredPosts.length > 0 && (
            <div className="search-section">
              <h3 className="search-section-title">Posts</h3>
              {filteredPosts.map(post => (
                <div 
                  key={post.id} 
                  className="search-result-item post-result"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="result-avatar small">
                    <span>{getInitials(post.author?.username)}</span>
                  </div>
                  <div className="result-info">
                    <span className="result-username">@{post.author?.username}</span>
                    <span className="result-content">
                      {post.content?.length > 80 
                        ? post.content.substring(0, 80) + '...' 
                        : post.content}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
