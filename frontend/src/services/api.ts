// services/api.ts
const API_BASE = 'https://informatiquee-backend.vercel.app/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({ error: 'Unknown error' }));
  
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }
  
  return data;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  // Build config properly - jangan spread sembarangan
  const config: RequestInit = {
    method: options?.method || 'GET',
  };

  // Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (options?.headers) {
    const additionalHeaders = options.headers as Record<string, string>;
    Object.assign(headers, additionalHeaders);
  }
  
  config.headers = headers;

  // Body - hanya untuk method selain GET
  if (options?.body && config.method !== 'GET') {
    config.body = options.body;
  }

  console.log("API REQUEST:", {
    url,
    method: config.method,
    body: config.body ? JSON.parse(config.body as string) : undefined
  });

  const response = await fetch(url, config);
  
  console.log("API RESPONSE:", {
    status: response.status,
    statusText: response.statusText
  });

  return handleResponse<T>(response);
}

// API Endpoints
export const api = {
  // Auth
  login: (username: string, password: string) => {
    return fetchAPI<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  
  register: (data: any) => 
    fetchAPI<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getMe: () => 
    fetchAPI<any>('/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),

  // Users
  getUsers: () => fetchAPI<any[]>('/users'),
  
  getUserCount: async () => {
    const users = await fetchAPI<any[]>('/users');
    return users.length;
  },
  
  getUserById: (id: number) => fetchAPI<any>(`/users/${id}`),

  // Posts (Memories)
  getPosts: () => fetchAPI<any[]>('/posts'),
  
  getPostBySlug: (slug: string) => fetchAPI<any>(`/posts/${slug}`),
  
  createPost: (data: any) => 
    fetchAPI<any>('/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify(data),
    }),
  
  likePost: (id: number) => 
    fetchAPI<{ liked: boolean }>(`/posts/${id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),
  
  getPostComments: (id: number) => fetchAPI<any[]>(`/posts/${id}/comments`),

  // Deadlines (Assignments)
  getDeadlines: () => fetchAPI<any[]>('/deadlines'),
  
  getDeadlineBySlug: (slug: string) => fetchAPI<any>(`/deadlines/${slug}`),
  
  createDeadline: (data: any) => 
    fetchAPI<any>('/deadlines', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify(data),
    }),
  
  updateDeadlineStatus: (id: number, status: string) => 
    fetchAPI<any>(`/deadlines/${id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify({ status }),
    }),

  // Chat
  getChatRooms: () => fetchAPI<any[]>('/chat/rooms'),
  
  getChatRoomById: (id: number) => fetchAPI<any>(`/chat/rooms/${id}`),
  
  getRoomMessages: (id: number) => fetchAPI<any[]>(`/chat/rooms/${id}/messages`),
  
  sendMessage: (roomId: number, content: string, messageType?: string) => 
    fetchAPI<any>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify({ 
        content, 
        message_type: messageType || 'text' 
      }),
    }),
  
  pinMessage: (messageId: number) => 
    fetchAPI<any>(`/chat/messages/${messageId}/pin`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),

  // Notifications
  getNotifications: () => 
    fetchAPI<any[]>('/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),

  // Settings
  getSettings: () => fetchAPI<any>('/settings'),
  
  updateSettings: (data: any) => 
    fetchAPI<any>('/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify(data),
    }),

  // Activity Logs
  getActivityLogs: () => 
    fetchAPI<any[]>('/activity-logs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),
};

export default api;
