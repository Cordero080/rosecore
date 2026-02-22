// AvatarUploadModal.jsx - Profile picture upload with crop options
// Reuses ComposerModal styling for consistency

import { useState, useRef } from 'react';
import './AvatarUploadModal.scss';
import { 
  CloseIcon, 
  UserIcon,
  EditIcon
} from '@assets/icons';
import { uploadToCloudinary, isCloudinaryConfigured } from '@utils/cloudinary';
import { updateProfile } from '@services/usersService';
import { useAuth } from '@contexts';

function AvatarUploadModal({ isOpen, onClose }) {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Image position state for panning
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setUploadError(null);
    setImagePosition({ x: 0, y: 0 }); // Reset position for new image
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  // Handle remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadError(null);
    setImagePosition({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Drag handlers for image positioning
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY };
    positionStartRef.current = { ...imagePosition };
  };
  
  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    
    // Limit movement to reasonable bounds (-50 to 50 pixels)
    const newX = Math.max(-50, Math.min(50, positionStartRef.current.x + deltaX));
    const newY = Math.max(-50, Math.min(50, positionStartRef.current.y + deltaY));
    
    setImagePosition({ x: newX, y: newY });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Handle upload and save
  const handleSave = async () => {
    if (!selectedFile || isUploading) return;
    
    // Check Cloudinary config
    if (!isCloudinaryConfigured()) {
      setUploadError('Image upload not configured. Please contact support.');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(selectedFile);
      const cloudinaryUrl = result.url;
      
      // Update profile with new avatar URL
      await updateProfile({ avatar: cloudinaryUrl });
      
      // Refresh user context to show new avatar
      if (refreshUser) {
        await refreshUser();
      }
      
      // Success - close modal
      handleClose();
    } catch (error) {
      console.error('Avatar upload error:', error);
      setUploadError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clean up and close
  const handleClose = () => {
    handleRemoveFile();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="avatar-modal-overlay" onClick={handleClose}>
      <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="avatar-modal-header">
          <h2>Profile Pic</h2>
          <button className="avatar-close-x" onClick={handleClose}>
            <CloseIcon size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="avatar-modal-body">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="avatar-file-input"
          />
          
          {/* Upload area or Preview */}
          <div className={`avatar-upload-area ${previewUrl ? 'has-preview' : ''}`}>
            {previewUrl ? (
              <div className="avatar-preview-container">
                <div 
                  className={`avatar-preview-frame avatar-preview-frame--circle ${isDragging ? 'is-dragging' : ''}`}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="avatar-preview-image"
                    style={{ 
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    draggable={false}
                  />
                </div>
                <button 
                  className="avatar-edit-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Change photo"
                >
                  <EditIcon size={18} />
                </button>
                
                {/* Upload overlay */}
                {isUploading && (
                  <div className="avatar-upload-overlay">
                    <div className="upload-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            ) : (
              <label 
                htmlFor="avatar-file-input" 
                className="avatar-upload-placeholder"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="avatar-placeholder-icon">
                  <UserIcon size={48} />
                </div>
                <p>Click to upload photo</p>
                <span>or drag and drop</span>
                <span className="avatar-hint">PNG, JPG, GIF up to 10MB</span>
              </label>
            )}
          </div>
          
          {/* Error message */}
          {uploadError && (
            <div className="avatar-upload-error">{uploadError}</div>
          )}
        </div>
        
        {/* Footer */}
        <div className="avatar-modal-footer">
          <div className="avatar-actions-left">
            <button 
              className="avatar-icon-btn" 
              onClick={handleClose}
              title="Cancel"
            >
              Cancel
            </button>
            {previewUrl && (
              <button 
                className="avatar-icon-btn" 
                onClick={() => fileInputRef.current?.click()}
                title="Choose different photo"
              >
                Edit
              </button>
            )}
          </div>
          <button 
            className="avatar-save-btn" 
            onClick={handleSave}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'UPLOADING...' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvatarUploadModal;
