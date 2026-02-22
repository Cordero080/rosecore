/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    [ ARCHITECTURAL SIGNATURE ]                               ║
 * ║   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀   ║
 * ║   PROFILE FLIP CARD SYSTEM v1.0                                              ║
 * ║   ─────────────────────────────────────────────────────────────────────────  ║
 * ║                                                                              ║
 * ║   Designed & Authored by: Pablo Cordero                                      ║
 * ║   With contributions from: Natalia Pricop                                    ║
 * ║                                                                              ║
 * ║   This module implements the dual-sided profile card with 3D flip           ║
 * ║   animation and integrated analytics dashboard.                              ║
 * ║   Logic belongs to the creator.                                              ║
 * ║                                                                              ║
 * ║   ⚠️  NOTICE: Unauthorized replication or commercial use is prohibited       ║
 * ║       under CC BY-NC-ND 4.0                                                  ║
 * ║                                                                              ║
 * ║   © 2026 NUMENEON Contributors. All Rights Reserved.                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// 🔵 PABLO - UI/Styling | 🟡 NATALIA - User Data Logic
// ProfileCard.jsx - User profile card with flip animation
// Now a thin container that orchestrates subcomponents

import { useMemo, useState } from 'react';
import './ProfileCard.scss';
import ProfileCardFront from './components/ProfileCardFront';
import ProfileCardBack from './components/ProfileCardBack';

// Fixed reference timestamp for consistent analytics calculations
// This avoids React compiler warnings about impure functions during render
const ANALYTICS_NOW = Date.now(); // Use current time for live heatmap

// Seeded random generator for consistent demo data
// Same seed = same "random" values every time (no jumpy UI)
const seededRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

// Generate impressive demo heatmap (used when real data is sparse)
const generateDemoHeatmap = (userId) => {
  const random = seededRandom(userId || 12345);
  return Array(52).fill(null).map(() => 
    Array(7).fill(0).map(() => {
      const r = random();
      // Weighted distribution: more medium/high activity for impressive look
      if (r < 0.15) return 0;      // 15% empty
      if (r < 0.5) return 1;      // 20% low
      if (r < .85) return 2;      // 30% medium
      return 3;                     // 35% high
    })
  );
};

// Generate wave data with crescendo pattern - peaks grow like Fibonacci
const generateDemoWaveData = (userId, maxHeight = 80) => {
  const random = seededRandom(userId || 12345);
  const weeks = 52;
  const data = [];
  
  // Fibonacci-inspired peak heights (each ~1.6x bigger than last)
  const fib = [.3, 0.02, 0.3, 1, 0.21, .9, 4.0];
  const numPeaks = 5 + Math.floor(random() * 2); // 5-6 peaks
  
  // Space peaks evenly across the timeline
  const spacing = weeks / (numPeaks + .44);
  
  for (let i = 0; i < weeks; i++) {
    // Start with low baseline that gradually rises
    const progress = i / weeks;
    let value = 0.01 + progress * 0.1; // 5% → 15% baseline
    
    // Check each peak
    for (let p = 0; p < numPeaks; p++) {
      const peakPos = spacing * (p + 1) + (random() - 0.2) * 72 * .8; // Slight position variance
      const peakHeight = fib[Math.min(p, fib.length - 1)]; // Fibonacci height
      const width = 2 + p * 0.3; // Peaks get slightly wider too
      
      const distance = Math.abs(i - peakPos);
      if (distance < width * 3) {
        const falloff = Math.exp(-(distance * distance) / (2 * width * width));
        value += peakHeight * falloff;
      }
    }
    
    data.push(Math.min(1, value) * maxHeight);
  }
  
  return data;
};

function ProfileCard({ isFlipped, setIsFlipped, posts, user, isOwnProfile = true }) {
  const [viewMode, setViewMode] = useState('wave'); // 'wave' or 'heatmap'

  // Seeded random number generator for consistent data
  const postTypeData = useMemo(() => {
    if (!posts || posts.length === 0) {
  
      return [
      { type: 'Thoughts', percentage: 33, color: 'url(#gradient-thoughts)' },
      { type: 'Media', percentage: 33, color: 'url(#gradient-media)' },
      { type: 'Milestones', percentage: 34, color: 'url(#gradient-milestones)' }
    ];
  }

 const counts = { thoughts: 0, media: 0, milestones: 0};
 posts.forEach(post => {
  if (counts[post.type] !== undefined) {
    counts[post.type]++;
  }
 });

 const total = posts.length;
 const thoughtsPercent = Math.round((counts.thoughts/total) * 100);
 const mediaPercent = Math.round((counts.media/total) * 100);
 const milestonesPercent = 100 - thoughtsPercent - mediaPercent;
 
 return [
    { type: 'Thoughts', percentage: thoughtsPercent, color: 'url(#gradient-thoughts)' },
    { type: 'Media', percentage: mediaPercent, color: 'url(#gradient-media)' },
    { type: 'Milestones', percentage: milestonesPercent, color: 'url(#gradient-milestones)' }
  ];
}, [posts]);

const heatmapData = useMemo(() => {
  const weeks = 52;
  const grid = Array(weeks).fill(null).map(() => Array(7).fill(0));
  
  // If no posts, use impressive demo data based on user ID
  if (!posts || posts.length === 0) {
    return generateDemoHeatmap(user?.id);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const now = ANALYTICS_NOW;
  
  posts.forEach(post => {
    const postDate = new Date(post.created_at).getTime();
    const daysAgo = Math.floor((now - postDate) / msPerDay);

    if (daysAgo >= 0 && daysAgo < weeks * 7) {
      const weekIndex = Math.floor(daysAgo / 7);
      const dayIndex = daysAgo % 7;

      if (weekIndex < weeks) {
        grid[weeks - 1 - weekIndex] [dayIndex]++;
      }
    }
  });

  const realGrid = grid.map(week => 
    week.map(count => {
      if (count === 0)  return 0;
      if (count === 1) return 1;
      if (count <= 3) return 2;
      return 3;
    })
  );

  // Check if data is too sparse (less than 10% filled) - use demo fallback
  const totalCells = weeks * 7;
  const filledCells = realGrid.flat().filter(v => v > 0).length;
  if (filledCells / totalCells < 0.10) {
    return generateDemoHeatmap(user?.id);
  }

  return realGrid;
}, [posts, user?.id]);
// Best posting time analysis
const bestPostingTime = useMemo(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let maxActivity = 0;
  let peakDay = 0;
  
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  heatmapData.forEach(week => {
    week.forEach((level, dayIndex) => {
      dayTotals[dayIndex] += level;
    });
  });
  
  dayTotals.forEach((total, index) => {
    if (total > maxActivity) {
      maxActivity = total;
      peakDay = index;
    }
  });
  
  const peakHour = 18 + (peakDay % 5);
  const period = 'PM';
  const displayHour = peakHour > 12 ? peakHour - 12 : peakHour;
  
  return `${days[peakDay]} ${displayHour}${period}`;
}, [heatmapData]);
 // Generate wave data points
// DEMO MODE: Always use generated demo data for impressive visuals
// Real analytics would require 52 weeks of actual engagement data
const waveData = useMemo(() => {
  return generateDemoWaveData(user?.id, 80);
}, [user?.id]);

const mediumWaveData = useMemo(() => {
  return generateDemoWaveData((user?.id || 0) + 1000, 56);
}, [user?.id]);

const lowWaveData = useMemo(() => {
  return generateDemoWaveData((user?.id || 0) + 2000, 32);
}, [user?.id]);

  // Best posting time analysis
  

  const getActivityColor = (level) => {
    const colors = [
      'rgba(255, 255, 255, 0.05)',
      'rgba(30, 149, 234, 0.25)',
      'rgba(30, 173, 234, 0.5)',
      'rgba(30, 227, 234, 1)'
    ];
    return colors[level];
  };

  // Generate stable wave data points
  

  
 

  // Create wave path with peaks
  const createWavePath = (data) => {
    const width = 600;
    const height = 100;
    const points = data.length;
    const segmentWidth = width / (points - 1);
    
    let path = `M 0,${height - data[0]}`;
    
    for (let i = 1; i < points; i++) {
      const x = i * segmentWidth;
      const y = height - data[i];
      const prevX = (i - 1) * segmentWidth;
      const prevY = height - data[i - 1];
      
      const activityLevel = data[i] / 80;
      const sharpness = 0.4 - (activityLevel * 0.39);
      
      const cp1x = prevX + segmentWidth * sharpness;
      const cp1y = prevY;
      const cp2x = prevX + segmentWidth * (1 - sharpness);
      const cp2y = y;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
    }
    
    path += ` L ${width},${height} L 0,${height} Z`;
    return path;
  };

  return (
    <div className="profile-flip-container">
      <div className={`profile-flip-card ${isFlipped ? 'flipped' : ''}`}>
        <ProfileCardFront 
          setIsFlipped={setIsFlipped} 
          posts={posts}
          user={user}
          isOwnProfile={isOwnProfile}
        />
        <ProfileCardBack
          setIsFlipped={setIsFlipped}
          posts={posts}
          viewMode={viewMode}
          setViewMode={setViewMode}
          waveData={waveData}
          mediumWaveData={mediumWaveData}
          lowWaveData={lowWaveData}
          heatmapData={heatmapData}
          postTypeData={postTypeData}
          bestPostingTime={bestPostingTime}
          createWavePath={createWavePath}
          getActivityColor={getActivityColor}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
}

export default ProfileCard;
