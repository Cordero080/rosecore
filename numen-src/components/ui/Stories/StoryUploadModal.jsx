import { useState, useRef } from 'react';
import { useStories } from '@contexts/StoriesContext';
import { uploadToCloudinary, isCloudinaryConfigured } from '@utils/cloudinary';
import {
  CloseIcon,
  ImageIcon,
  TrashIcon,
} from '@assets/icons';
// Reuse existing ComposerModal styles
import '@Profile/components/ComposerModal/ComposerModal.scss';

function StoryUploadModal({ isOpen, onClose }) {
  const { createStory } = useStories();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only images and videos are allowed');
      return;
    }

    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${file.type.startsWith('video/') ? '50MB' : '10MB'}`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } });
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || isUploading) return;

    if (!isCloudinaryConfigured()) {
      setError('Cloudinary not configured');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadToCloudinary(selectedFile);
      
      const storyResult = await createStory({
        media_url: result.url,
        media_type: selectedFile.type.startsWith('video/') ? 'video' : 'image',
        caption: caption.trim() || null,
      });

      if (storyResult.success) {
        handleRemoveFile();
        setCaption('');
        onClose();
      } else {
        setError(storyResult.error || 'Failed to create story');
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    handleRemoveFile();
    setCaption('');
    setError(null);
    onClose();
  };

  return (
    <div className="composer-modal-overlay" onClick={handleClose}>
      <div 
        className="composer-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '340px', marginLeft: '-30px', marginTop: '60px' }}
      >
        {/* Header */}
        <div className="composer-modal-header">
          <h2 className="composer-modal-title">Add Story</h2>
          <button className="close-btn-glow" onClick={handleClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="composer-modal-body">
          {/* Media upload area */}
          <div className={`media-upload-area ${previewUrl ? 'has-preview' : ''}`}>
            {!previewUrl ? (
              <div 
                className="media-upload-placeholder"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={48} />
                <p>Tap to select or drag & drop</p>
                <span>Images or videos up to 50MB</span>
              </div>
            ) : (
              <div className="media-preview-container">
                {selectedFile?.type.startsWith('video/') ? (
                  <video src={previewUrl} controls className="media-preview-image" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="media-preview-image" />
                )}
                <button className="media-remove-btn" onClick={handleRemoveFile}>
                  <TrashIcon size={18} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="media-file-input"
            />
          </div>

          {/* Caption */}
          {previewUrl && (
            <textarea
              className="composer-textarea media-mode"
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
            />
          )}

          {/* Error */}
          {error && <p className="upload-error-message">{error}</p>}
        </div>

        {/* Footer */}
        <div className="composer-modal-footer">
          <button 
            className="composer-post-btn"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryUploadModal;
