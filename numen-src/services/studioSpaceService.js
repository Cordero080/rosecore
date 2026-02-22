// 🔵 PABLO - StudioSpace Service
// studioSpaceService.js - API calls for StudioSpace profile and music data

import apiClient from "./apiClient";

/**
 * Get a user's StudioSpace profile data (including playlist)
 * @param {string} username - The username to fetch
 * @returns {Promise} StudioSpace profile data
 */
export const getStudioSpaceProfile = async (username) => {
  try {
    const response = await apiClient.get(`/studiospace/${username}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching StudioSpace profile:", error);
    throw error;
  }
};

/**
 * Update own StudioSpace profile settings
 * @param {object} data - Profile data to update
 * @returns {Promise} Updated profile data
 */
export const updateStudioSpaceProfile = async (data) => {
  try {
    const response = await apiClient.put("/studiospace/", data);
    return response.data;
  } catch (error) {
    console.error("Error updating StudioSpace profile:", error);
    throw error;
  }
};

/**
 * Add a song to the playlist
 * @param {object} song - Song data { title, artist, duration, preview_url, spotify_id?, album_art? }
 * @returns {Promise} Added song data
 */
export const addSongToPlaylist = async (song) => {
  try {
    const response = await apiClient.post("/studiospace/playlist/", song);
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
    const response = await apiClient.delete(`/studiospace/playlist/${songId}/`);
    return response.data;
  } catch (error) {
    console.error("Error removing song:", error);
    throw error;
  }
};

/**
 * Reorder playlist
 * @param {array} songIds - Array of song IDs in new order
 * @returns {Promise}
 */
export const reorderPlaylist = async (songIds) => {
  try {
    const response = await apiClient.put("/studiospace/playlist/reorder/", {
      song_ids: songIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error reordering playlist:", error);
    throw error;
  }
};

/**
 * Search for songs via backend proxy (Spotify/Deezer)
 * @param {string} query - Search query
 * @returns {Promise} Array of song results
 */
export const searchSongs = async (query) => {
  try {
    const response = await apiClient.get("/music/search/", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching songs:", error);
    throw error;
  }
};

export default {
  getStudioSpaceProfile,
  updateStudioSpaceProfile,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylist,
  searchSongs,
};
