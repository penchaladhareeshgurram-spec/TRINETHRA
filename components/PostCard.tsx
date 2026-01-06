
import React, { useState } from 'react';
import { Post } from '../types';
import { Icon } from './Icon';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden mb-8 border border-slate-800 transition-all hover:border-violet-500/50">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-violet-600">
            <img src={post.userAvatar} alt={post.username} className="w-full h-full rounded-full border-2 border-slate-900 object-cover" />
          </div>
          <div>
            <span className="font-semibold text-sm hover:text-violet-400 cursor-pointer">{post.username}</span>
            {post.location && <p className="text-[10px] text-slate-400">{post.location}</p>}
          </div>
        </div>
        <button className="text-slate-400 hover:text-white">
          <Icon name="sparkles" size={18} />
        </button>
      </div>

      {/* Image */}
      <div className="relative group">
        <img 
          src={post.imageUrl} 
          alt="Post content" 
          className="w-full aspect-square object-cover"
          onDoubleClick={() => onLike(post.id)}
        />
        {post.aiVibe && (
          <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-300 border border-violet-500/30 flex items-center gap-1">
            <Icon name="sparkles" size={10} fill="currentColor" />
            Vibe: {post.aiVibe}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={() => onLike(post.id)} className={`transition-transform active:scale-125 ${post.likedByMe ? 'text-red-500' : 'text-white hover:text-slate-300'}`}>
            <Icon name="heart" fill={post.likedByMe ? 'currentColor' : 'none'} />
          </button>
          <button className="text-white hover:text-slate-300">
            <Icon name="comment" />
          </button>
          <button className="text-white hover:text-slate-300">
            <Icon name="send" />
          </button>
        </div>

        <p className="font-bold text-sm mb-2">{post.likes.toLocaleString()} likes</p>
        
        <div className="text-sm">
          <span className="font-bold mr-2">{post.username}</span>
          <span className="text-slate-200">{post.caption}</span>
        </div>

        {post.comments.length > 0 && (
          <button className="text-slate-500 text-xs mt-2 hover:text-slate-400">
            View all {post.comments.length} comments
          </button>
        )}

        {/* Comment input */}
        <form onSubmit={handleSubmitComment} className="mt-4 flex gap-2 items-center border-t border-slate-800 pt-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="bg-transparent flex-1 text-sm outline-none placeholder:text-slate-600"
          />
          <button 
            type="submit" 
            disabled={!commentText.trim()}
            className="text-violet-500 font-semibold text-sm disabled:opacity-50"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};
