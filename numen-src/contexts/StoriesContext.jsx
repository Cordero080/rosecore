import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import storiesService from '@services/storiesService';

const StoriesContext = createContext(null);

export const StoriesProvider = ({ children }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);        // All stories grouped by user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewedStoryIds, setViewedStoryIds] = useState([]);

  // Load viewed stories from localStorage when user changes (user-specific key)
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`viewedStories_${user.id}`);
      setViewedStoryIds(saved ? JSON.parse(saved) : []);
    } else {
      setViewedStoryIds([]);
    }
  }, [user?.id]);

  // Save viewed stories to localStorage (user-specific key)
  useEffect(() => {
    if (user?.id && viewedStoryIds.length > 0) {
      localStorage.setItem(`viewedStories_${user.id}`, JSON.stringify(viewedStoryIds));
    }
  }, [viewedStoryIds, user?.id]);

  // Fetch all stories on mount
  const fetchStories = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await storiesService.getAll();
      // Handle both array response and { stories: [...] } response
      const storiesArray = Array.isArray(data) ? data : (data?.stories || []);
      
      // Backend returns flat array of stories, each with .user object
      // Transform into grouped format: [{ user_id, user, stories: [...] }, ...]
      const grouped = storiesArray.reduce((acc, story) => {
        const userId = story.user?.id || story.user_id;
        if (!userId) return acc;
        
        const existing = acc.find(g => g.user_id === userId);
        if (existing) {
          existing.stories.push(story);
        } else {
          acc.push({
            user_id: userId,
            user: story.user,
            stories: [story]
          });
        }
        return acc;
      }, []);
      
      setStories(grouped);
    } catch (err) {
      setError(err.message || 'Failed to fetch stories');
      console.error('Failed to fetch stories:', err);
      setStories([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Create a new story
  const createStory = useCallback(async (storyData) => {
    try {
      const newStory = await storiesService.create(storyData);
      // Add to local state immediately
      setStories(prev => {
        // Find if user already has stories
        const userStories = prev.find(s => s.user_id === user.id);
        if (userStories) {
          return prev.map(s => 
            s.user_id === user.id 
              ? { ...s, stories: [newStory, ...s.stories] }
              : s
          );
        }
        // New story group for user
        return [{ user_id: user.id, user: user, stories: [newStory] }, ...prev];
      });
      return { success: true, story: newStory };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user]);

  // Delete a story
  const deleteStory = useCallback(async (storyId) => {
    try {
      await storiesService.delete(storyId);
      setStories(prev => 
        prev.map(group => ({
          ...group,
          stories: group.stories.filter(s => s.id !== storyId)
        })).filter(group => group.stories.length > 0)
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Mark story as viewed
  const markStoryViewed = useCallback(async (storyId) => {
    if (viewedStoryIds.includes(storyId)) return;
    
    setViewedStoryIds(prev => [...prev, storyId]);
    try {
      await storiesService.markViewed(storyId);
    } catch (err) {
      console.error('Failed to mark story viewed:', err);
    }
  }, [viewedStoryIds]);

  // React to a story
  const reactToStory = useCallback(async (storyId, reactionType) => {
    try {
      const result = await storiesService.react(storyId, reactionType);
      // Update local state with new reaction
      setStories(prev => 
        prev.map(group => ({
          ...group,
          stories: group.stories.map(s => 
            s.id === storyId ? { ...s, user_reaction: reactionType, ...result } : s
          )
        }))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Check if story has been viewed
  const isStoryViewed = useCallback((storyId) => {
    return viewedStoryIds.includes(storyId);
  }, [viewedStoryIds]);

  // Get current user's stories (safe array access)
  const myStories = Array.isArray(stories) 
    ? (stories.find(s => s.user_id === user?.id)?.stories || [])
    : [];

  // Get friends' stories (excluding current user)
  const friendStories = Array.isArray(stories) 
    ? stories.filter(s => s.user_id !== user?.id)
    : [];

  return (
    <StoriesContext.Provider value={{
      stories,
      myStories,
      friendStories,
      loading,
      error,
      fetchStories,
      createStory,
      deleteStory,
      markStoryViewed,
      reactToStory,
      isStoryViewed,
    }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
};