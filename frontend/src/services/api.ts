// services/api.ts
const API_BASE = 'https://informatiquee-backend.vercel.app/api';

// Helper untuk handle response
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({ error: 'Unknown error' }));
  
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }
  
  return data;
}

// Fetch dengan error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  // Hanya tambahin body kalo ada dan method bukan GET
  if (options?.body && config.method !== 'GET') {
    config.body = options.body;
  }

  console.log("FETCH CONFIG:", { url, ...config, body: config.body ? JSON.parse(config.body as string) : undefined });

  const response = await fetch(url, config);
  
  const data = await response.json().catch(() => ({ error: 'Unknown error' }));
  
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }
  
  return data;
}

// Auth
login: (username: string, password: string) => {
  const payload = JSON.stringify({ username, password });
  console.log("LOGIN PAYLOAD:", payload);
  
  return fetchAPI<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: payload,
  });
},

// Auth helper - ambil token dari localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API Endpoints
export const api = {
  // ========== AUTH ==========
  login: (email: string, password: string) => 
    fetchAPI<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (data: any) => 
    fetchAPI<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getMe: () => 
    fetchAPI<any>('/auth/me', {
      headers: getAuthHeaders(),
    }),

  // ========== USERS ==========
  getUsers: () => fetchAPI<any[]>('/users'),
  
  getUserCount: async () => {
    const users = await fetchAPI<any[]>('/users');
    return users.length;
  },
  
  getUserById: (id: number) => fetchAPI<any>(`/users/${id}`),

  // ========== POSTS (MEMORIES) ==========
  getPosts: () => fetchAPI<any[]>('/posts'),
  
  getPostBySlug: (slug: string) => fetchAPI<any>(`/posts/${slug}`),
  
  createPost: (data: any) => 
    fetchAPI<any>('/posts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  
  likePost: (id: number) => 
    fetchAPI<{ liked: boolean }>(`/posts/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }),
  
  getPostComments: (id: number) => fetchAPI<any[]>(`/posts/${id}/comments`),

  // ========== DEADLINES (ASSIGNMENTS) ==========
  getDeadlines: () => fetchAPI<any[]>('/deadlines'),
  
  getDeadlineBySlug: (slug: string) => fetchAPI<any>(`/deadlines/${slug}`),
  
  createDeadline: (data: any) => 
    fetchAPI<any>('/deadlines', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),
  
  updateDeadlineStatus: (id: number, status: string) => 
    fetchAPI<any>(`/deadlines/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }),

  // ========== CHAT ==========
  getChatRooms: () => fetchAPI<any[]>('/chat/rooms'),
  
  getChatRoomById: (id: number) => fetchAPI<any>(`/chat/rooms/${id}`),
  
  getRoomMessages: (id: number) => fetchAPI<any[]>(`/chat/rooms/${id}/messages`),
  
  sendMessage: (roomId: number, content: string, messageType?: string) => 
    fetchAPI<any>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        content, 
        message_type: messageType || 'text' 
      }),
    }),
  
  pinMessage: (messageId: number) => 
    fetchAPI<any>(`/chat/messages/${messageId}/pin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    }),

  // ========== NOTIFICATIONS ==========
  getNotifications: () => 
    fetchAPI<any[]>('/notifications', {
      headers: getAuthHeaders(),
    }),

  // ========== SETTINGS ==========
  getSettings: () => fetchAPI<any>('/settings'),
  
  updateSettings: (data: any) => 
    fetchAPI<any>('/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }),

  // ========== ACTIVITY LOGS ==========
  getActivityLogs: () => 
    fetchAPI<any[]>('/activity-logs', {
      headers: getAuthHeaders(),
    }),
};
// Tambahin di api.ts:

// ========== AUTH ==========
login: (username: string, password: string) => 
  fetchAPI<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),

register: (data: {
  name: string;
  username: string;
  email: string;
  gender: string;
  nim: string;
  password: string;
  kelas: string;
  jurusan: string;
}) => 
  fetchAPI<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

export default api;
