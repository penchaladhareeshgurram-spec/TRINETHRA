
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isVerified?: boolean;
  password?: string; // Stored for mock auth purposes
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  createdAt: string;
  location?: string;
  aiVibe?: string; // AI generated 'aura' or vibe
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  userId: string;
  username: string;
  targetId?: string;
  text: string;
  createdAt: string;
  read: boolean;
}
