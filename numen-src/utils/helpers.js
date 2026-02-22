/**
 * 🛠️ SHARED HELPER UTILITIES
 * ===========================
 * This file contains commonly used helper functions that were previously
 * duplicated across multiple components. Now they live in ONE place!
 *
 * WHY THIS EXISTS:
 * - Reduces code duplication (DRY principle - Don't Repeat Yourself)
 * - Single source of truth - fix a bug once, fixed everywhere
 * - Easier to test and maintain
 * - Makes components cleaner and more focused on their main job
 */

// ============================================
// 🧑 USER DISPLAY HELPERS
// ============================================

/**
 * Get a user's display name (full name or username fallback)
 *
 * HOW IT WORKS:
 * 1. If no user, return "User" as fallback
 * 2. If user has first_name/last_name, combine them
 * 3. Otherwise, fall back to username
 *
 * @param {Object|string} user - User object or string
 * @returns {string} - Display name like "John Doe" or "johndoe"
 *
 * @example
 * getDisplayName({ first_name: "John", last_name: "Doe" }) // "John Doe"
 * getDisplayName({ username: "johndoe" })                  // "johndoe"
 * getDisplayName(null)                                      // "User"
 */
export const getDisplayName = (user) => {
  if (!user) return "User";

  // Handle if user is just a string (like a username)
  if (typeof user === "string") return user;

  // Try to build full name from first_name + last_name
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  // Return full name if we got one, otherwise username, otherwise "User"
  return fullName || user.username || "User";
};

/**
 * Get user initials for avatar display
 *
 * HOW IT WORKS:
 * 1. If no user, return "??"
 * 2. If user has first AND last name, use first letter of each
 * 3. If only first name, use first 2 letters
 * 4. Fall back to first 2 letters of username
 *
 * @param {Object|string} user - User object or string
 * @returns {string} - 1-2 character initials like "JD" or "??"
 *
 * @example
 * getInitials({ first_name: "John", last_name: "Doe" }) // "JD"
 * getInitials({ first_name: "Alice" })                  // "AL"
 * getInitials({ username: "bob123" })                   // "BO"
 * getInitials(null)                                     // "??"
 */
export const getInitials = (user) => {
  if (!user) return "??";

  // Handle if user is just a string
  if (typeof user === "string") return user.slice(0, 2).toUpperCase();

  // Try first + last name initials
  const first = user.first_name?.[0] || "";
  const last = user.last_name?.[0] || "";

  if (first && last) return `${first}${last}`.toUpperCase();
  if (first) return user.first_name.slice(0, 2).toUpperCase();

  // Fall back to username
  return user.username?.slice(0, 2).toUpperCase() || "??";
};

/**
 * Get initials from a simple name string
 *
 * USE CASE: When you only have a display name string, not a user object
 *
 * @param {string} name - A name like "John Doe" or "johndoe"
 * @returns {string} - Initials like "JD" or "JO"
 *
 * @example
 * getInitialsFromName("John Doe")  // "JD"
 * getInitialsFromName("Alice")     // "AL"
 */
export const getInitialsFromName = (name) => {
  if (!name) return "??";

  const parts = name.trim().split(" ");

  if (parts.length >= 2) {
    // "John Doe" → "JD"
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  // Single word name → first 2 chars
  return name.slice(0, 2).toUpperCase();
};

// ============================================
// ⏰ TIME FORMATTING HELPERS
// ============================================

/**
 * Format a date as relative time ("2m ago", "3h ago", etc.)
 *
 * HOW IT WORKS:
 * 1. Calculate difference between now and the given date
 * 2. Convert to appropriate unit (minutes, hours, days, weeks)
 * 3. Return human-readable string
 *
 * THE MAGIC: This doesn't "track" time - it just does math on each render!
 * The timestamp never changes, but the display updates because React re-renders.
 *
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} - Relative time like "just now", "5m ago", "2d ago"
 *
 * @example
 * formatRelativeTime("2026-01-28T10:00:00Z") // "5m ago" (if it's 10:05)
 * formatRelativeTime(new Date())              // "just now"
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  // Calculate time difference in milliseconds
  const diffMs = now - date;

  // Convert to various units
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  // Return the most appropriate unit
  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  // For older posts, show the actual date
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Format a date for display in headers (e.g., "Jan 4")
 *
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} - Formatted date like "Jan 4"
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Get timestamp in milliseconds from a post object
 *
 * WHY THIS EXISTS: Different APIs use different field names!
 * Some use "createdAt", some use "created_at", this handles both.
 *
 * @param {Object} post - Post object with createdAt or created_at
 * @returns {number} - Timestamp in milliseconds (since Jan 1, 1970)
 */
export const getPostTime = (post) => {
  return new Date(post.createdAt || post.created_at || 0).getTime();
};

// ============================================
// 🎨 UI HELPERS
// ============================================

/**
 * Get a consistent color variant for a user (for avatars, badges, etc.)
 *
 * HOW IT WORKS:
 * Uses the user's ID to deterministically pick a color.
 * Same user always gets the same color!
 *
 * @param {number|string} userId - User's ID
 * @param {number} variantCount - Number of color variants (default: 5)
 * @returns {number} - Color variant index (1 to variantCount)
 *
 * @example
 * getColorVariant(123)  // Always returns same number for user 123
 * getColorVariant(456)  // Different but consistent for user 456
 */
export const getColorVariant = (userId, variantCount = 5) => {
  const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
  return (numericId % variantCount) + 1;
};
