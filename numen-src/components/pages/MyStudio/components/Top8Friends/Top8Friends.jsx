// Top8Friends.jsx - MySpace Top 8 friends grid
import { useNavigate } from 'react-router-dom';
import './Top8Friends.scss';

function Top8Friends({ topFriends, getFriendAvatar }) {
  const navigate = useNavigate();

  return (
    <div className="friends-section">
      <h2 className="section-title">top 8</h2>
      <div className="top-friends-grid">
        {[...Array(8)].map((_, index) => {
          const friend = topFriends[index];
          return (
            <div 
              key={index} 
              className={`friend-slot ${friend ? 'filled' : 'empty'}`}
              onClick={() => friend && navigate(`/mystudio/${friend.username}`)}
            >
              {friend ? (
                <>
                  <img 
                    src={friend.profile_picture || getFriendAvatar(index)}
                    alt={friend.username}
                    className="friend-avatar"
                  />
                  <span className="friend-name">{friend.username}</span>
                  <span className="friend-rank">{index + 1}</span>
                </>
              ) : (
                <span className="empty-slot">?</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Top8Friends;
