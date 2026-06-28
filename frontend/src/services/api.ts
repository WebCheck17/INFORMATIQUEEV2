// services/api.ts
const API_BASE = 'https://informatiquee-backend.vercel.app/api';

// Helper untuk handle response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Fetch dengan error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// API Endpoints
export const api = {
  // Users
  getUsers: () => fetchAPI<any[]>('/users'),
  getUserCount: async () => {
    const users = await fetchAPI<any[]>('/users');
    return users.length;
  },
  
  // Posts (Memories)
  getPosts: () => fetchAPI<any[]>('/posts'),
  
  // Deadlines (Assignments)
  getDeadlines: () => fetchAPI<any[]>('/deadlines'),
  
  // Chat Rooms
  getChatRooms: () => fetchAPI<any[]>('/chat/rooms'),
};

export default api;
