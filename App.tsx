
import React, { useState, useEffect } from 'react';
import { Post, Notification, User } from './types';
import { INITIAL_POSTS } from './constants';
import { Icon } from './components/Icon';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { Auth } from './components/Auth';
import { searchPostsWithAI } from './services/geminiService';
import { getActiveUser, logoutUser } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'notifications' | 'profile'>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    // Check for existing session
    const active = getActiveUser();
    if (active) setCurrentUser(active);

    // Load persisted posts
    const saved = localStorage.getItem('trinethra_posts_v2');
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      setPosts(INITIAL_POSTS);
    }
  }, []);

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('trinethra_posts_v2', JSON.stringify(newPosts));
  };

  const handleLike = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
          likedByMe: !p.likedByMe
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleComment = (postId: string, text: string) => {
    if (!currentUser) return;
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: Math.random().toString(36).substr(2, 9),
              userId: currentUser.id,
              username: currentUser.username,
              text,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleCreatePost = (data: { imageUrl: string; caption: string; vibe: string }) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      imageUrl: data.imageUrl,
      caption: data.caption,
      aiVibe: data.vibe,
      likes: 0,
      likedByMe: false,
      comments: [],
      createdAt: new Date().toISOString()
    };
    savePosts([newPost, ...posts]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredPosts(null);
      return;
    }
    setIsSearching(true);
    const results = await searchPostsWithAI(searchQuery, posts);
    setFilteredPosts(results);
    setIsSearching(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab('home');
  };

  if (!currentUser) {
    return <Auth onAuthSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 pb-20 md:pb-0 selection:bg-violet-500/30">
      {/* Navigation (Desktop Sidebar) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 border-r border-slate-900 glass flex-col p-8 z-40">
        <div className="mb-14 px-2">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white via-violet-400 to-indigo-500 bg-clip-text text-transparent">
            TRINETHRA
          </h1>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.5em] font-black mt-2">Vision Interface</p>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setFilteredPosts(null); }} icon="home" label="Core Feed" />
          <NavItem active={activeTab === 'search'} onClick={() => setActiveTab('search')} icon="search" label="AI Search" />
          <NavItem active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon="bell" label="Alerts" />
          <NavItem active={false} onClick={() => setIsCreateModalOpen(true)} icon="plus" label="Synthesize" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="user" label="My Protocol" />
        </nav>

        <div className="mt-auto space-y-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-400 transition-all text-xs font-black uppercase tracking-widest border border-transparent hover:border-red-900/30 rounded-2xl"
          >
            <div className="rotate-45 p-1 bg-red-900/10 rounded-lg"><Icon name="plus" size={14} /></div>
            Disconnect
          </button>
          <div className="p-4 glass rounded-[2rem] flex items-center gap-4 border border-slate-800 shadow-xl">
            <div className="w-12 h-12 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-br from-violet-500 to-indigo-600">
              <img src={currentUser.avatar} alt="Me" className="w-full h-full rounded-[0.9rem] border-2 border-slate-900 object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-white">{currentUser.username}</p>
              <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-tighter">Verified Agent</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 max-w-2xl mx-auto px-6 pt-10">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-10">
          <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-violet-500 bg-clip-text text-transparent">
            TRINETHRA
          </h1>
          <div className="flex gap-3">
            <button onClick={() => setIsCreateModalOpen(true)} className="p-3 glass rounded-2xl border-slate-800 text-violet-400"><Icon name="plus" size={20} /></button>
            <button onClick={handleLogout} className="p-3 glass rounded-2xl border-slate-800 text-slate-500"><Icon name="plus" className="rotate-45" size={20} /></button>
          </div>
        </div>

        {/* Home Feed */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-700">
            <div className="flex gap-5 overflow-x-auto pb-8 scrollbar-hide mb-6">
              <StoryItem username="Identity" image={currentUser.avatar} isMe />
              <StoryItem username="Gemini" image="https://api.dicebear.com/7.x/avataaars/svg?seed=gemini" />
              <StoryItem username="Nexus" image="https://api.dicebear.com/7.x/avataaars/svg?seed=nexus" />
              <StoryItem username="Pioneer" image="https://api.dicebear.com/7.x/avataaars/svg?seed=pioneer" />
            </div>

            <div className="space-y-6">
              {(filteredPosts || posts).length > 0 ? (
                (filteredPosts || posts).map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLike={handleLike} 
                    onComment={handleComment} 
                  />
                ))
              ) : (
                <div className="text-center py-40 border-2 border-dashed border-slate-900 rounded-[3rem]">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-2xl">
                    <Icon name="sparkles" size={40} className="text-violet-500 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black mb-3">Vision is Empty</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Be the pioneer. Synthesize your first vision and broadcast it to the TRINETHRA core.</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-10 py-4 rounded-2xl font-black transition-all transform active:scale-95 shadow-xl shadow-violet-900/20"
                  >
                    Initiate First Synthesis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs remain similar but styled... */}
        {activeTab === 'search' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask TRINETHRA to find specific vibes..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:border-violet-500/50 transition-all text-sm backdrop-blur-md"
              />
              <Icon name="search" className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              {isSearching && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </form>
            {/* ... filtered posts rendering ... */}
            {filteredPosts && (
              <div className="grid grid-cols-3 gap-3">
                {filteredPosts.map(post => (
                  <div key={post.id} onClick={() => { setFilteredPosts([post]); setActiveTab('home'); }} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform border border-slate-800">
                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="pb-10 animate-in fade-in duration-700">
            <div className="flex flex-col items-center mb-12">
              <div className="w-40 h-40 rounded-[3rem] p-1 bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 mb-8 rotate-6 hover:rotate-0 transition-all duration-500 cursor-pointer shadow-2xl shadow-violet-500/20 group">
                <img src={currentUser.avatar} className="w-full h-full rounded-[2.8rem] border-8 border-slate-950 object-cover group-hover:scale-105 transition-transform" alt="" />
              </div>
              <h2 className="text-3xl font-black flex items-center gap-3">
                {currentUser.displayName}
                {currentUser.isVerified && <div className="bg-violet-500 p-1 rounded-full shadow-lg shadow-violet-500/50"><Icon name="sparkles" size={12} className="text-white" /></div>}
              </h2>
              <p className="text-violet-400 font-black text-xs tracking-[0.3em] mt-2 uppercase">@{currentUser.username}</p>
              <div className="mt-6 glass px-6 py-4 rounded-[2rem] border-white/5 max-w-sm text-center">
                <p className="text-sm font-medium text-slate-300 leading-relaxed">{currentUser.bio}</p>
              </div>
              
              <div className="flex gap-12 mt-10">
                <StatItem value={posts.filter(p => p.userId === currentUser.id).length} label="Synthesis" />
                <StatItem value="0" label="Witnesses" />
                <StatItem value="0" label="Linkages" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
               {posts.filter(p => p.userId === currentUser.id).map(p => (
                <div key={p.id} className="aspect-square glass rounded-2xl overflow-hidden border border-slate-800 hover:border-violet-500/50 transition-all">
                  <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 px-10 py-5 flex justify-between items-center z-40 rounded-t-[3rem] shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-violet-500' : 'text-slate-500'}><Icon name="home" /></button>
        <button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'text-violet-500' : 'text-slate-500'}><Icon name="search" /></button>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white p-4 rounded-2xl -mt-16 shadow-2xl shadow-violet-900/60 transform hover:scale-110 active:scale-90 transition-all"><Icon name="plus" size={24} /></button>
        <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'text-violet-500' : 'text-slate-500'}><Icon name="bell" /></button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-violet-500' : 'text-slate-500'}><Icon name="user" /></button>
      </nav>

      {/* Modal */}
      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onPostCreated={handleCreatePost} 
        />
      )}
    </div>
  );
};

const StatItem: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center group cursor-default">
    <p className="text-2xl font-black group-hover:text-violet-400 transition-colors">{value}</p>
    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">{label}</p>
  </div>
);

/* Helper Components */
const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-5 py-4 rounded-[1.5rem] transition-all duration-300 ${active ? 'bg-violet-600/15 text-white border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'text-slate-500 hover:bg-slate-900 hover:text-white border border-transparent'}`}
  >
    <div className={`${active ? 'text-violet-400' : ''}`}><Icon name={icon} fill={active ? 'rgba(167, 139, 250, 0.2)' : 'none'} /></div>
    <span className="font-black text-sm tracking-tight">{label}</span>
  </button>
);

const StoryItem: React.FC<{ username: string; image: string; isMe?: boolean }> = ({ username, image, isMe }) => (
  <div className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer group">
    <div className={`w-20 h-20 rounded-[1.8rem] p-[4px] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${isMe ? 'bg-slate-800' : 'bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-500/20'}`}>
      <div className="w-full h-full rounded-[1.5rem] p-[2px] bg-slate-950">
        <img src={image} className="w-full h-full rounded-[1.4rem] object-cover" alt={username} />
      </div>
    </div>
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{username}</span>
  </div>
);

export default App;
