const API_BASE = "";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("stack_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  signup: (email: string, password: string, displayName: string) =>
    fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    }).then((r) => r.json()),

  login: (email: string, password: string) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),

  // User
  getProfile: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/user/profile`, { headers }).then((r) => r.json());
  },

  updateProfile: (data: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/user/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },

  // Blogs
  getBlogs: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/user/blogs`, { headers }).then((r) => r.json());
  },

  getBlog: (blogId: string) =>
    fetch(`${API_BASE}/api/blogs/${blogId}`).then((r) => r.json()),

  createBlog: (data: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },

  updateBlog: (blogId: string, data: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/blogs/${blogId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },

  deleteBlog: (blogId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/blogs/${blogId}`, {
      method: "DELETE",
      headers,
    }).then((r) => r.json());
  },

  // Articles
  getArticles: (blogId: string) =>
    fetch(`${API_BASE}/api/blogs/${blogId}/articles`).then((r) => r.json()),

  getArticlesByBlogAdmin: (blogId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/blogs/${blogId}/articles/admin`, { headers }).then((r) => r.json());
  },

  getArticle: (articleId: string) =>
    fetch(`${API_BASE}/api/articles/${articleId}`).then((r) => r.json()),

  createArticle: (data: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },

  updateArticle: (articleId: string, data: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  },

  deleteArticle: (articleId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/articles/${articleId}`, {
      method: "DELETE",
      headers,
    }).then((r) => r.json());
  },

  // Analytics
  recordEvent: (articleId: string, eventType: string, data: any) =>
    fetch(`${API_BASE}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, eventType, ...data }),
    }).then((r) => r.json()),

  getArticleStats: (articleId: string) =>
    fetch(`${API_BASE}/api/articles/${articleId}/stats`).then((r) => r.json()),

  getBlogStats: (blogId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/blogs/${blogId}/stats`, { headers }).then((r) => r.json());
  },

  // Dashboard
  getDashboardStats: () => {
    const headers = getAuthHeader();
    const timestamp = Date.now();  // Cache buster
    return fetch(`${API_BASE}/api/dashboard/stats?t=${timestamp}`, { headers })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      });
  },

  // Analytics
  getDetailedAnalytics: () => {
    const headers = getAuthHeader();
    const timestamp = Date.now();
    return fetch(`${API_BASE}/api/analytics/detailed?t=${timestamp}`, { headers }).then((r) => r.json());
  },

  getChartData: (days: number = 7) => {
    const headers = getAuthHeader();
    const timestamp = Date.now();
    return fetch(`${API_BASE}/api/analytics/chart?days=${days}&t=${timestamp}`, { headers }).then((r) => r.json());
  },

  // Demo
  getDemo: () =>
    fetch(`${API_BASE}/api/auth/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.json()),

  // AI Writing
  generateBlogContent: (prompt: string, type: "full" | "section" | "outline" | "title" | "tags" | "meta") => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ prompt, type }),
    }).then((r) => r.json());
  },

  // Chat
  saveChatMessage: (role: string, message: string, generationType?: string, topic?: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ role, message, generationType, topic }),
    }).then((r) => r.json());
  },

  getChatHistory: (limit: number = 50) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/chat/history?limit=${limit}`, { headers }).then((r) => r.json());
  },

  // Content Brainstorm
  brainstormContentIdeas: (niche: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/ai/brainstorm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ niche }),
    }).then((r) => r.json());
  },

  // Comments
  createComment: (articleId: string, authorName: string, authorEmail: string, content: string) =>
    fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, authorName, authorEmail, content }),
    }).then((r) => r.json()),

  getCommentsByArticle: (articleId: string) =>
    fetch(`${API_BASE}/api/comments/article/${articleId}`).then((r) => r.json()),

  getCommentsByBlog: (blogId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/comments/blog/${blogId}`, { headers }).then((r) => r.json());
  },

  updateCommentStatus: (commentId: string, status: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ status }),
    }).then((r) => r.json());
  },

  deleteComment: (commentId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/comments/${commentId}`, {
      method: "DELETE",
      headers,
    }).then((r) => r.json());
  },

  // Reading History & Personalization
  recordReadingHistory: (articleId: string, readingTimeSeconds: number, scrollDepth: number) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/reading-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ articleId, readingTimeSeconds, scrollDepth }),
    }).then((r) => r.json());
  },

  getPersonalizedFeed: (limit: number = 20) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/feed/personalized?limit=${limit}`, { headers }).then((r) => r.json());
  },

  getUserPreferences: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/user/preferences`, { headers }).then((r) => r.json());
  },

  updateUserPreferences: (preferences: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/user/preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(preferences),
    }).then((r) => r.json());
  },

  // Achievements
  getAllAchievements: () =>
    fetch(`${API_BASE}/api/achievements`).then((r) => r.json()),

  getUserAchievements: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/achievements/user`, { headers }).then((r) => r.json());
  },

  getStreak: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/user/streak`, { headers }).then((r) => r.json());
  },

  checkAchievements: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/achievements/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
    }).then((r) => r.json());
  },

  initAchievements: () =>
    fetch(`${API_BASE}/api/achievements/init`).then((r) => r.json()),

  // Plagiarism Checker
  checkPlagiarism: (articleId: string, content: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/plagiarism/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ articleId, content }),
    }).then((r) => r.json());
  },

  getPlagiarismHistory: (articleId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/plagiarism/${articleId}`, { headers }).then((r) => r.json());
  },

  getLatestPlagiarismCheck: (articleId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/plagiarism/${articleId}/latest`, { headers }).then((r) => r.json());
  },

  // Feedback
  submitFeedback: (feedback: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(feedback),
    }).then((r) => r.json());
  },

  getFeedback: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/feedback`, { headers }).then((r) => r.json());
  },

  // Bookmarks
  getBookmarks: (collection?: string) => {
    const headers = getAuthHeader();
    const url = collection ? `${API_BASE}/api/bookmarks?collection=${collection}` : `${API_BASE}/api/bookmarks`;
    return fetch(url, { headers }).then((r) => r.json());
  },

  addBookmark: (bookmarkData: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(bookmarkData),
    }).then((r) => r.json());
  },

  removeBookmark: (bookmarkId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/bookmarks/${bookmarkId}`, {
      method: "DELETE",
      headers,
    }).then((r) => r.json());
  },

  // Notifications
  getNotifications: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/notifications`, { headers }).then((r) => r.json());
  },

  getNotificationPreferences: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/notification-preferences`, { headers }).then((r) => r.json());
  },

  updateNotificationPreferences: (preferences: any) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/notification-preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(preferences),
    }).then((r) => r.json());
  },

  // Learning Path
  getLearningProgress: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/learning/progress`, { headers }).then((r) => r.json());
  },

  initLearning: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/learning/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
    }).then((r) => r.json());
  },

  completeLesson: (lessonId: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/learning/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ lessonId }),
    }).then((r) => r.json());
  },

  // Article Scheduling
  scheduleArticle: (articleId: string, scheduledPublishAt: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/articles/${articleId}/schedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ scheduledPublishAt, status: "scheduled" }),
    }).then((r) => r.json());
  },

  getScheduledArticles: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/articles/scheduled`, { headers }).then((r) => r.json());
  },

  // Trending Articles
  getTrendingArticles: (days: number = 7) => {
    return fetch(`${API_BASE}/api/articles/trending?days=${days}`).then((r) => r.json());
  },

  // Enhanced Bookmarks
  updateBookmark: (bookmarkId: string, notes: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/bookmarks/${bookmarkId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ notes }),
    }).then((r) => r.json());
  },

  // Email Notifications
  sendCommentNotification: (commentId: string, articleId: string, authorName: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/notifications/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ commentId, articleId, authorName, type: "new_comment" }),
    }).then((r) => r.json());
  },

  sendMentionNotification: (userId: string, articleId: string, mentionerName: string) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/notifications/send-mention`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ userId, articleId, mentionerName }),
    }).then((r) => r.json());
  },
};
