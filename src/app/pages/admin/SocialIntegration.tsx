import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Instagram, Facebook, MessageCircle, Calendar, Image, Heart, MessageSquare, Share, Settings, Link, Plus, Eye } from "lucide-react";

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  content: string;
  image?: string;
  scheduledDate?: string;
  status: 'draft' | 'scheduled' | 'posted';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: string;
}

interface SocialMessage {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  sender: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  type: 'dm' | 'comment' | 'mention';
}

const mockPosts: SocialPost[] = [
  {
    id: "1",
    platform: "instagram",
    content: "New collection dropping this weekend! ✨ Featuring our minimalist designs with premium fabrics. Link in bio to shop now.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NzUwNDY2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    scheduledDate: "2024-01-20",
    status: "scheduled",
    engagement: { likes: 0, comments: 0, shares: 0 },
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    platform: "facebook",
    content: "Customer spotlight: Sarah's transformation with our white shirt! She says it's her new favorite piece. What's your go-to outfit? 👕",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHdoaXRlJTIwc2hpcnR8ZW58MXx8fHwxNzc1MDQ2NjYzMHww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "posted",
    engagement: { likes: 45, comments: 12, shares: 8 },
    createdAt: "2024-01-14"
  },
  {
    id: "3",
    platform: "tiktok",
    content: "POV: You just got your CLO delivery 📦 #OOTD #Fashion #MinimalistStyle",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdW5ib3hpbmd8ZW58MXx8fHwxNzc1MDQ2NjYzMHww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "posted",
    engagement: { likes: 234, comments: 45, shares: 67 },
    createdAt: "2024-01-13"
  },
  {
    id: "4",
    platform: "instagram",
    content: "Behind the scenes: How we craft our premium denim jeans. Quality over quantity, always. 🔨",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGZhY3Rvcnl8ZW58MXx8fHwxNzc1MDQ2NjYzMHww&ixlib=rb-4.1.0&q=80&w=1080",
    status: "draft",
    engagement: { likes: 0, comments: 0, shares: 0 },
    createdAt: "2024-01-12"
  }
];

const mockMessages: SocialMessage[] = [
  {
    id: "1",
    platform: "instagram",
    sender: "fashion_lover_23",
    message: "Hi! I love your new collection. Do you have this shirt in size XL?",
    timestamp: "2024-01-15T10:30:00",
    status: "unread",
    type: "dm"
  },
  {
    id: "2",
    platform: "facebook",
    sender: "Mike Chen",
    message: "Thanks for the quick shipping! The hoodie arrived today and it's perfect.",
    timestamp: "2024-01-14T15:45:00",
    status: "read",
    type: "dm"
  },
  {
    id: "3",
    platform: "tiktok",
    sender: "style_icon_99",
    message: "Love this unboxing video! Can you do a review on the luxury dress?",
    timestamp: "2024-01-13T20:15:00",
    status: "replied",
    type: "comment"
  },
  {
    id: "4",
    platform: "instagram",
    sender: "minimalist_fan",
    message: "@clo_official when will the new collection be available?",
    timestamp: "2024-01-12T14:20:00",
    status: "unread",
    type: "mention"
  }
];

export function SocialIntegration() {
  const [activeTab, setActiveTab] = useState<'posts' | 'messages' | 'analytics'>('posts');
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts);
  const [messages, setMessages] = useState<SocialMessage[]>(mockMessages);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: 'instagram' as SocialPost['platform'],
    content: '',
    scheduledDate: '',
    image: ''
  });

  const getPlatformIcon = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={20} className="text-pink-500" />;
      case 'facebook':
        return <Facebook size={20} className="text-blue-600" />;
      case 'tiktok':
        return <MessageCircle size={20} className="text-black" />;
    }
  };

  const getPlatformColor = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100 text-pink-800';
      case 'facebook':
        return 'bg-blue-100 text-blue-800';
      case 'tiktok':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: SocialPost['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'posted':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (status: SocialPost['status']) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'scheduled':
        return 'Scheduled';
      case 'posted':
        return 'Posted';
    }
  };

  const getMessageStatusColor = (status: SocialMessage['status']) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreatePost = () => {
    const post: SocialPost = {
      id: Date.now().toString(),
      platform: newPost.platform,
      content: newPost.content,
      image: newPost.image || undefined,
      scheduledDate: newPost.scheduledDate || undefined,
      status: newPost.scheduledDate ? 'scheduled' : 'draft',
      engagement: { likes: 0, comments: 0, shares: 0 },
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({
      platform: 'instagram',
      content: '',
      scheduledDate: '',
      image: ''
    });
  };

  const getAnalytics = () => {
    const totalPosts = posts.length;
    const postedPosts = posts.filter(p => p.status === 'posted').length;
    const totalEngagement = posts.reduce((sum, p) => sum + p.engagement.likes + p.engagement.comments + p.engagement.shares, 0);
    const unreadMessages = messages.filter(m => m.status === 'unread').length;

    return { totalPosts, postedPosts, totalEngagement, unreadMessages };
  };

  const analytics = getAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-widest uppercase">Social Media Integration</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPostModal(true)}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors tracking-wider uppercase text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Create Post
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Image size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Total Posts</p>
              <p className="text-2xl font-bold tracking-wider">{analytics.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Share size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Posted</p>
              <p className="text-2xl font-bold tracking-wider">{analytics.postedPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Heart size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Total Engagement</p>
              <p className="text-2xl font-bold tracking-wider">{analytics.totalEngagement.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <MessageSquare size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-wider uppercase">Unread Messages</p>
              <p className="text-2xl font-bold tracking-wider">{analytics.unreadMessages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'posts', label: 'Posts & Content', icon: Image },
            { id: 'messages', label: 'Messages & DMs', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-center tracking-wider uppercase text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <tab.icon size={16} className="mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(post.platform)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full tracking-wider uppercase ${getPlatformColor(post.platform)}`}>
                        {post.platform}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full tracking-wider uppercase ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 tracking-wider">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <p className="text-gray-700 tracking-wider mb-3">{post.content}</p>

                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}

                  {post.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar size={14} />
                      <span className="tracking-wider">Scheduled for {formatDate(post.scheduledDate)}</span>
                    </div>
                  )}

                  {post.status === 'posted' && (
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart size={14} />
                        <span className="tracking-wider">{post.engagement.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span className="tracking-wider">{post.engagement.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share size={14} />
                        <span className="tracking-wider">{post.engagement.shares}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(message.platform)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full tracking-wider uppercase ${getPlatformColor(message.platform)}`}>
                        {message.platform}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full tracking-wider uppercase ${getMessageStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 tracking-wider uppercase">
                        {message.type}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 tracking-wider">
                      {formatDateTime(message.timestamp)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="font-medium tracking-wider mb-1">From: {message.sender}</p>
                    <p className="text-gray-700 tracking-wider">{message.message}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors tracking-wider uppercase text-sm">
                      Reply
                    </button>
                    {message.status === 'unread' && (
                      <button className="px-3 py-1 bg-gray-600 text-white hover:bg-gray-700 transition-colors tracking-wider uppercase text-sm">
                        Mark as Read
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-linear-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Instagram size={24} className="text-pink-600" />
                    <h3 className="font-semibold tracking-wider uppercase">Instagram</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 tracking-wider">Followers: 12.5K</p>
                    <p className="text-sm text-gray-600 tracking-wider">Posts: {posts.filter(p => p.platform === 'instagram').length}</p>
                    <p className="text-sm text-gray-600 tracking-wider">Avg. Engagement: 4.2%</p>
                  </div>
                </div>

                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Facebook size={24} className="text-blue-600" />
                    <h3 className="font-semibold tracking-wider uppercase">Facebook</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 tracking-wider">Followers: 8.3K</p>
                    <p className="text-sm text-gray-600 tracking-wider">Posts: {posts.filter(p => p.platform === 'facebook').length}</p>
                    <p className="text-sm text-gray-600 tracking-wider">Avg. Engagement: 3.1%</p>
                  </div>
                </div>

                <div className="bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle size={24} className="text-black" />
                    <h3 className="font-semibold tracking-wider uppercase">TikTok</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 tracking-wider">Followers: 15.2K</p>
                    <p className="text-sm text-gray-600 tracking-wider">Posts: {posts.filter(p => p.platform === 'tiktok').length}</p>
                    <p className="text-sm text-gray-600 tracking-wider">Avg. Engagement: 8.7%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold tracking-wider uppercase mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <Link size={20} className="text-gray-600" />
                      <span className="font-medium tracking-wider uppercase">Connect Accounts</span>
                    </div>
                    <p className="text-sm text-gray-600 tracking-wider">Link your social media accounts</p>
                  </button>

                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={20} className="text-gray-600" />
                      <span className="font-medium tracking-wider uppercase">Schedule Posts</span>
                    </div>
                    <p className="text-sm text-gray-600 tracking-wider">Plan your content calendar</p>
                  </button>

                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye size={20} className="text-gray-600" />
                      <span className="font-medium tracking-wider uppercase">View Insights</span>
                    </div>
                    <p className="text-sm text-gray-600 tracking-wider">Analyze performance metrics</p>
                  </button>

                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <Settings size={20} className="text-gray-600" />
                      <span className="font-medium tracking-wider uppercase">Auto Posting</span>
                    </div>
                    <p className="text-sm text-gray-600 tracking-wider">Set up automated posting rules</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-wider uppercase">Create New Post</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-2">Platform</label>
                <select
                  value={newPost.platform}
                  onChange={(e) => setNewPost(prev => ({ ...prev, platform: e.target.value as SocialPost['platform'] }))}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={newPost.image}
                  onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
                />
              </div>

              <div>
                <label className="block text-sm font-medium tracking-wider uppercase mb-2">Schedule Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={newPost.scheduledDate}
                  onChange={(e) => setNewPost(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black tracking-wider"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.content.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors tracking-wider uppercase text-sm"
                >
                  Create Post
                </button>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors tracking-wider uppercase text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}