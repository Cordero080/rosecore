// ProfileCardBack.jsx - Private analytics dashboard (back of flip card)
// 🔵 PABLO - UI/Styling

import { useState } from 'react';
import './ProfileCardBack.scss';
import ActivityVisualization from '../ActivityVisualization';
import PostTypeBreakdown from '../PostTypeBreakdown';
import QuickSettings from '../QuickSettings';
import { EnsoIcon, EyeIcon, BoltIcon, HeartIcon, BarChartIcon } from '@assets/icons';

function ProfileCardBack({ 
  setIsFlipped, 
  posts, 
  viewMode, 
  setViewMode,
  waveData,
  mediumWaveData,
  lowWaveData,
  heatmapData,
  postTypeData,
  bestPostingTime,
  createWavePath,
  getActivityColor,
  isOwnProfile = true
}) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  return (
    <div className="profile-card-back">
      <div className="analytics-header">
        <h2 className="analytics-title">Your Analytics</h2>
        <button className="flip-trigger-back" onClick={() => setIsFlipped(false)} aria-label="Back to Profile">
          <EnsoIcon size={24} />
        </button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-icon">
            <EyeIcon size={24} />
          </div>
          <div className="analytics-data">
            <span className="analytics-value">2.4K</span>
            <span className="analytics-label">Profile Views</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-icon">
            <BoltIcon size={24} />
          </div>
          <div className="analytics-data">
            <span className="analytics-value">89%</span>
            <span className="analytics-label">Engagement Rate</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-icon">
            <HeartIcon size={24} />
          </div>
          <div className="analytics-data">
            <span className="analytics-value">156</span>
            <span className="analytics-label">Avg. Likes/Post</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-icon">
            <BarChartIcon size={24} />
          </div>
          <div className="analytics-data">
            <span className="analytics-value">+23%</span>
            <span className="analytics-label">Growth This Week</span>
          </div>
        </div>
      </div>

      {/* Activity Visualization - Hidden when editing */}
      {!editModalOpen && (
        <ActivityVisualization
          viewMode={viewMode}
          setViewMode={setViewMode}
          posts={posts}
          waveData={waveData}
          mediumWaveData={mediumWaveData}
          lowWaveData={lowWaveData}
          heatmapData={heatmapData}
          bestPostingTime={bestPostingTime}
          createWavePath={createWavePath}
          getActivityColor={getActivityColor}
        />
      )}

      {/* Post Type Breakdown - Hidden when editing */}
      {!editModalOpen && <PostTypeBreakdown postTypeData={postTypeData} />}

      {/* Quick Settings - Only on own profile */}
      {isOwnProfile && <QuickSettings editModalOpen={editModalOpen} setEditModalOpen={setEditModalOpen} />}
    </div>
  );
}

export default ProfileCardBack;
