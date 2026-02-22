// EditProfileModal.jsx - Modal for editing user profile
import { useState, useEffect, useRef } from 'react';
import { updateProfile } from '@services/usersService';
import { useAuth } from '@contexts/AuthContext';
import './EditProfileModal.scss';

function EditProfileModal({ isOpen, onClose, currentUser }) {
  const { refreshUser } = useAuth();
  const scrollYRef = useRef(0);
  const [formData, setFormData] = useState({
    bio: currentUser?.profile?.bio || '',
    location: currentUser?.profile?.location || '',
    website: currentUser?.profile?.website || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scroll to show modal when it opens
  useEffect(() => {
    if (isOpen) {
      scrollYRef.current = window.scrollY;
      // Scroll down to show the modal fully
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
      }, 50);
    }
    
    return () => {};
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    document.body.style.overflow = '';
    onClose();
    // Scroll to bottom after components re-render
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    }, 50);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateProfile(formData);
      await refreshUser();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="edit-profile-modal-backdrop" onClick={handleBackdropClick}>
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h2>edit profile</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="bio">bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <span className="char-count">{formData.bio.length}/500</span>
          </div>

          <div className="form-group">
            <label htmlFor="location">location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="where are you based?"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yoursite.com"
              maxLength={200}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              cancel
            </button>
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? 'saving...' : 'save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
