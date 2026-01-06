
import { User } from '../types';

const USERS_KEY = 'trinethra_users_v2';
const CURRENT_USER_KEY = 'trinethra_active_user_v2';

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const registerUser = (username: string, displayName: string, password: string, bio: string = 'Exploring the vision.'): User | null => {
  const users = getUsers();
  if (users.find(u => u.username === username.toLowerCase())) {
    return null;
  }

  const newUser: User = {
    id: Date.now().toString(),
    username: username.toLowerCase(),
    displayName: displayName,
    password: password, // In a real app, this would be hashed
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    bio: bio || 'Joined the vision.',
    followers: 0,
    following: 0,
    isVerified: false
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  return newUser;
};

export const loginUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username.toLowerCase() && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword as User;
  }
  return null;
};

export const getActiveUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
