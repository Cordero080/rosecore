// QuickSettings.jsx - Settings button grid for profile card back
// 🔵 PABLO - UI/Styling

import { useNavigate } from 'react-router-dom';
import './QuickSettings.scss';
import { ShieldIcon, AppearanceIcon, EditIcon, BookmarkIcon, DocumentIcon, MusicIcon } from '@assets/icons';
import { useAuth } from '@contexts';
import EditProfileModal from '../EditProfileModal';

function QuickSettings({ editModalOpen, setEditModalOpen }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleThrowback = () => {
    navigate(`/mystudio/${user?.username || ''}`);
  };
  
  return (
    <div className={`quick-settings ${editModalOpen ? 'modal-active' : ''}`}>
      {!editModalOpen && (
        <>
          <h3 className="settings-title">Quick Settings</h3>
          <button className="setting-btn">
            <ShieldIcon size={18} />
            <span>Privacy Settings</span>
          </button>
          <button className="setting-btn">
            <AppearanceIcon size={18} />
            <span>Appearance</span>
          </button>
          <button className="setting-btn" onClick={() => setEditModalOpen(true)}>
            <EditIcon size={18} />
            <span>Edit Profile</span>
          </button>
          
          {/* Compact 3-column grid for secondary actions */}
          <div className="settings-grid">
            <button className="setting-btn setting-btn-compact">
              <BookmarkIcon size={16} />
              <span>Saved</span>
            </button>
            <button className="setting-btn setting-btn-compact">
              <DocumentIcon size={16} />
              <span>Activity</span>
            </button>
            <button 
              className="setting-btn setting-btn-compact throwback-btn"
              onClick={handleThrowback}
              title="Enter the time machine"
            >
              <MusicIcon size={18} className="neon-icon" />
              <span>MyStudio</span>
            </button>
          </div>
        </>
      )}

      <EditProfileModal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        currentUser={user}
      />
    </div>
  );
}

export default QuickSettings;
