/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    [ ARCHITECTURAL SIGNATURE ]                               ║
 * ║   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀   ║
 * ║   ENGAGEMENT ANALYTICS VISUALIZATION v1.0                                    ║
 * ║   ─────────────────────────────────────────────────────────────────────────  ║
 * ║                                                                              ║
 * ║   Designed & Authored by: Pablo Cordero                                      ║
 * ║                                                                              ║
 * ║   This module implements the Wave Chart and GitHub-style Activity Heatmap   ║
 * ║   visualizations for user engagement analytics.                              ║
 * ║   Logic belongs to the creator.                                              ║
 * ║                                                                              ║
 * ║   ⚠️  NOTICE: Unauthorized replication or commercial use is prohibited       ║
 * ║       under CC BY-NC-ND 4.0                                                  ║
 * ║                                                                              ║
 * ║   © 2026 NUMENEON Contributors. All Rights Reserved.                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ActivityVisualization.jsx - Wave and Heatmap toggle views
// 🔵 PABLO - UI/Styling

import './ActivityVisualization.scss';

function ActivityVisualization({ 
  viewMode, 
  setViewMode, 
  posts, 
  waveData, 
  mediumWaveData, 
  lowWaveData, 
  heatmapData, 
  bestPostingTime,
  createWavePath,
  getActivityColor
}) {
  return (
    <div className="activity-wave">
      <div className="activity-header">
        <div className="activity-title-row">
          <h3 className="wave-title">Your Rhythm</h3>
          <div className="activity-meta">
            <span className="post-frequency">Avg. {(posts.length / 52).toFixed(1)} posts/week</span>
            <span className="peak-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="peak-icon">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Peak: {bestPostingTime}
            </span>
          </div>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'wave' ? 'active' : ''}`}
            onClick={() => setViewMode('wave')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h4l3-9 4 18 3-9h4"/>
            </svg>
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
            onClick={() => setViewMode('heatmap')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
        </div>
      </div>
      
      {viewMode === 'wave' ? (
        <div className="wave-container">
          <svg className="wave-svg" viewBox="0 0 600 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 200, 255, 0.76)" />
                <stop offset="40%" stopColor="rgba(0, 150, 255, 0.5)" />
                <stop offset="100%" stopColor="rgba(0, 100, 200, 0.15)" />
              </linearGradient>
              <linearGradient id="mediumWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 0, 102, 0.88)" />
                <stop offset="40%" stopColor="rgba(200, 0, 150, 0.4)" />
                <stop offset="100%" stopColor="rgba(150, 0, 200, 0.1)" />
              </linearGradient>
              <linearGradient id="lowWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 100, 0, 0.5)" />
                <stop offset="40%" stopColor="rgba(255, 50, 50, 0.35)" />
                <stop offset="100%" stopColor="rgba(200, 0, 100, 0.1)" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0, 200, 255, 0.8)" />
                <stop offset="50%" stopColor="rgba(0, 255, 174, 0.55)" />
                <stop offset="100%" stopColor="rgba(0, 200, 255, 0.8)" />
              </linearGradient>
              <linearGradient id="mediumLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 0, 150, 0.7)" />
                <stop offset="50%" stopColor="rgba(255, 50, 200, 1)" />
                <stop offset="100%" stopColor="rgba(255, 0, 150, 0.7)" />
              </linearGradient>
              <linearGradient id="lowLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 100, 0, 0.6)" />
                <stop offset="50%" stopColor="rgba(255, 150, 50, 0.9)" />
                <stop offset="100%" stopColor="rgba(255, 100, 0, 0.6)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Grid lines */}
            <g className="grid-lines">
              {[25, 50, 75].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))}
            </g>
            
            {/* Low activity wave (orange) */}
            <path
              d={createWavePath(lowWaveData)}
              fill="url(#lowWaveGradient)"
              className="wave-fill"
              opacity="0.6"
            />
            <path
              d={createWavePath(lowWaveData).split('L')[0]}
              fill="none"
              stroke="url(#lowLineGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="wave-line"
              opacity="0.7"
            />
            
            {/* Medium activity wave (pink) */}
            <path
              d={createWavePath(mediumWaveData)}
              fill="url(#mediumWaveGradient)"
              className="wave-fill"
              opacity="0.7"
            />
            <path
              d={createWavePath(mediumWaveData).split('L')[0]}
              fill="none"
              stroke="url(#mediumLineGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="wave-line"
              opacity="0.8"
            />
            
            {/* High activity wave (green/blue) */}
            <path
              d={createWavePath(waveData)}
              fill="url(#waveGradient)"
              className="wave-fill"
            />
            <path
              d={createWavePath(waveData).split('L')[0]}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="wave-line"
            />
            
            {/* Peak markers */}
            {waveData.map((value, index) => {
              if (value > 65) {
                const x = (index * 600) / (waveData.length - 1);
                const y = 100 - value;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="rgba(26, 231, 132, 0.3)"
                      className="peak-marker-bg"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="2.5"
                      fill="rgba(26, 231, 132, 1)"
                      className="peak-marker"
                    >
                      <title>Peak activity: Week {index + 1}</title>
                    </circle>
                  </g>
                );
              }
              return null;
            })}
          </svg>
          
          <div className="wave-timeline">
            <span>12 months ago</span>
            <span>6 months ago</span>
            <span>Today</span>
          </div>
          
          <div className="wave-legend">
            <div className="legend-item">
              <div className="legend-line high"></div>
              <span>High Activity</span>
            </div>
            <div className="legend-item">
              <div className="legend-line medium"></div>
              <span>Medium Activity</span>
            </div>
            <div className="legend-item">
              <div className="legend-line low"></div>
              <span>Low Activity</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="heatmap-container">
          <div className="heatmap-grid">
            <div className="heatmap-days">
              <span>Mon</span>
              <span></span>
              <span>Wed</span>
              <span></span>
              <span>Fri</span>
              <span></span>
              <span></span>
            </div>
            <div className="heatmap-scroll-wrapper">
              <div className="heatmap-months">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
              <div className="heatmap-weeks">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="heatmap-week">
                    {week.map((level, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="heatmap-day"
                        style={{ 
                          background: getActivityColor(level),
                          border: level === 0 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : 'none'
                        }}
                        title={level === 0 ? 'Quiet day' : level === 1 ? 'You showed up' : level === 2 ? 'Active day' : 'Busy day!'}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="heatmap-legend">
            <span className="legend-label">Less</span>
            <div className="legend-squares">
              {[0, 1, 2, 3].map(level => (
                <div
                  key={level}
                  className="legend-square"
                  style={{ background: getActivityColor(level) }}
                />
              ))}
            </div>
            <span className="legend-label">More</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityVisualization;
