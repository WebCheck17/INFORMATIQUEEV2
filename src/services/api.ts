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

  const config: RequestInit = {
    method: options?.method || 'GET',
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.headers) {
    const additionalHeaders = options.headers as Record<string, string>;
    Object.assign(headers, additionalHeaders);
  }

  config.headers = headers;

  if (options?.body && config.method !== 'GET') {
    config.body = options.body;
  }

  const response = await fetch(url, config);
  return handleResponse<T>(response);
}

export const api = {
  login: (username: string, password: string) => 
    fetchAPI<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: any) => 
    fetchAPI<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => 
    fetchAPI<any>('/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),

  getUsers: () => fetchAPI<any[]>('/users'),

  getUserCount: async () => {
    const users = await fetchAPI<any[]>('/users');
    return users.length;
  },

  getUserById: (id: number) => fetchAPI<any>(`/users/${id}`),

  updateUser: (id: string | number, data: any) =>
    fetchAPI<any>(`/users/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify(data),
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    return fetch(`${API_BASE}/users/avatar`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` 
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json().catch(() => ({ error: 'Unknown error' }));
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }
      return data as { avatarPath: string; avatarUrl: string };
    });
  },

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

  getNotifications: () => 
    fetchAPI<any[]>('/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),

  getSettings: () => fetchAPI<any>('/settings'),

  updateSettings: (data: any) => 
    fetchAPI<any>('/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify(data),
    }),

  getActivityLogs: () => 
    fetchAPI<any[]>('/activity-logs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),
};

export default api;
