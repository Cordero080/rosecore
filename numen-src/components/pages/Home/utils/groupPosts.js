// Utilities for grouping and sorting posts for Timeline River layout
// 🛠️ Import shared helpers instead of duplicating them here!
import { getDisplayName, getInitials, getPostTime } from "@utils/helpers";

// Group posts by user
// Accepts optional currentUser to ensure their profile_picture is used for their posts
export const groupPostsByUser = (posts, currentUser = null) => {
  const grouped = {}; //"Create the function. Start with an empty object called grouped — this will hold all the user buckets."

  //Loop through every post in the array. For each post, do the stuff inside.
  posts.forEach((post) => {
    //For each post, grab 4 things:
    const authorObj = typeof post.author === "object" ? post.author : null;
    //the author object (or null if it's just a string)
    const orderId = post.userId || authorObj?.id || post.author;
    //the user's ID (used as the bucket key)
    const postTime = getPostTime(post);
    //when it was posted (in milliseconds)
    const type = post.type || "thoughts";
    //thoughts, media, or milestones (defaults to thoughts)"

    // Create user bucket if it doesn't exist
    if (!grouped[orderId]) {
      grouped[orderId] = {
        // User info
        user: {
          id: orderId,
          name: getDisplayName(authorObj || post.author),
          username:
            // is the author an object with a username? don't crash if not
            authorObj?.username ||
            // else, if author is just a string, use that
            (typeof post.author === "string" ? post.author : null),
          // if neither, null
          first_name: authorObj?.first_name || "",
          // if authorObj exists, use first_name, else empty string
          last_name: authorObj?.last_name || "",
          profile_picture: authorObj?.profile_picture || null,
          // use the author's profile picture if available
          avatar: post.avatar || getInitials(authorObj || post.author),
          // if post has avatar, use it; else generate initials
        },
        // Post category arrays
        thoughts: [],
        media: [],
        milestones: [],
        // Most recent timestamp
        mostRecentTimestamp: postTime,
      };
    }

    // Next, update timestamp if needed
    // Update most recent timestamp if this post is newer
    if (postTime > grouped[orderId].mostRecentTimestamp) {
      grouped[orderId].mostRecentTimestamp = postTime;
    }

    // Then, add post to correct category
    // Add post to correct category
    if (grouped[orderId][type]) {
      grouped[orderId][type].push(post);
    }
  });

  // After grouping, update current user's profile_picture from auth context
  // This ensures we use the freshest profile_picture for the logged-in user
  if (currentUser && currentUser.profile_picture) {
    // Check by ID (number or string) and by username
    const currentUserId = currentUser.id;
    const currentUsername = currentUser.username;

    Object.keys(grouped).forEach((key) => {
      const userData = grouped[key];
      // Match by id (handle both number and string comparison)
      if (
        String(userData.user.id) === String(currentUserId) ||
        userData.user.username === currentUsername
      ) {
        userData.user.profile_picture = currentUser.profile_picture;
      }
    });
  }

  return grouped;
};

// Convert grouped  object/posts into sorted array
export const sortGroupedPosts = (grouped) => {
  return Object.entries(grouped)
    .map(([orderId, userData]) => ({
      // Convert to array with needed info
      date: new Date(userData.mostRecentTimestamp).toISOString().split("T")[0],
      orderId,
      data: userData,
      mostRecentTimestamp: userData.mostRecentTimestamp,
    }))
    .sort((a, b) => b.mostRecentTimestamp - a.mostRecentTimestamp);
};
