export interface UserProfile {
  id: string;
  username: string;
  name: string;
  nim: string;
  kelas: string;
  jurusan: string;
  bio: string;
  email: string;
  role: "Admin" | "Member" | "Guest";
  photoUrl: string;
  dateJoined: string;
  isActive: boolean;
  streakDays: number;
  hasCheckedIn: boolean;
  bgColor?: string; // Optional color for avatar
  initials?: string; // Optional initials
}

export interface StudentFriend {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  status: string;
  isOnline: boolean;
}

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

export interface ClassPhotoMemory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string; // Optional support for video upload
  category: string; // "Kuliah" | "Makrab" | "Wisuda" | "Santai" | "Project"
  tags: string[];
  date: string;
  uploaderName: string;
  likes: number;
  hasLiked: boolean;
  views: number;
  isPinned?: boolean;
  isFeatured?: boolean;
  comments: Comment[];
  isBookmarked?: boolean;
}

export interface DosenAssignment {
  id: string;
  subject: string; // Mata Kuliah
  lecturer: string; // Nama Dosen
  title: string; // Detail tugas
  description: string;
  dueDate: string; // Tanggal pengumpulan (ISO or readable string)
  status: "Belum" | "Selesai";
  priority: "Tinggi" | "Sedang" | "Biasa";
  attachment?: {
    name: string;
    size: string;
    url: string;
  };
  notes?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  senderRole: string;
  text: string;
  timestamp: string; // e.g. "10:12 WIB"
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
  id: string;
  name: string;
  category: string;
  description: string;
  isPrivate: boolean;
}

export interface ClassNotification {
  id: string;
  type: "like" | "comment" | "reply" | "deadline" | "mention" | "upload" | "room";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export interface ActivityLog {
  id: string;
  username: string;
  action: "Login" | "Logout" | "Upload" | "Download" | "Like" | "Comment" | "Chat" | "Edit" | "Delete" | "Admin Action";
  details: string;
  timestamp: string;
}

export interface WebsiteSettings {
  websiteName: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string; // e.g. "indigo" | "violet" | "cyan"
  isDarkMode: boolean;
  allowRegister: boolean;
  maxUploadSize: number; // in MB
  className: string;
  semester: string;
  allowGuestAccess: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  owner: string;
  url: string;
}
