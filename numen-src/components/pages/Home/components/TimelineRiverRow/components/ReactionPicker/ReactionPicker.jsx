// 🔵 PABLO - UI Component
// ReactionPicker.jsx - Long-press reaction picker (shows alternative option)

import { HeartDynamicIcon, BoltDynamicIcon } from '@assets/icons';
import './ReactionPicker.scss';

function ReactionPicker({ 
  isOpen, 
  onSelect, 
  onClose, 
  reactionColor,
  currentReaction, // 'like' | 'emphasis' | null
}) {
  if (!isOpen) return null;

  // Only show the OTHER option (not the current one)
  const showBolt = currentReaction !== 'emphasis';
  const showHeart = currentReaction !== 'like';

  return (
    <div 
      className="reaction-picker"
      onMouseLeave={onClose}
    >
      {showHeart && (
        <button
          className="reaction-option"
          onClick={(e) => {
            e.stopPropagation();
            onSelect('like');
          }}
          title="Like"
          style={{ '--reaction-color': reactionColor }}
        >
          <HeartDynamicIcon 
            size={20} 
            filled={false}
            strokeColor={reactionColor}
          />
        </button>
      )}
      {showBolt && (
        <button
          className="reaction-option"
          onClick={(e) => {
            e.stopPropagation();
            onSelect('emphasis');
          }}
          title="Emphasis"
          style={{ '--reaction-color': reactionColor }}
        >
          <BoltDynamicIcon 
            size={20} 
            filled={false}
            strokeColor={reactionColor}
          />
        </button>
      )}
    </div>
  );
}

export default ReactionPicker;
