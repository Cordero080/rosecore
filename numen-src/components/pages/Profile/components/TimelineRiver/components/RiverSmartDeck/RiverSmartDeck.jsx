/**
 * RiverSmartDeck - Carousel navigation for TimelineRiver posts
 * 
 * Displays prev/next arrows and dot indicators for cycling through posts.
 * Used when a category has more than 1 post to navigate between them.
 * 
 * 🔗 CONNECTION: Used by TimelineRiver.jsx for carousel navigation
 */
import { ChevronLeftIcon, ChevronRightIcon } from '@assets/icons';
import './RiverSmartDeck.scss';

const RiverSmartDeck = ({
  items,           // Array of posts to navigate
  deckKey,         // Unique key like "me-thoughts" or "username-media"
  currentIndex,    // Current active index (controlled from parent)
  onIndexChange,   // Callback when index changes
}) => {
  // Don't render if only 1 or 0 items
  if (!items || items.length <= 1) return null;

  const total = items.length;

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? total - 1 : currentIndex - 1;
    onIndexChange?.(deckKey, newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % total;
    onIndexChange?.(deckKey, newIndex);
  };

  const handleDotClick = (index) => {
    onIndexChange?.(deckKey, index);
  };

  return (
    <div className="smart-deck-nav">
      {/* Position indicator - shown above nav on mobile */}
      <span className="smart-deck-nav-position">
        {currentIndex + 1}/{total}
      </span>
      <button className="smart-deck-nav-btn" onClick={handlePrev}>
        <ChevronLeftIcon size={16} />
      </button>
      <div className="smart-deck-dots">
        {items.map((_, idx) => (
          <span
            key={idx}
            className={`smart-deck-dot ${idx === currentIndex ? 'smart-deck-dot--active' : ''}`}
            onClick={() => handleDotClick(idx)}
          />
        ))}
      </div>
      <button className="smart-deck-nav-btn" onClick={handleNext}>
        <ChevronRightIcon size={16} />
      </button>
    </div>
  );
};

export default RiverSmartDeck;
