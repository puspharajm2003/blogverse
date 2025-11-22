const API_BASE = "";

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
  getProfile: (token: string) =>
    fetch(`${API_BASE}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  updateProfile: (token: string, data: any) =>
    fetch(`${API_BASE}/api/user/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Blogs
  getBlogs: (token: string) =>
    fetch(`${API_BASE}/api/user/blogs`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getBlog: (blogId: string) =>
    fetch(`${API_BASE}/api/blogs/${blogId}`).then((r) => r.json()),

  createBlog: (token: string, data: any) =>
    fetch(`${API_BASE}/api/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateBlog: (token: string, blogId: string, data: any) =>
    fetch(`${API_BASE}/api/blogs/${blogId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteBlog: (token: string, blogId: string) =>
    fetch(`${API_BASE}/api/blogs/${blogId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  // Articles
  getArticles: (blogId: string) =>
    fetch(`${API_BASE}/api/blogs/${blogId}/articles`).then((r) => r.json()),

  getArticlesByBlogAdmin: (token: string, blogId: string) =>
    fetch(`${API_BASE}/api/blogs/${blogId}/articles/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getArticle: (articleId: string) =>
    fetch(`${API_BASE}/api/articles/${articleId}`).then((r) => r.json()),

  createArticle: (token: string, data: any) =>
    fetch(`${API_BASE}/api/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateArticle: (token: string, articleId: string, data: any) =>
    fetch(`${API_BASE}/api/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteArticle: (token: string, articleId: string) =>
    fetch(`${API_BASE}/api/articles/${articleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  // Analytics
  recordEvent: (articleId: string, eventType: string, data: any) =>
    fetch(`${API_BASE}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, eventType, ...data }),
    }).then((r) => r.json()),

  getArticleStats: (articleId: string) =>
    fetch(`${API_BASE}/api/articles/${articleId}/stats`).then((r) => r.json()),

  getBlogStats: (token: string, blogId: string) =>
    fetch(`${API_BASE}/api/blogs/${blogId}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
};
