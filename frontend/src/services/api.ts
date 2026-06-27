// src/services/api.ts
const API_BASE = "https://informatiquee.loca.lt"; // Nanti ganti ke backend

// Helper fetch dengan auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("kelashub_token");
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Auth
export const apiAuth = {
  login: (email: string, password: string) =>
    fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  register: (data: any) =>
    fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  me: () => fetchWithAuth("/auth/me"),
};

// Users
export const apiUsers = {
  getAll: () => fetchWithAuth("/users"),
  getById: (id: number) => fetchWithAuth(`/users/${id}`),
  update: (id: number, data: any) =>
    fetchWithAuth(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Posts (Memories/Galeri)
export const apiPosts = {
  getAll: () => fetchWithAuth("/posts"),
  getById: (id: number) => fetchWithAuth(`/posts/${id}`),
  create: (data: any) =>
    fetchWithAuth("/posts", { method: "POST", body: JSON.stringify(data) }),
  like: (postId: number) =>
    fetchWithAuth(`/posts/${postId}/like`, { method: "POST" }),
  comment: (postId: number, content: string) =>
    fetchWithAuth(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

// Deadlines (Assignments)
export const apiDeadlines = {
  getAll: () => fetchWithAuth("/deadlines"),
  getById: (id: number) => fetchWithAuth(`/deadlines/${id}`),
  create: (data: any) =>
    fetchWithAuth("/deadlines", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    fetchWithAuth(`/deadlines/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    fetchWithAuth(`/deadlines/${id}`, { method: "DELETE" }),
};

// Chat
export const apiChat = {
  getRooms: () => fetchWithAuth("/chat/rooms"),
  getMessages: (roomId: number) => fetchWithAuth(`/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: number, content: string, file?: File) => {
    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("file", file);
    return fetchWithAuth(`/chat/rooms/${roomId}/messages`, {
      method: "POST",
      body: formData,
      headers: {}, // FormData set Content-Type sendiri
    });
  },
};

// Notifications
export const apiNotifications = {
  getAll: () => fetchWithAuth("/notifications"),
  markRead: (id: number) =>
    fetchWithAuth(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () =>
    fetchWithAuth("/notifications/read-all", { method: "PUT" }),
};

// Settings
export const apiSettings = {
  getAll: () => fetchWithAuth("/settings"),
  update: (key: string, value: string) =>
    fetchWithAuth(`/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
};