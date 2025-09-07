'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Legend, Scatter, Area, AreaChart } from 'recharts';
import { TrendingUp, MessageCircle, Heart, Eye, Clock, Users, Star, Flame, Search, X } from 'lucide-react';
import Fuse from 'fuse.js';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold">{data.fullTitle}</p>  {/* full title */}
          <p>Upvotes: {data.score.toLocaleString()}</p>
          <p>Comments: {data.comments.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };
  
const CustomAreaTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold">{data.fullTitle}</p>
          <p>Upvote Ratio: {(data.ratio * 100).toFixed(1)}%</p>
          <p>Upvotes: {data.score.toLocaleString()}</p>
          <p>Comments: {data.comments.toLocaleString()}</p>
          <p className="text-sm text-blue-600 font-medium mt-1">Click to view post details →</p>
        </div>
      );
    }
    return null;
  };

// Custom X-Axis Tick component for engagement chart
const CustomXAxisTick = ({ x, y, payload }) => {
  const [showFullTitle, setShowFullTitle] = useState(false);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        fontSize="12"
        transform="rotate(-45)"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setShowFullTitle(true)}
        onMouseLeave={() => setShowFullTitle(false)}
      >
        {payload.value}
      </text>
      
      {/* Tooltip for full title */}
      {showFullTitle && (
        <foreignObject x={-100} y={-40} width="200" height="30">
          <div className="bg-black text-white text-xs p-2 rounded shadow-lg max-w-xs break-words">
            {payload.payload?.fullTitle || payload.value}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

const TaylorSwiftDashboard = ({cityred}) => {
  const [activeView, setActiveView] = useState('overview');
  const [redditData, setRedditData] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
//   const [summary, setSummary] = useState(null);
//   const [loadingSummary, setLoadingSummary] = useState(false);

  // 🔹 Fetch live subreddit JSON
  useEffect(() => {
    fetch(`https://www.reddit.com/r/${cityred}/.json`)
      .then(res => res.json())
      .then(data => setRedditData(data))
      .catch(err => console.error('Error fetching Reddit data:', err));
  }, []);

  // Function to handle chart clicks and open Reddit post in modal
  const handleChartClick = (data, event) => {
    // Prevent any default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (data && data.activePayload && data.activePayload[0]) {
      const postData = data.activePayload[0].payload;
      if (postData && postData.permalink) {
        console.log('Opening modal for post:', postData.fullTitle); // Debug log
        setSelectedPost(postData);
        setIsModalOpen(true);
      }
    }
  };

//   const fetchSummary = async (post, comments) => {
//     setLoadingSummary(true);
//     setSummary(null);
//     try {
//       const res = await fetch("/api/summarize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           postTitle: post.fullTitle,
//           comments: comments.slice(0, 50).map(c => c.body) // top 50 comments
//         }),
//       });
//       const data = await res.json();
//       setSummary(data.summary);
//     } catch (err) {
//       console.error("Error summarizing:", err);
//       setSummary("Failed to summarize thread.");
//     } finally {
//       setLoadingSummary(false);
//     }
//   };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    setShowComments(false);
    setComments([]);
  };

  // Function to fetch comments
  const fetchComments = async (permalink) => {
    setLoadingComments(true);
    setShowComments(true);
    try {
      const response = await fetch(`https://www.reddit.com${permalink}.json`);
      const data = await response.json();
      
      // Comments are in the second element of the response array
      const commentsData = data[1]?.data?.children || [];
      
      // Process comments recursively to handle nested replies
      const processComments = (commentsList, depth = 0) => {
        return commentsList.map(comment => {
          if (comment.kind === 't1' && comment.data) { // t1 = comment
            const replies = comment.data.replies && comment.data.replies.data 
              ? processComments(comment.data.replies.data.children, depth + 1) 
              : [];
            
            return {
              id: comment.data.id,
              author: comment.data.author,
              body: comment.data.body,
              score: comment.data.score,
              created_utc: comment.data.created_utc,
              depth: depth,
              replies: replies,
              is_deleted: comment.data.author === '[deleted]' || comment.data.body === '[deleted]'
            };
          }
          return null;
        }).filter(Boolean);
      };
      
      const processedComments = processComments(commentsData);
      setComments(processedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Process the data for visualizations
  const processedData = useMemo(() => {
    if (!redditData) return { engagementData: [], flairData: [], timeData: [], posts: [] };

    const posts = redditData.data.children.map(child => child.data);

    // Subscriber count (from any post, since it's subreddit-wide)
    const subscriberCount = posts.length > 0 ? posts[0].subreddit_subscribers : 0;

    // Engagement metrics
    const engagementData = posts.map(post => ({
      title: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title,
      fullTitle: post.title, // full title for tooltip
      score: post.score,
      comments: post.num_comments,
      ratio: post.upvote_ratio,
      engagement: (post.score + post.num_comments) / 2,
      author: post.author,
      permalink: post.permalink, // Add permalink for clicking
      url: post.url, // Add URL if needed
      selftext: post.selftext, // Post content
      created_utc: post.created_utc, // Creation time
      subreddit: post.subreddit,
      ups: post.ups,
      downs: post.downs || 0,
      is_video: post.is_video, // Video detection
      media: post.media, // Media content
      preview: post.preview, // Preview images
    }));

    // Flair distribution
    const flairCounts = {};
    posts.forEach(post => {
      const flair = post.link_flair_text || 'No Flair';
      flairCounts[flair] = (flairCounts[flair] || 0) + 1;
    });
    
    const getFlairColor = (flair) => {
        const colors = {
          'Megathread ': '#8B5CF6',
          'Theory': '#EF4444',
          'Tour': '#F59E0B',
          'Collection': '#10B981',
          'Discussion': '#3B82F6',
          'No Flair': '#6B7280'
        };
        return colors[flair] || '#6B7280';
      };

    const flairData = Object.entries(flairCounts).map(([name, value]) => ({
      name,
      value,
      color: getFlairColor(name)
    }));

    // Time-based activity
    const timeData = posts.map(post => {
        const dateObj = new Date(post.created_utc * 1000);
        
        return {
            dateTime: dateObj.toLocaleString(),
          score: post.score,
          comments: post.num_comments,
          title: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title
        };
      }).reverse();

    return { engagementData, flairData, timeData, posts, subscriberCount };
  }, [redditData]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString("en-US")}</p>
          {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
    </div>
  );

  const ViewSelector = () => (
    <div className="flex justify-center space-x-2 mb-8">
      {[
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'engagement', label: 'Engagement', icon: Heart },
        // { id: 'activity', label: 'Activity', icon: Clock },
        { id: 'community', label: 'Community', icon: Users }
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveView(id)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
            activeView === id 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-600'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  const totalScore = processedData.posts.reduce((sum, post) => sum + post.score, 0);
  const totalComments = processedData.posts.reduce((sum, post) => sum + post.num_comments, 0);
  const avgRatio = processedData.posts.reduce((sum, post) => sum + post.upvote_ratio, 0) / processedData.posts.length;
  const subscriberCount = processedData.subscriberCount;

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!processedData.engagementData.length) return null;
    
    const options = {
      keys: ['fullTitle', 'author'],
      threshold: 0.3, // Lower = more strict, higher = more fuzzy
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    };
    
    return new Fuse(processedData.engagementData, options);
  }, [processedData.engagementData]);

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim() || !fuse) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const results = fuse.search(query).slice(0, 8); // Limit to 8 results
    setSearchResults(results);
    setShowSearchDropdown(true);
  };

  // Handle search result click
  const handleSearchResultClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // Function to highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="bg-yellow-200 text-yellow-900 font-medium px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Modal component for displaying Reddit post
  const PostModal = ({ post, isOpen, onClose }) => {
    if (!isOpen || !post) return null;

    const formatDate = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleString();
    };

    const formatNumber = (num) => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
      }
      return num.toString();
    };

    // Comment component for rendering individual comments and replies
    const Comment = ({ comment }) => {
      if (!comment || comment.is_deleted) {
        return (
          <div className={`ml-${comment?.depth * 4 || 0} p-3 bg-gray-100 rounded-lg mb-2`}>
            <p className="text-gray-500 italic">[Comment deleted]</p>
          </div>
        );
      }

      return (
        <div className={`${comment.depth > 0 ? `ml-${Math.min(comment.depth * 4, 16)}` : ''} mb-3`}>
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            {/* Comment Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {comment.author.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">u/{comment.author}</span>
                <span className="text-gray-500 text-sm">{formatDate(comment.created_utc)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  comment.score > 0 ? 'bg-green-100 text-green-800' : 
                  comment.score < 0 ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {comment.score > 0 ? '+' : ''}{comment.score}
                </div>
              </div>
            </div>
            
            {/* Comment Body */}
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-2">
              {comment.body}
            </div>
            
            {/* Depth indicator for nested comments */}
            {comment.depth > 0 && (
              <div className="text-xs text-gray-400 mb-2">
                Reply level: {comment.depth}
              </div>
            )}
          </div>
          
          {/* Render replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => (
                <Comment key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[100vh] w-full overflow-hidden transform transition-all duration-300 animate-slideUp"
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{post.fullTitle}</h2>
                <div className="flex items-center space-x-4 text-sm opacity-90">
                  <span>u/{post.author}</span>
                  <span>r/{post.subreddit}</span>
                  <span>{formatDate(post.created_utc)}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-white hover:text-gray-200 text-2xl font-bold transition-colors hover:scale-110"
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* AI Summary Section
        <div className="bg-yellow-50 rounded-lg p-4 shadow-md hover:shadow-lg transition mb-6">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">💡 Community Insights</h3>
            <button
            onClick={() => fetchSummary(post, comments)}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
            disabled={loadingSummary}
            >
            {loadingSummary ? "Summarizing..." : "Summarize Thread"}
            </button>
        </div>
        {summary ? (
            <div className="text-gray-700 space-y-2">
            {summary.split("\n").map((line, i) => (
                <p key={i}>• {line}</p>
            ))}
            </div>
        ) : (
            <p className="text-sm text-gray-500">Click "Summarize Thread" to see highlights.</p>
        )}
        </div> */}
            {!showComments ? (
              /* Original Post Content */
              <div className="p-6">
                {/* Post Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-purple-50 rounded-lg p-3 text-center hover:bg-purple-100 transition-colors">
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(post.score)}</div>
                    <div className="text-sm text-gray-600">Upvotes</div>
                  </div>
                  <div 
                    className="bg-pink-50 rounded-lg p-3 text-center hover:bg-pink-100 transition-colors cursor-pointer transform hover:scale-105"
                    onClick={() => fetchComments(post.permalink)}
                  >
                    <div className="text-2xl font-bold text-pink-600">{formatNumber(post.comments)}</div>
                    <div className="text-sm text-gray-600">Comments</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center hover:bg-green-100 transition-colors">
                    <div className="text-2xl font-bold text-green-600">{(post.ratio * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Upvote Ratio</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center hover:bg-indigo-100 transition-colors">
                    <div className="text-2xl font-bold text-indigo-600">{formatNumber(post.ups)}</div>
                    <div className="text-sm text-gray-600">Total Ups</div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                  {post.selftext ? (
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <h3 className="font-semibold mb-2 text-gray-800">Post Content:</h3>
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {post.selftext}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Image Display - Check if URL is an image */}
                  {post.url && (
                    post.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || 
                    post.url.includes('i.redd.it') || 
                    post.url.includes('i.imgur.com') ||
                    (post.preview && post.preview.images && post.preview.images.length > 0)
                  ) && (
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <h3 className="font-semibold mb-2 text-gray-800">Image:</h3>
                      <div className="flex justify-center">
                        <img 
                          src={post.url}
                          alt={post.title}
                          className="max-w-full max-h-96 object-contain rounded-lg shadow-md hover:shadow-lg transition-shadow"
                          onError={(e) => {
                            // Fallback to preview image if main URL fails
                            if (post.preview && post.preview.images && post.preview.images[0]) {
                              e.target.src = post.preview.images[0].source.url.replace(/&amp;/g, '&');
                            } else {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }
                          }}
                        />
                        <div className="text-center text-gray-500" style={{display: 'none'}}>
                          Image failed to load
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Video/GIF Display for Reddit video posts */}
                  {post.is_video && post.media && post.media.reddit_video && (
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <h3 className="font-semibold mb-2 text-gray-800">Video:</h3>
                      <div className="flex justify-center">
                        <video 
                          controls
                          className="max-w-full max-h-96 rounded-lg shadow-md"
                          poster={post.media.reddit_video.fallback_url?.replace(/DASH_\d+/, 'DASH_96')}
                        >
                          <source src={post.media.reddit_video.fallback_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                  
                  {/* External Link - only show if it's not an image/video we've already displayed */}
                  {post.url && post.url !== `https://www.reddit.com${post.permalink}` && 
                   !post.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) && 
                   !post.url.includes('i.redd.it') && 
                   !post.url.includes('i.imgur.com') &&
                   !post.is_video && (
                    <div className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                      <h3 className="font-semibold mb-2 text-gray-800">External Link:</h3>
                      <a 
                        href={post.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.url}
                      </a>
                    </div>
                  )}
                  
                  {/* Show message only if there's truly no content to display */}
                  {!post.selftext && 
                   !post.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) && 
                   !post.url.includes('i.redd.it') && 
                   !post.url.includes('i.imgur.com') &&
                   !post.is_video &&
                   !(post.preview && post.preview.images && post.preview.images.length > 0) &&
                   (post.url === `https://www.reddit.com${post.permalink}` || !post.url) && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                      This post does not contain displayable content
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Comments Section */
              <div className="p-6">
                {/* Comments Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <MessageCircle className="w-5 h-5 text-pink-500 mr-2" />
                    Comments ({post.comments})
                  </h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    ← Back to Post
                  </button>
                </div>

                {/* Loading State */}
                {loadingComments && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">Loading comments...</span>
                  </div>
                )}

                {/* Comments List */}
                {!loadingComments && (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <Comment key={comment.id} comment={comment} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No comments found or failed to load comments.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Click outside to close or press the × button
            </div>
            <div className="space-x-3">
              <a
                href={`https://www.reddit.com${post.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View on Reddit
              </a>
              <button
                onClick={onClose}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        {/* CSS-in-JS animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[white/30] backdrop-blur-md p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
        <h1 className="text-5xl mt-0 font-bold mb-8 text-center text-[5vw] uppercase tracking-widest text-[#3e4a4c]">
            {"City Happenings".split("").map((char, idx) => (
            <span
                key={idx}
                className="inline-block transition-transform duration-200 hover:scale-150 hover:text-white"
            >
                {char === " " ? "\u00A0" : char}
            </span>
            ))}
        </h1>
        </div>

        <ViewSelector />

        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Subscribers"
                value={subscriberCount || 0}
                icon={Users}
                color="bg-white/10"
                subtitle="Headcount"
              />
              <StatCard 
                title="Total Upvotes"
                value={totalScore}
                icon={Heart}
                color="bg-white/10"
                subtitle="Community love"
              />
              <StatCard 
                title="Total Comments"
                value={totalComments}
                icon={MessageCircle}
                color="bg-white/10"
                subtitle="Discussions"
              />
              <StatCard 
                title="Avg. Positivity"
                value={Math.round(avgRatio * 100)}
                icon={Star}
                color="bg-white/10"
                subtitle="% upvote ratio"
              />
            </div>

            {/* Main Charts */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Flame className="w-5 h-5 text-blue-500 mr-2" />
                Top Posts Engagement
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="title" angle={-30} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <Tooltip
                      content={<CustomTooltip />}
                    formatter={(value, name) => [value.toLocaleString("en-US"), name === 'score' ? 'Upvotes' : 'Comments']}
                    labelStyle={{color: '#374151'}}
                  />
                  <Legend verticalAlign="top" align="right" height={36} />
                  <Bar dataKey="score" fill="#1364E8" radius={4} />
                  <Bar dataKey="comments" fill="#284778" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeView === 'engagement' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="w-5 h-5 text-blue-500 mr-2" />
                Upvote Ratios by Post
                <span className="text-sm font-normal text-blue-500 ml-2">(Click points to view post details)</span>
              </h3>
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="relative">
                  {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                  <input
                    type="text"
                    placeholder=" Search posts by title or author..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchDropdown(true)}
                    className="w-full pl-10 pr-10 py-3 focus:outline-none rounded-lg transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((result, index) => {
                      const post = result.item;
                      const matches = result.matches || [];
                      
                      return (
                        <div
                          key={post.permalink || index}
                          onClick={() => handleSearchResultClick(post)}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1 leading-relaxed">
                                {highlightText(post.fullTitle, searchQuery)}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>by u/{highlightText(post.author, searchQuery)}</span>
                                <span className="flex items-center">
                                  <Heart className="w-3 h-3 mr-1" />
                                  {post.score}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  {post.comments}
                                </span>
                                <span className="text-green-600">
                                  {(post.ratio * 100).toFixed(1)}% upvoted
                                </span>
                              </div>
                              {matches.length > 0 && (
                                <div className="mt-2 text-xs text-blue-600">
                                  Matched: {matches.map(match => match.key).join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="ml-4 text-xs text-gray-400">
                              Score: {(1 - result.score).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* No Results Message */}
                {showSearchDropdown && searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
                    No posts found matching {searchQuery}
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart 
                  data={processedData.engagementData}
                  onClick={handleChartClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    tick={<CustomXAxisTick />}
                    interval={0}
                    height={80}
                  />
                  <YAxis domain={[0.8, 1]} />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="ratio" 
                    stroke="blue" 
                    fill="#6AA0F7" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                    onClick={handleChartClick}
                    style={{ cursor: 'pointer' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
{/* 
        {activeView === 'activity' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Top Contributors</h3>
                <div className="space-y-4">
                  {[...new Set(processedData.posts.map(p => p.author))].map((author, index) => (
                    <div key={author} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${index % 2 === 0 ? 'from-purple-500 to-pink-500' : 'from-pink-500 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm`}>
                          {author.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">u/{author}</span>
                      </div>
                      <div className="text-sm text-purple-600 font-medium">
                        {processedData.posts.filter(p => p.author === author).length} posts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Community Highlights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                    <div className="text-2xl font-bold">{subscriberCount.toLocaleString()}</div>
                    <div className="text-sm opacity-90">Total Members</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-lg">
                    <div className="text-2xl font-bold">{Math.round(avgRatio * 100)}%</div>
                    <div className="text-sm opacity-90">Average Positivity</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg">
                    <div className="text-2xl font-bold">{processedData.posts.length}</div>
                    <div className="text-sm opacity-90">Recent Posts</div>
                  </div>
                </div>
              </div>
            </div>
        )} */}
        
        {activeView === 'community' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-6">Top Contributors</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {[...new Set(processedData.posts.map(p => p.author))].map((author, index) => (
                    <div key={author} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${index % 2 === 0 ? 'from-purple-500 to-blue-500' : 'from-pink-500 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm`}>
                          {author.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">u/{author}</span>
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        {processedData.posts.filter(p => p.author === author).length} posts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Community Highlights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-white-500 text-white rounded-lg">
                    <div className="text-2xl font-bold">{subscriberCount.toLocaleString()}</div>
                    <div className="text-sm opacity-90">Total Members</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-white-500 text-white rounded-lg">
                    <div className="text-2xl font-bold">{Math.round(avgRatio * 100)}%</div>
                    <div className="text-sm opacity-90">Average Positivity</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-white-500 text-white rounded-lg">
                    <div className="text-2xl font-bold">{processedData.posts.length}</div>
                    <div className="text-sm opacity-90">Recent Posts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Post Modal */}
      <PostModal 
        post={selectedPost} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default TaylorSwiftDashboard;

// //perfectly working
// import React, { useState, useMemo, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Legend, Scatter, Area, AreaChart } from 'recharts';
// import { TrendingUp, MessageCircle, Heart, Eye, Clock, Users, Star, Flame } from 'lucide-react';

// const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-bold">{data.fullTitle}</p>  {/* full title */}
//           <p>Upvotes: {data.score.toLocaleString()}</p>
//           <p>Comments: {data.comments.toLocaleString()}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomAreaTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-bold">{data.fullTitle}</p>
//           <p>Upvote Ratio: {(data.ratio * 100).toFixed(1)}%</p>
//           <p>Upvotes: {data.score.toLocaleString()}</p>
//           <p>Comments: {data.comments.toLocaleString()}</p>
//           <p className="text-sm text-purple-600 font-medium mt-1">Click to view post</p>
//         </div>
//       );
//     }
//     return null;
//   };

// const TaylorSwiftDashboard = () => {
//   const [activeView, setActiveView] = useState('overview');
//   const [redditData, setRedditData] = useState(null);

//   // 🔹 Fetch live subreddit JSON
//   useEffect(() => {
//     fetch('https://www.reddit.com/r/Dublin/.json')
//       .then(res => res.json())
//       .then(data => setRedditData(data))
//       .catch(err => console.error('Error fetching Reddit data:', err));
//   }, []);

//   // Function to handle chart clicks and open Reddit post
//   const handleChartClick = (data) => {
//     if (data && data.activePayload && data.activePayload[0]) {
//       const postData = data.activePayload[0].payload;
//       if (postData.permalink) {
//         const fullUrl = `https://www.reddit.com${postData.permalink}`;
//         window.open(fullUrl, '_blank');
//       }
//     }
//   };

//   // Process the data for visualizations
//   const processedData = useMemo(() => {
//     if (!redditData) return { engagementData: [], flairData: [], timeData: [], posts: [] };
//     const posts = redditData.data.children.map(child => child.data);
    
//     // Engagement metrics
//     const engagementData = posts.map(post => ({
//       title: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
//       fullTitle: post.title, // full title for tooltip
//       score: post.score,
//       comments: post.num_comments,
//       ratio: post.upvote_ratio,
//       engagement: (post.score + post.num_comments) / 2,
//       author: post.author,
//       permalink: post.permalink, // Add permalink for clicking
//       url: post.url // Add URL if needed
//     }));

//     // Flair distribution
//     const flairCounts = {};
//     posts.forEach(post => {
//       const flair = post.link_flair_text || 'No Flair';
//       flairCounts[flair] = (flairCounts[flair] || 0) + 1;
//     });
    
//     const getFlairColor = (flair) => {
//         const colors = {
//           'Megathread ': '#8B5CF6',
//           'Theory': '#EF4444',
//           'Tour': '#F59E0B',
//           'Collection': '#10B981',
//           'Discussion': '#3B82F6',
//           'No Flair': '#6B7280'
//         };
//         return colors[flair] || '#6B7280';
//       };

//     const flairData = Object.entries(flairCounts).map(([name, value]) => ({
//       name,
//       value,
//       color: getFlairColor(name)
//     }));

//     // Time-based activity
//     const timeData = posts.map(post => {
//         const dateObj = new Date(post.created_utc * 1000);
        
//         return {
//             dateTime: dateObj.toLocaleString(),
//           score: post.score,
//           comments: post.num_comments,
//           title: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title
//         };
//       }).reverse();

//     return { engagementData, flairData, timeData, posts };
//   }, [redditData]);

//   const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
//     <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm opacity-90 font-medium">{title}</p>
//           <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
//           {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
//         </div>
//         <Icon className="w-8 h-8 opacity-80" />
//       </div>
//     </div>
//   );

//   const ViewSelector = () => (
//     <div className="flex justify-center space-x-2 mb-8">
//       {[
//         { id: 'overview', label: 'Overview', icon: TrendingUp },
//         { id: 'engagement', label: 'Engagement', icon: Heart },
//         { id: 'activity', label: 'Activity', icon: Clock },
//         { id: 'community', label: 'Community', icon: Users }
//       ].map(({ id, label, icon: Icon }) => (
//         <button
//           key={id}
//           onClick={() => setActiveView(id)}
//           className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
//             activeView === id 
//               ? 'bg-purple-600 text-white shadow-lg' 
//               : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600'
//           }`}
//         >
//           <Icon className="w-4 h-4" />
//           <span>{label}</span>
//         </button>
//       ))}
//     </div>
//   );

//   const totalScore = processedData.posts.reduce((sum, post) => sum + post.score, 0);
//   const totalComments = processedData.posts.reduce((sum, post) => sum + post.num_comments, 0);
//   const avgRatio = processedData.posts.reduce((sum, post) => sum + post.upvote_ratio, 0) / processedData.posts.length;
//   const subscriberCount = 3756011;

//   return (
//     <div className="min-h-screen bg-[white/30] backdrop-blur-md p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//             r/TaylorSwift Analytics
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Dive deep into the most devoted fanbase on Reddit with interactive insights and real-time engagement metrics
//           </p>
//         </div>

//         <ViewSelector />

//         {activeView === 'overview' && (
//           <div className="space-y-8">
//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <StatCard 
//                 title="Total Subscribers"
//                 value={subscriberCount}
//                 icon={Users}
//                 color="from-purple-500 to-purple-700"
//                 subtitle="Active Swifties"
//               />
//               <StatCard 
//                 title="Total Upvotes"
//                 value={totalScore}
//                 icon={Heart}
//                 color="from-pink-500 to-pink-700"
//                 subtitle="Community love"
//               />
//               <StatCard 
//                 title="Total Comments"
//                 value={totalComments}
//                 icon={MessageCircle}
//                 color="from-indigo-500 to-indigo-700"
//                 subtitle="Discussions"
//               />
//               <StatCard 
//                 title="Avg. Positivity"
//                 value={Math.round(avgRatio * 100)}
//                 icon={Star}
//                 color="from-amber-500 to-orange-600"
//                 subtitle="% upvote ratio"
//               />
//             </div>

//             {/* Main Charts */}
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Flame className="w-5 h-5 text-red-500 mr-2" />
//                 Top Posts Engagement
//               </h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={processedData.engagementData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="title" angle={-30} textAnchor="end" height={80} fontSize={12} />
//                   <YAxis />
//                   <Tooltip
//                       content={<CustomTooltip />}
//                     formatter={(value, name) => [value.toLocaleString(), name === 'score' ? 'Upvotes' : 'Comments']}
//                     labelStyle={{color: '#374151'}}
//                   />
//                   <Legend verticalAlign="top" align="right" height={36} />
//                   <Bar dataKey="score" fill="#8B5CF6" radius={4} />
//                   <Bar dataKey="comments" fill="#EC4899" radius={4} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {activeView === 'engagement' && (
//           <div className="space-y-8">
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Heart className="w-5 h-5 text-pink-500 mr-2" />
//                 Upvote Ratios by Post
//                 <span className="text-sm font-normal text-gray-500 ml-2">(Click points to view posts)</span>
//               </h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart 
//                   data={processedData.engagementData}
//                   onClick={handleChartClick}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="title" />
//                   <YAxis domain={[0.8, 1]} />
//                   <Tooltip content={<CustomAreaTooltip />} />
//                   <Area 
//                     type="monotone" 
//                     dataKey="ratio" 
//                     stroke="#10B981" 
//                     fill="#10B981" 
//                     fillOpacity={0.3}
//                     strokeWidth={2}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {activeView === 'activity' && (
//           <div className="space-y-8">
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity Timeline</h3>
//               <ResponsiveContainer width="100%" height={400}>
//                 <LineChart data={processedData.timeData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="dateTime" />
//                   <YAxis />
//                   <Tooltip />
//                   <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{fill: '#8B5CF6', r: 6}} />
//                   <Line type="monotone" dataKey="comments" stroke="#EC4899" strokeWidth={3} dot={{fill: '#EC4899', r: 6}} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {activeView === 'community' && (
//           <div className="space-y-8">
//             <div className="grid md:grid-cols-2 gap-8">
//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-6">Top Contributors</h3>
//                 <div className="space-y-4">
//                   {[...new Set(processedData.posts.map(p => p.author))].map((author, index) => (
//                     <div key={author} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
//                       <div className="flex items-center space-x-3">
//                         <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${index % 2 === 0 ? 'from-purple-500 to-pink-500' : 'from-pink-500 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm`}>
//                           {author.charAt(0).toUpperCase()}
//                         </div>
//                         <span className="font-medium text-gray-800">u/{author}</span>
//                       </div>
//                       <div className="text-sm text-purple-600 font-medium">
//                         {processedData.posts.filter(p => p.author === author).length} posts
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-6">Community Highlights</h3>
//                 <div className="space-y-4">
//                   <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
//                     <div className="text-2xl font-bold">{subscriberCount.toLocaleString()}</div>
//                     <div className="text-sm opacity-90">Active Swifties</div>
//                   </div>
//                   <div className="p-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-lg">
//                     <div className="text-2xl font-bold">{Math.round(avgRatio * 100)}%</div>
//                     <div className="text-sm opacity-90">Average Positivity</div>
//                   </div>
//                   <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg">
//                     <div className="text-2xl font-bold">{processedData.posts.length}</div>
//                     <div className="text-sm opacity-90">Recent Posts</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TaylorSwiftDashboard;

// import React, { useState, useMemo, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Legend, Scatter, Area, AreaChart } from 'recharts';
// import { TrendingUp, MessageCircle, Heart, Eye, Clock, Users, Star, Flame } from 'lucide-react';
// // import myJson from '@/app/test-cities/scripts/taylorswift.json'
// // // Sample data based on the provided JSON structure
// // const sampleRedditData = myJson


// const CustomTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-bold">{data.fullTitle}</p>  {/* full title */}
//           <p>Upvotes: {data.score.toLocaleString()}</p>
//           <p>Comments: {data.comments.toLocaleString()}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomAreaTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-bold">{data.fullTitle}</p>
//           <p>Upvote Ratio: {(data.ratio * 100).toFixed(1)}%</p>
//           <p>Upvotes: {data.score.toLocaleString()}</p>
//           <p>Comments: {data.comments.toLocaleString()}</p>
//         </div>
//       );
//     }
//     return null;
//   };

// const TaylorSwiftDashboard = () => {
//   const [activeView, setActiveView] = useState('overview');
//   const [redditData, setRedditData] = useState(null);

//   // 🔹 Fetch live subreddit JSON
//   useEffect(() => {
//     fetch('https://www.reddit.com/r/Dublin/.json')
//       .then(res => res.json())
//       .then(data => setRedditData(data))
//       .catch(err => console.error('Error fetching Reddit data:', err));
//   }, []);

//   // Process the data for visualizations
//   const processedData = useMemo(() => {
//     if (!redditData) return { engagementData: [], flairData: [], timeData: [], posts: [] };
//     const posts = redditData.data.children.map(child => child.data);
    
//     // Engagement metrics
//     const engagementData = posts.map(post => ({
//       title: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
//       fullTitle: post.title, // full title for tooltip
//       score: post.score,
//       comments: post.num_comments,
//       ratio: post.upvote_ratio,
//       engagement: (post.score + post.num_comments) / 2,
//       author: post.author
//     }));

//     // Flair distribution
//     const flairCounts = {};
//     posts.forEach(post => {
//       const flair = post.link_flair_text || 'No Flair';
//       flairCounts[flair] = (flairCounts[flair] || 0) + 1;
//     });
    
//     const getFlairColor = (flair) => {
//         const colors = {
//           'Megathread ': '#8B5CF6',
//           'Theory': '#EF4444',
//           'Tour': '#F59E0B',
//           'Collection': '#10B981',
//           'Discussion': '#3B82F6',
//           'No Flair': '#6B7280'
//         };
//         return colors[flair] || '#6B7280';
//       };

//     const flairData = Object.entries(flairCounts).map(([name, value]) => ({
//       name,
//       value,
//       color: getFlairColor(name)
//     }));

//     // Time-based activity
//     // const timeData = posts.map(post => ({
//     //   dateTime: new Date(post.created_utc * 1000).toLocaleTimeString(),
//     //   score: post.score,
//     //   comments: post.num_comments,
//     //   title: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title
//     // })).reverse();
//     const timeData = posts.map(post => {
//         const dateObj = new Date(post.created_utc * 1000);
        
//         return {
//             dateTime: dateObj.toLocaleString(),
//         //   time: dateObj.toLocaleTimeString(),          // e.g. "3:45:12 PM"
//         //   date: dateObj.toLocaleDateString(),          // e.g. "8/28/2025"
//           score: post.score,
//           comments: post.num_comments,
//           title: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title
//         };
//       }).reverse();

//     return { engagementData, flairData, timeData, posts };
//   }, [redditData]);

//   const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
//     <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm opacity-90 font-medium">{title}</p>
//           <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
//           {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
//         </div>
//         <Icon className="w-8 h-8 opacity-80" />
//       </div>
//     </div>
//   );

//   const ViewSelector = () => (
//     <div className="flex justify-center space-x-2 mb-8">
//       {[
//         { id: 'overview', label: 'Overview', icon: TrendingUp },
//         { id: 'engagement', label: 'Engagement', icon: Heart },
//         { id: 'activity', label: 'Activity', icon: Clock },
//         { id: 'community', label: 'Community', icon: Users }
//       ].map(({ id, label, icon: Icon }) => (
//         <button
//           key={id}
//           onClick={() => setActiveView(id)}
//           className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
//             activeView === id 
//               ? 'bg-purple-600 text-white shadow-lg' 
//               : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600'
//           }`}
//         >
//           <Icon className="w-4 h-4" />
//           <span>{label}</span>
//         </button>
//       ))}
//     </div>
//   );

//   const totalScore = processedData.posts.reduce((sum, post) => sum + post.score, 0);
//   const totalComments = processedData.posts.reduce((sum, post) => sum + post.num_comments, 0);
//   const avgRatio = processedData.posts.reduce((sum, post) => sum + post.upvote_ratio, 0) / processedData.posts.length;
//   const subscriberCount = 3756011;

//   return (
//     <div className="min-h-screen bg-[white/30] backdrop-blur-md p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//             r/TaylorSwift Analytics
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Dive deep into the most devoted fanbase on Reddit with interactive insights and real-time engagement metrics
//           </p>
//         </div>

//         <ViewSelector />

//         {activeView === 'overview' && (
//           <div className="space-y-8">
//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <StatCard 
//                 title="Total Subscribers"
//                 value={subscriberCount}
//                 icon={Users}
//                 color="from-purple-500 to-purple-700"
//                 subtitle="Active Swifties"
//               />
//               <StatCard 
//                 title="Total Upvotes"
//                 value={totalScore}
//                 icon={Heart}
//                 color="from-pink-500 to-pink-700"
//                 subtitle="Community love"
//               />
//               <StatCard 
//                 title="Total Comments"
//                 value={totalComments}
//                 icon={MessageCircle}
//                 color="from-indigo-500 to-indigo-700"
//                 subtitle="Discussions"
//               />
//               <StatCard 
//                 title="Avg. Positivity"
//                 value={Math.round(avgRatio * 100)}
//                 icon={Star}
//                 color="from-amber-500 to-orange-600"
//                 subtitle="% upvote ratio"
//               />
//             </div>

//             {/* Main Charts */}
//             {/* <div className="grid lg:grid-cols-2 gap-8"> */}
//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Flame className="w-5 h-5 text-red-500 mr-2" />
//                   Top Posts Engagement
//                 </h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={processedData.engagementData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis dataKey="title" angle={-30} textAnchor="end" height={80} fontSize={12} />
//                     <YAxis />
//                     <Tooltip
//                         content={<CustomTooltip />}
//                       formatter={(value, name) => [value.toLocaleString(), name === 'score' ? 'Upvotes' : 'Comments']}
//                       labelStyle={{color: '#374151'}}
//                     />
//                     {/* ✅ Add Legend here */}
//                     <Legend verticalAlign="top" align="right" height={36} />
//                     <Bar dataKey="score" fill="#8B5CF6" radius={4} />
//                     <Bar dataKey="comments" fill="#EC4899" radius={4} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               {/* <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Star className="w-5 h-5 text-yellow-500 mr-2" />
//                   Post Categories
//                 </h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={processedData.flairData}
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="value"
//                       label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                     >
//                       {processedData.flairData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div> */}
//             </div>
//         //   </div>
//         )}

//         {activeView === 'engagement' && (
//           <div className="space-y-8">
//             {/* <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-xl font-bold text-gray-800 mb-4">Engagement vs Comments Analysis</h3>
//               <ResponsiveContainer width="100%" height={400}>
//                 <ScatterChart>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="score" name="Upvotes" />
//                   <YAxis dataKey="comments" name="Comments" />
//                   <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
//                   <Scatter data={processedData.engagementData} fill="#8B5CF6" />
//                 </ScatterChart>
//               </ResponsiveContainer>
//             </div> */}

//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-xl font-bold text-gray-800 mb-4">Upvote Ratios by Post</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={processedData.engagementData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="title" />
//                   <YAxis domain={[0.8, 1]} />
//                   {/* <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Upvote Ratio']} /> */}
//                   <Tooltip content={<CustomAreaTooltip />} />  {/* <-- custom tooltip */}
//                   <Area type="monotone" dataKey="ratio" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {activeView === 'activity' && (
//           <div className="space-y-8">
//             <div className="bg-white rounded-2xl p-6 shadow-lg">
//               <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity Timeline</h3>
//               <ResponsiveContainer width="100%" height={400}>
//                 <LineChart data={processedData.timeData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="dateTime" />
//                   <YAxis />
//                   <Tooltip />
//                   <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{fill: '#8B5CF6', r: 6}} />
//                   <Line type="monotone" dataKey="comments" stroke="#EC4899" strokeWidth={3} dot={{fill: '#EC4899', r: 6}} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {activeView === 'community' && (
//           <div className="space-y-8">
//             <div className="grid md:grid-cols-2 gap-8">
//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-6">Top Contributors</h3>
//                 <div className="space-y-4">
//                   {[...new Set(processedData.posts.map(p => p.author))].map((author, index) => (
//                     <div key={author} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
//                       <div className="flex items-center space-x-3">
//                         <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${index % 2 === 0 ? 'from-purple-500 to-pink-500' : 'from-pink-500 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm`}>
//                           {author.charAt(0).toUpperCase()}
//                         </div>
//                         <span className="font-medium text-gray-800">u/{author}</span>
//                       </div>
//                       <div className="text-sm text-purple-600 font-medium">
//                         {processedData.posts.filter(p => p.author === author).length} posts
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl p-6 shadow-lg">
//                 <h3 className="text-xl font-bold text-gray-800 mb-6">Community Highlights</h3>
//                 <div className="space-y-4">
//                   <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
//                     <div className="text-2xl font-bold">{subscriberCount.toLocaleString()}</div>
//                     <div className="text-sm opacity-90">Active Swifties</div>
//                   </div>
//                   <div className="p-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-lg">
//                     <div className="text-2xl font-bold">{Math.round(avgRatio * 100)}%</div>
//                     <div className="text-sm opacity-90">Average Positivity</div>
//                   </div>
//                   <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg">
//                     <div className="text-2xl font-bold">{processedData.posts.length}</div>
//                     <div className="text-sm opacity-90">Recent Posts</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TaylorSwiftDashboard;
