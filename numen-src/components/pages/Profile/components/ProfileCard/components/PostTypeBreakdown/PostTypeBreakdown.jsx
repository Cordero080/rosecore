// PostTypeBreakdown.jsx - Donut chart showing content mix
// 🔵 PABLO - UI/Styling

import { useMemo } from 'react';
import './PostTypeBreakdown.scss';

// Map gradient URLs to solid colors for legend
const legendColors = {
  'url(#gradient-thoughts)': 'rgba(30, 234, 76, 0.9)',
  'url(#gradient-media)': 'rgba(0, 212, 255, 0.9)',
  'url(#gradient-milestones)': 'rgba(234, 30, 162, 0.9)'
};

function PostTypeBreakdown({ postTypeData }) {
  // Pre-calculate cumulative percentages to avoid mutation during render
  const segments = useMemo(() => {
    const result = [];
    postTypeData.reduce((cumulative, item) => {
      result.push({ ...item, startPercent: cumulative });
      return cumulative + item.percentage;
    }, 0);
    return result;
  }, [postTypeData]);

  return (
    <div className="post-type-breakdown">
      <h4 className="breakdown-title">Content Mix</h4>
      <div className="breakdown-content">
        <svg width="120" height="120" viewBox="0 0 120 120" className="donut-chart">
          {/* Holographic gradient definitions */}
          <defs>
            {/* Thoughts - Green holographic */}
            <linearGradient id="gradient-thoughts" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(30, 234, 78, 0.67)" />
              <stop offset="30%" stopColor="rgba(20, 180, 121, 0.85)" />
              <stop offset="50%" stopColor="rgba(60, 255, 118, 0.72)" />
              <stop offset="70%" stopColor="rgba(18, 164, 57, 0.85)" />
              <stop offset="100%" stopColor="rgba(30, 234, 76, 0.95)" />
            </linearGradient>
            {/* Media - Cyan holographic */}
            <linearGradient id="gradient-media" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 213, 255, 0.78)" />
              <stop offset="30%" stopColor="rgba(26, 115, 231, 0.92)" />
              <stop offset="50%" stopColor="rgba(36, 166, 253, 0.82)" />
              <stop offset="70%" stopColor="rgba(18, 122, 249, 0.88)" />
              <stop offset="100%" stopColor="rgba(0, 213, 255, 0.66)" />
            </linearGradient>
            {/* Milestones - Magenta holographic */}
            <linearGradient id="gradient-milestones" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(234, 30, 162, 0.95)" />
              <stop offset="30%" stopColor="rgba(177, 16, 126, 0.85)" />
              <stop offset="50%" stopColor="rgba(255, 80, 200, 0.9)" />
              <stop offset="70%" stopColor="rgba(231, 17, 166, 0.85)" />
              <stop offset="100%" stopColor="rgba(234, 30, 162, 0.95)" />
            </linearGradient>
          </defs>
          {segments.map((item, index) => {
            const startAngle = (item.startPercent / 100) * 360 - 90;
            const endAngle = ((item.startPercent + item.percentage) / 100) * 360 - 90;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const outerRadius = 50;
            const innerRadius = 35;
            
            const x1 = 60 + outerRadius * Math.cos(startRad);
            const y1 = 60 + outerRadius * Math.sin(startRad);
            const x2 = 60 + outerRadius * Math.cos(endRad);
            const y2 = 60 + outerRadius * Math.sin(endRad);
            const x3 = 60 + innerRadius * Math.cos(endRad);
            const y3 = 60 + innerRadius * Math.sin(endRad);
            const x4 = 60 + innerRadius * Math.cos(startRad);
            const y4 = 60 + innerRadius * Math.sin(startRad);
            
            const largeArc = item.percentage > 50 ? 1 : 0;
            
            return (
              <path
                key={index}
                d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                fill={item.color}
                className="donut-segment"
              >
                <title>{item.type}: {item.percentage}%</title>
              </path>
            );
          })}
        </svg>
        <div className="breakdown-legend">
          {postTypeData.map((item, index) => {
            const solidColor = legendColors[item.color] || item.color;
            return (
              <div key={index} className="breakdown-legend-item">
                <div className="legend-color" style={{ background: solidColor }}></div>
                <div className="legend-text">
                  <span className="legend-type" style={{ color: solidColor }}>{item.type}</span>
                  <span className="legend-percent" style={{ color: solidColor }}>{item.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PostTypeBreakdown;
