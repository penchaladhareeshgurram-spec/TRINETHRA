
import { Post, User } from './types';

// Default guest user for fallback
export const GUEST_USER: User = {
  id: 'guest',
  username: 'guest_user',
  displayName: 'Vision Guest',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
  bio: 'Just exploring the vision.',
  followers: 0,
  following: 0,
  isVerified: false
};

// Start with empty posts to show real user content
export const INITIAL_POSTS: Post[] = [];
