// types.ts - Versi Final yang Konsisten

export interface UserProfile {
  id: string | number;
  username: string;
  name: string;
  nim?: string;
  kelas?: string;
  jurusan?: string;
  bio?: string;
  email?: string;
  role: string;         // "admin" | "member" (backend role)
  jabatan?: string;     // "Ketua Kelas" | "Wakil Ketua" | "Sekretaris" | dll
  photoUrl?: string;    // resolved URL (deprecated, use getAvatarUrl)
  avatar?: string;      // path relatif dari backend (e.g. "bootcamp-1.jpeg")
  gender?: string;      // "male" | "female"
  dateJoined?: string;
  isActive?: boolean;
  streakDays?: number;
  hasCheckedIn?: boolean;
  bgColor?: string;
  initials?: string;
}

export interface StudentFriend {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  status: string;
  isOnline: boolean;
}

// ========== COMMENTS ==========
export interface CommentReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  time: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  time: string;
  replies?: CommentReply[];
}

// ========== MEMORIES / GALLERY ==========
export interface ClassPhotoMemory {
  id: string | number;
  title: string;
  caption?: string;  // alias untuk title
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  category?: string;
  tags?: string[];
  date: string;
  uploaderName?: string;
  authorName?: string;  // alias untuk uploaderName
  authorAvatar?: string;
  likes?: number;
  likesCount?: number;  // alias untuk likes
  hasLiked?: boolean;
  views?: number;
  isPinned?: boolean;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  comments?: Comment[];
  commentsCount?: number;
}

// ========== ASSIGNMENTS / DEADLINES ==========
export interface DosenAssignment {
  id: string | number;
  subject?: string;      // alias untuk course
  course?: string;       // dari backend
  lecturer?: string;     // alias untuk dosen
  dosen?: string;        // dari backend
  title: string;
  description?: string;
  dueDate?: string;      // alias untuk deadline
  deadline?: string;     // dari backend
  status?: string;
  priority?: string;
  attachment?: {
    name: string;
    size: string;
    url: string;
  };
  notes?: string;
}

// ========== CHAT ==========
export interface ChatMessage {
  id: string;
  roomId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isPinned?: boolean;
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
  file?: {
    name: string;
    size: string;
    type: "image" | "video" | "pdf" | "docx" | "ppt" | "zip" | "code" | "other";
    url: string;
  };
}

export interface ChatRoom {
  id: string | number;
  name: string;
  category?: string;
  description?: string;
  isPrivate?: boolean;
  messageCount?: number;
  createdByName?: string;
}

// ========== NOTIFICATIONS ==========
export interface ClassNotification {
  id: string;
  type: "like" | "comment" | "reply" | "deadline" | "mention" | "upload" | "room";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

// ========== ACTIVITY LOGS ==========
export interface ActivityLog {
  id: string;
  username: string;
  action: "Login" | "Logout" | "Upload" | "Download" | "Like" | "Comment" | "Chat" | "Edit" | "Delete" | "Admin Action";
  details: string;
  timestamp: string;
}

// ========== SETTINGS ==========
export interface WebsiteSettings {
  websiteName: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string;
  isDarkMode: boolean;
  allowRegister: boolean;
  maxUploadSize: number;
  className: string;
  semester: string;
  allowGuestAccess: boolean;
}

// ========== FILES ==========
export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  owner: string;
  url: string;
}
