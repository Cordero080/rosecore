// DeleteConfirmModal.jsx - Styled delete confirmation modal

import { createPortal } from 'react-dom';
import { ShatterIcon } from '@assets/icons';
import './DeleteConfirmModal.scss';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, isDeleting, title = "Delete Post?", message = "This can't be undone." }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            {/* Shatter/dissolve icon */}
            <ShatterIcon size={28} />
          </div>
          <h3 className="delete-modal-title">{title}</h3>
        </div>

        {/* Body */}
        <p className="delete-modal-message">
          {message}
        </p>

        {/* Footer */}
        <div className="delete-modal-actions">
          <button 
            className="delete-modal-btn delete-modal-btn--cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="delete-modal-btn delete-modal-btn--confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteConfirmModal;
