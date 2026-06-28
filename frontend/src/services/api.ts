const API_BASE = 'https://informatiquee.ct.ws/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({ error: 'Unknown error' }));
  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }
  return data;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = { method: options?.method || 'GET' };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options?.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }
  config.headers = headers;

  if (options?.body && config.method !== 'GET') {
    config.body = options.body;
  }

  const response = await fetch(url, config);
  return handleResponse<T>(response);
}

export const api = {
  // Auth
  login: (username: string, password: string) => 
    fetchAPI<{ token: string; user: any }>('/auth.php?path=login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (data: any) => 
    fetchAPI<any>('/auth.php?path=register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => 
    fetchAPI<any>('/auth.php?path=me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),

  // Users
  getUsers: () => fetchAPI<any[]>('/users.php'),

  getUserCount: async () => {
    const users = await fetchAPI<any[]>('/users.php');
    return users.length;
  },

  getUserById: (id: number) => fetchAPI<any>(`/users.php?path=single&id=${id}`),

  updateUser: (id: string | number, data: any) =>
    fetchAPI<any>(`/users.php?path=update&id=${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify(data),
    }),

  // Posts
  getPosts: () => fetchAPI<any[]>('/posts.php'),

  getPostBySlug: (slug: string) => fetchAPI<any>(`/posts.php?path=single&slug=${slug}`),

  createPost: (data: any) => 
    fetchAPI<any>('/posts.php?path=create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
      body: JSON.stringify(data),
    }),

  likePost: (id: number) => 
    fetchAPI<{ liked: boolean }>(`/posts.php?path=like&id=${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('kelashub_token') || ''}` },
    }),

  // Placeholder endpoints (return mock data for now)
  getDeadlines: () => Promise.resolve([]),
  getDeadlineBySlug: (slug: string) => Promise.resolve({}),
  createDeadline: (data: any) => Promise.resolve({}),
  updateDeadlineStatus: (id: number, status: string) => Promise.resolve({}),
  getChatRooms: () => Promise.resolve([]),
  getChatRoomById: (id: number) => Promise.resolve({}),
  getRoomMessages: (id: number) => Promise.resolve([]),
  sendMessage: (roomId: number, content: string, messageType?: string) => Promise.resolve({}),
  pinMessage: (messageId: number) => Promise.resolve({}),
  getNotifications: () => Promise.resolve([]),
  getSettings: () => Promise.resolve({}),
  updateSettings: (data: any) => Promise.resolve({}),
  getActivityLogs: () => Promise.resolve([]),
};

export default api;
