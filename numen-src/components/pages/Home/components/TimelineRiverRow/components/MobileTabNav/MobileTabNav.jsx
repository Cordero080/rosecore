// 🔵 PABLO - UI Component
// MobileTabNav.jsx - Mobile category tab navigation for post types

import {
  MessageBubbleIcon,
  ImageIcon,
  MilestoneIcon
} from '@assets/icons';
import './MobileTabNav.scss';

const tabConfig = {
  thoughts: { 
    label: 'Thoughts', 
    icon: <MessageBubbleIcon size={16} />
  },
  media: { 
    label: 'Media', 
    icon: <ImageIcon size={16} />
  },
  milestones: { 
    label: 'Milestones', 
    icon: <MilestoneIcon size={16} />
  }
};

function MobileTabNav({ 
  availableTabs, 
  activeTab, 
  onTabChange, 
  postCounts 
}) {
  return (
    <div className="mobile-tab-nav">
      {availableTabs.map(tab => (
        <button
          key={tab}
          className={`mobile-tab ${activeTab === tab ? 'mobile-tab--active' : ''} mobile-tab--${tab}`}
          onClick={() => onTabChange(tab)}
        >
          {tabConfig[tab].icon}
          <span className="mobile-tab-label">{tabConfig[tab].label}</span>
          <span className="mobile-tab-count">{postCounts[tab] || 0}</span>
        </button>
      ))}
    </div>
  );
}

export default MobileTabNav;
