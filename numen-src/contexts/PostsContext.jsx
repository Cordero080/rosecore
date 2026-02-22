/**
 * =============================================================================
 * POSTS CONTEXT
 * =============================================================================
 * 
 * File: frontend/src/contexts/PostsContext.jsx
 * Assigned to: COLIN
 * Responsibility: Global posts state management
 * 
 * Status: IMPLEMENTED ✅
 * =============================================================================
 */
import React, { createContext, useContext, useState, useEffect} from 'react';
import postsService from '@services/postsService';
import { useAuth } from './AuthContext';

// Create the context object - this is what components will consume(empty container that will hold the global posts state)
const PostsContext = createContext(null);

export const PostsProvider = ({ children }) => {
  // All the STATE and functions are defined here
  const { user, isLoading: authLoading, isAuthenticated } = useAuth(); // Get auth state
  
  // STATE - the "source of truth" for all posts data
  const [posts, setPosts] = useState([]); // Array of post objects
  const [isLoading, setIsLoading] = useState(false);// True while fetching
  const [error, setError] = useState(null); // Error message if something fails
  
  // COLLAPSED DECKS - shared across Home and Profile pages
  // Set of category types that are currently collapsed: 'thoughts', 'media', 'milestones'
  // Persisted to localStorage so it survives page refresh
  const [collapsedDecks, setCollapsedDecks] = useState(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem('collapsedDecks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  
  // Save to localStorage whenever collapsedDecks changes
  useEffect(() => {
    localStorage.setItem('collapsedDecks', JSON.stringify([...collapsedDecks]));
  }, [collapsedDecks]);
  
  // Collapse a deck category
  const collapseDeck = (type) => {
    setCollapsedDecks(prev => new Set([...prev, type]));
  };
  
  // Expand a deck category
  const expandDeck = (type) => {
    setCollapsedDecks(prev => {
      const next = new Set(prev);
      next.delete(type);
      return next;
    });
  };

  // FETCH WHEN USER LOGS IN (and auth is done loading)
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish
    if (user && isAuthenticated) {
      fetchPosts();
    } else {
      setPosts([]); // Clear posts when logged out
    }
  }, [user, authLoading, isAuthenticated]);

   // FETCH ALL POSTS
   const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);  // Clear any previous errors
    try {
      const data = await postsService.getAll();// Call service, get array
      setPosts(data); // Store in state
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch posts');

    }  finally {
      setIsLoading(false)// Always turn off loading, success or fail
    }
  };

  // FETCH POSTS BY USERNAME - for viewing a specific user's profile
  const fetchPostsByUsername = async (username) => {
    try {
      const data = await postsService.getByUsername(username);
      // Merge into existing posts (avoid duplicates)
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = data.filter(p => !existingIds.has(p.id));
        return [...newPosts, ...prev];
      });
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to fetch user posts'
      };
    }
  };

   // CREATE POST
   const createPost = async (postData) => {
    try {
      console.log('📝 Creating post with data:', postData);
      const newPost = await postsService.create(postData);// Returns new post with id
      console.log('📝 Post created, response:', newPost);
      
      // If this was a wall post, manually attach the target_profile_id
      // (in case backend doesn't return it yet)
      if (postData.target_profile_id && !newPost.target_profile_id) {
        newPost.target_profile_id = postData.target_profile_id;
      }
      
      setPosts(prev => [newPost, ...prev]);// Add to top of list (spread previous posts after)
      
      // Auto-expand the category that was just posted to
      const postType = postData.type || newPost.type;
      if (postType) {
        expandDeck(postType);
      }
      
      return {success: true, post: newPost };
    } catch (err) {
      console.error('📝 Post creation failed:', err);
      return {
        success: false,
        error: err.response?.data?.detail || 'Failed to create post'
      };
    }
   };
 // UPDATE POST
 const updatePost = async (id, data) => {
  try {
    const updatedPost = await postsService.update(id, data); // Returns updated post
      // Replace old post with updated one in state
      // PRESERVE target_profile_id if it existed (for wall posts)
      setPosts(prev => prev.map(post =>
        post.id === id 
          ? { ...updatedPost, target_profile_id: post.target_profile_id || updatedPost.target_profile_id }
          : post
      ));
      return {success: true};
      } catch (err) {
        return {
          success: false, 
          error: err.response?.data?.detail || 'Failed to update post'
        };
      }
 };
// DELETE POST
const deletePost = async (id) => {
  try {
    await postsService.delete(id);// No return value
    setPosts(prev => prev.filter(post => post.id !== id));// Remove from state by filtering out
    return { success: true};
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || 'Failed to delete post'
    };
  }
};

// FETCH REPLIES for a post
const fetchReplies = async (postId) => {
  try {
    const replies = await postsService.getReplies(postId);
    return { success: true, data: replies };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || 'Failed to fetch replies'
    };
  }
};

// CREATE REPLY to a post
const createReply = async (parentId, content) => {
  try {
    const newReply = await postsService.createReply(parentId, content);
    // Update reply_count on the parent post
    setPosts(prev => prev.map(post =>
      post.id === parentId 
        ? { ...post, reply_count: (post.reply_count || 0) + 1 }
        : post
    ));
    return { success: true, data: newReply };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || 'Failed to create reply'
    };
  }
};

// LIKE/UNLIKE a post - uses explicit action to prevent mobile double-tap race conditions
const likePost = async (id) => {
  try {
    // Find current post state to determine the action
    const currentPost = posts.find(p => p.id === id);
    const action = currentPost?.is_liked ? 'unlike' : 'like';
    
    const updatedPost = await postsService.like(id, action);
    // Update the post in state with new like count and is_liked status
    // PRESERVE target_profile_id if it existed (for wall posts)
    setPosts(prev => prev.map(post =>
      post.id === id 
        ? { ...updatedPost, target_profile_id: post.target_profile_id || updatedPost.target_profile_id }
        : post
    ));
    return { success: true, data: updatedPost };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || 'Failed to like post'
    };
  }
};

// SHARE a post
const sharePost = async (id) => {
  try {
    const updatedPost = await postsService.share(id);
    // Update the post in state with new share count
    setPosts(prev => prev.map(post =>
      post.id === id ? updatedPost : post
    ));
    return { success: true, data: updatedPost };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.detail || 'Failed to share post'
    };
  }
};

// PROVIDER - wraps app and exposes state + actions to all children
return (
  <PostsContext.Provider
  value ={{
    //State
    posts,
    isLoading,
    error,
    collapsedDecks,
     // Actions
     fetchPosts,
     fetchPostsByUsername,
     createPost,
     updatePost,
     deletePost,
     fetchReplies,
     createReply,
     likePost,
     sharePost,
     collapseDeck,
     expandDeck,
  }}
  >
  {children}
  </PostsContext.Provider>
);

};

// CUSTOM HOOK - cleaner way to consume context
export const usePosts = () => {
  const context = useContext(PostsContext); // Grab context value
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider'); // Safety check
  }
  return context;
};

export default PostsContext;