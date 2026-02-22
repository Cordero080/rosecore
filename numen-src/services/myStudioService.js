// 🔵 PABLO - MyStudio Service
// myStudioService.js - API calls for MyStudio profile and music data

import apiClient from "./apiClient";

/**
 * Get current user's MyStudio profile (authenticated)
 * @returns {Promise} MyStudio profile data
 */
export const getMyProfile = async () => {
  try {
    const response = await apiClient.get("/mystudio/profile/");
    return response.data;
  } catch (error) {
    console.error("Error fetching MyStudio profile:", error);
    throw error;
  }
};

/**
 * Get any user's MyStudio profile data (public)
 * @param {string} username - The username to fetch
 * @returns {Promise} MyStudio profile data
 */
export const getMyStudioProfile = async (username) => {
  try {
    const response = await apiClient.get(`/mystudio/${username}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching MyStudio profile:", error);
    throw error;
  }
};

/**
 * Update own MyStudio profile settings (authenticated)
 * @param {object} data - Profile data to update
 * @returns {Promise} Updated profile data
 */
export const updateMyStudioProfile = async (data) => {
  try {
    const response = await apiClient.put("/mystudio/", data);
    return response.data;
  } catch (error) {
    console.error("Error updating MyStudio profile:", error);
    throw error;
  }
};

/**
 * Add a song to the playlist
 * @param {object} song - Song data { title, artist, external_id, preview_url, album_art }
 * @returns {Promise} Added song data
 */
export const addSongToPlaylist = async (song) => {
  try {
    const response = await apiClient.post("/mystudio/playlist/", {
      title: song.title,
      artist: song.artist,
      external_id: song.external_id || song.deezer_id || song.id,
      preview_url: song.preview_url,
      album_art: song.album_art,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding song:", error);
    throw error;
  }
};

/**
 * Remove a song from the playlist
 * @param {number} songId - ID of the song to remove
 * @returns {Promise}
 */
export const removeSongFromPlaylist = async (songId) => {
  try {
    const response = await apiClient.delete(`/mystudio/playlist/${songId}/`);
    return response.data;
  } catch (error) {
    console.error("Error removing song:", error);
    throw error;
  }
};

/**
 * Set the main profile song (displayed on profile)
 * @param {object} song - Song data { title, artist, external_id, preview_url, album_art }
 * @returns {Promise} Updated profile data
 */
export const setProfileSong = async (song) => {
  try {
    const response = await apiClient.post("/mystudio/profile-song/", {
      title: song.title,
      artist: song.artist,
      external_id: song.external_id || song.deezer_id || song.id,
      preview_url: song.preview_url,
      album_art: song.album_art,
    });
    return response.data;
  } catch (error) {
    console.error("Error setting profile song:", error);
    throw error;
  }
};

/**
 * Search for songs via backend (Deezer/iTunes with preview URLs)
 * @param {string} query - Search query
 * @returns {Promise} Array of song results with preview_url
 */
export const searchSongs = async (query) => {
  try {
    const response = await apiClient.get("/mystudio/search/", {
      params: { q: query },
    });
    // Backend returns { results: [...] } with duration_ms
    // Frontend expects array with duration formatted as "M:SS"
    const results = response.data.results || response.data || [];
    return results.map((song) => ({
      ...song,
      duration: formatDuration(song.duration_ms || song.duration),
    }));
  } catch (error) {
    console.error("Error searching songs:", error);
    throw error;
  }
};

// Convert milliseconds to "M:SS" format
const formatDuration = (ms) => {
  if (!ms || typeof ms === "string") return ms || "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default {
  getMyProfile,
  getMyStudioProfile,
  updateMyStudioProfile,
  addSongToPlaylist,
  removeSongFromPlaylist,
  setProfileSong,
  searchSongs,
};
