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
    return fetch(`${API_BASE}/api/dashboard/stats`, { headers }).then((r) => r.json());
  },

  // Analytics
  getDetailedAnalytics: () => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/analytics/detailed`, { headers }).then((r) => r.json());
  },

  getChartData: (days: number = 7) => {
    const headers = getAuthHeader();
    return fetch(`${API_BASE}/api/analytics/chart?days=${days}`, { headers }).then((r) => r.json());
  },
};
