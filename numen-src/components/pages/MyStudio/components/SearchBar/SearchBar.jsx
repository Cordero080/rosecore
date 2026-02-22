import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '@services/usersService';
import { useFriends } from '@contexts';
import { UserIcon } from '@assets/icons';
import './SearchBar.scss';

function SearchBar() {
  const navigate = useNavigate();
  const { friends, sendFriendRequest } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(new Set());

  // Check if user is already a friend
  const isFriend = (userId) => {
    return friends.some(friend => friend.id === userId);
  };

  // Handle sending friend request
  const handleAddFriend = async (userId, e) => {
    e.stopPropagation();
    try {
      setPendingRequests(prev => new Set([...prev, userId]));
      await sendFriendRequest(userId);
    } catch (error) {
      console.error('Failed to send friend request:', error);
      setPendingRequests(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  // Navigate to user's studio
  const handleUserClick = (username) => {
    navigate(`/mystudio/${username}`);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await searchUsers(query);
        setResults(users);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      {loading && <p className="search-loading">searching...</p>}

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((user) => (
            <li 
              key={user.id} 
              className="search-result-item"
              onClick={() => handleUserClick(user.username)}
            >
              <div className="search-avatar">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} />
                ) : (
                  <UserIcon size={24} />
                )}
              </div>
              <span className="username">{user.username}</span>
              {user.has_mystudio && <span className="myspace-badge">studio</span>}
              
              {/* Add friend button if not already friends */}
              {!isFriend(user.id) && (
                <button 
                  className={`add-friend-btn ${pendingRequests.has(user.id) ? 'pending' : ''}`}
                  onClick={(e) => handleAddFriend(user.id, e)}
                  disabled={pendingRequests.has(user.id)}
                >
                  {pendingRequests.has(user.id) ? 'sent' : '+ add'}
                </button>
              )}
              {isFriend(user.id) && (
                <span className="friend-badge">friend</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {query && !loading && results.length === 0 && (
        <p className="no-results">no users found</p>
      )}
    </div>
  );
}

export default SearchBar;
