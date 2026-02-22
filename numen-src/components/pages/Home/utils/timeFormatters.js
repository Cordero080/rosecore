// 🔵 PABLO - Utility Functions
// timeFormatters.js - Date/time formatting utilities

//WHAT THIS FILE DOES:
// Converts timestamps into human-readable "time ago" format.


export const formatRelativeTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  // For older posts, show the date
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Format a date for display in headers (e.g., "Jan 4")
 * @param {string} dateString - ISO date string or Date object
 * @returns {string} Formatted date string
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
//===========================================
//ILLUSION OF PERSISTENCE
// Timestamp never changes.
// Display text keeps updating.
// Feels like it's "tracking time" but it's just math on each render.
//=============================================
// User sees post
//   ↓
// Component renders
//   ↓
// Calls formatRelativeTime("2026-01-04T19:45:00Z")
//   ↓
// Shows "2h ago"
//   ↓
// [2 hours pass]
//   ↓
// User refreshes page
//   ↓
// Component renders AGAIN
//   ↓
// Calls formatRelativeTime("2026-01-04T19:45:00Z") [same timestamp]
//   ↓
// Shows "4h ago" [different result]
