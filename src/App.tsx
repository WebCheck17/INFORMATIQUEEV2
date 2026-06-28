import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  INITIAL_USERS, 
  INITIAL_ROOMS, 
  INITIAL_MEMORIES, 
  INITIAL_ASSIGNMENTS,
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_FILES,
  INITIAL_LOGS
} from "./data";
import { 
  UserProfile, 
  ClassPhotoMemory, 
  ChatMessage, 
  DosenAssignment, 
  StudentFriend, 
  ChatRoom, 
  ClassNotification, 
  ActivityLog, 
  WebsiteSettings, 
  UploadedFile 
} from "./types";

import Header from "./components/Header";
import ClassMembersSidebar from "./components/ClassMembersSidebar";
import ClassLinksSidebar from "./components/ClassLinksSidebar";
import ProfileModal from "./components/ProfileModal";
import LandingSection from "./components/LandingSection";
import MemoriesSection from "./components/MemoriesSection";
import ChatroomSection from "./components/ChatroomSection";
import AssignmentsSection from "./components/AssignmentsSection";
import AdminDashboard from "./components/AdminDashboard";
import AuthSection from "./components/AuthSection";

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

const USE_BACKEND = true;
const API_BASE = "http://localhost:3001/api";

// Helper API fetch dengan token
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("kelashub_token");
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
  
  return res.json();
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Dialog / Overlays state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error"; id: number } | null>(null);

  // --- Local Storage Core States ---
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("kelashub_current_user");
    return saved ? JSON.parse(saved) : INITIAL_USERS[1];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("kelashub_is_logged_in");
    return saved ? JSON.parse(saved) === true : true;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    if (!USE_BACKEND) {
      const saved = localStorage.getItem("kelashub_users_list");
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    }
    return [];
  });

  const [friends, setFriends] = useState<StudentFriend[]>(() => {
    const saved = localStorage.getItem("kelashub_friends");
    if (saved) return JSON.parse(saved);
    return INITIAL_USERS.map((u) => ({
      id: u.id,
      name: u.name,
      initials: u.initials || u.name.substring(0,2).toUpperCase(),
      avatarColor: u.bgColor || "#6BCB77",
      status: u.bio || "Hadir & siap belajar! ✨",
      isOnline: u.isActive,
    }));
  });

  const [memories, setMemories] = useState<ClassPhotoMemory[]>(() => {
    const saved = localStorage.getItem("kelashub_memories");
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  const [assignments, setAssignments] = useState<DosenAssignment[]>(() => {
    const saved = localStorage.getItem("kelashub_assignments");
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("kelashub_chat_messages");
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem("kelashub_rooms");
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem("kelashub_uploaded_files");
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("kelashub_activity_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem("kelashub_website_settings");
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [notifications, setNotifications] = useState<ClassNotification[]>(() => {
    const saved = localStorage.getItem("kelashub_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // --- Fetch dari Backend (hanya kalo logged in & ada token) ---
  useEffect(() => {
    if (!USE_BACKEND || !isLoggedIn) return;
    
    const token = localStorage.getItem("kelashub_token");
    if (!token) return; // Jangan fetch kalo gak ada token
    
    apiFetch("/users")
      .then(data => setUsersList(data))
      .catch(err => {
        console.error("Fetch users error:", err);
        setUsersList(INITIAL_USERS);
      });
  }, [USE_BACKEND, isLoggedIn]); // <-- depend on isLoggedIn, bukan cuma USE_BACKEND

  // --- Sync State Updates to Local Storage ---
  useEffect(() => {
    localStorage.setItem("kelashub_current_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("kelashub_is_logged_in", JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("kelashub_users_list", JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem("kelashub_friends", JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem("kelashub_memories", JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem("kelashub_assignments", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem("kelashub_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("kelashub_rooms", JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem("kelashub_uploaded_files", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  useEffect(() => {
    localStorage.setItem("kelashub_activity_logs", JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem("kelashub_website_settings", JSON.stringify(websiteSettings));
  }, [websiteSettings]);

  useEffect(() => {
    localStorage.setItem("kelashub_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // --- Handlers & Core Callbacks ---

  const handleToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now();
    setToast({ message, type, id });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleTriggerNotification = (
    type: "like" | "comment" | "reply" | "deadline" | "mention" | "upload" | "room",
    title: string,
    message: string
  ) => {
    const newNotif: ClassNotification = {
      id: "n_" + Date.now().toString(),
      type,
      title,
      message,
      time: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAddLog = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: "log_" + Date.now().toString(),
      username: isLoggedIn ? currentUser.username : "guest",
      action: action as any,
      details,
      timestamp: new Date().toISOString()
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    
    localStorage.setItem("kelashub_current_user", JSON.stringify(user));
    localStorage.setItem("kelashub_is_logged_in", "true");
    
    handleAddLog("Login", `Masuk sebagai: ${user.name} (${user.role})`);
    
    setFriends((prev) => 
      prev.map(f => f.id === user.id ? { ...f, isOnline: true, status: "Hadir & aktif di portal! 🚀" } : f)
    );
  };

  const handleLogout = () => {
    handleAddLog("Logout", `Keluar dari sistem: ${currentUser.name}`);
    setIsLoggedIn(false);
    
    // Hapus token
    localStorage.removeItem("kelashub_token");
    
    const guestUser: UserProfile = {
      id: "guest",
      username: "guest",
      name: "Tamu (Guest)",
      nim: "-",
      kelas: "15.5A.02",
      jurusan: "Teknik Informatika",
      bio: "Menjelajahi KelasHub secara terbatas.",
      email: "guest@kelashub.ac.id",
      role: "Guest",
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      dateJoined: new Date().toISOString().split("T")[0],
      isActive: true,
      streakDays: 0,
      hasCheckedIn: false,
      bgColor: "#94a3b8",
      initials: "G"
    };
    setCurrentUser(guestUser);
    handleToast("Anda berhasil logout. Sekarang dalam mode Tamu.", "info");
  };

  const handleAddFile = (newFile: UploadedFile) => {
    setUploadedFiles((prev) => [newFile, ...prev]);
    handleAddLog("Upload", `Mengunggah file: ${newFile.name} (${newFile.size})`);
  };

  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const handleRegister = (newUser: UserProfile) => {
    setUsersList((prev) => [...prev, newUser]);
    const newFriend: StudentFriend = {
      id: newUser.id,
      name: newUser.name,
      initials: newUser.initials || newUser.name.substring(0,2).toUpperCase(),
      avatarColor: newUser.bgColor || "#4D96FF",
      status: "Baru bergabung di KelasHub! 👋",
      isOnline: true
    };
    setFriends((prev) => [...prev, newFriend]);
    handleAddLog("Admin Action", `Pendaftaran akun member baru: ${newUser.name}`);
  };

  const handleCheckIn = () => {
    if (currentUser.role === "Guest") {
      handleToast("Harap login terlebih dahulu untuk absen!", "info");
      return;
    }
    if (!currentUser.hasCheckedIn) {
      const updated = {
        ...currentUser,
        streakDays: (currentUser.streakDays || 0) + 1,
        hasCheckedIn: true
      };
      setCurrentUser(updated);
      setUsersList((prev) => prev.map(u => u.username === currentUser.username ? updated : u));
      setFriends((prev) => prev.map(f => f.name === currentUser.name ? { ...f, isOnline: true, status: "Sudah absen & siap kuliah! 📚" } : f));
      handleToast("Absensi berhasil terekam! Streak hari bertambah! 🔥", "success");
      handleAddLog("Login", `Absen harian selesai. Streak: ${updated.streakDays} hari.`);
    }
  };

  const handleToggleOnline = (id: string) => {
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const state = !f.isOnline;
          return {
            ...f,
            isOnline: state,
            status: state ? "Hadir kembali! ⚡" : "Offline / Sibuk 📴"
          };
        }
        return f;
      })
    );
  };

  const handleAddFriend = (name: string) => {
    const colors = ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D", "#9b5de5", "#f15bb5"];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    const friend: StudentFriend = {
      id: "f_" + Date.now(),
      name,
      initials: initials || "MA",
      avatarColor: col,
      status: "Mahasiswa baru join portal kelas! 👋",
      isOnline: true
    };
    setFriends((prev) => [...prev, friend]);
    handleAddLog("Admin Action", `Menambah mahasiswa baru: ${name}`);
  };

  const handleSaveProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsersList((prev) => prev.map(u => u.username === currentUser.username ? updated : u));
    handleToast("Profil Anda berhasil disinkronisasi!", "success");
    handleAddLog("Edit", "Mengubah informasi profil mahasiswa.");
  };

  const handleSendMessage = (roomId: string, text: string, file?: any, replyToId?: string) => {
    if (currentUser.role === "Guest") {
      handleToast("Tolong login terlebih dahulu untuk berkirim chat!", "info");
      return;
    }

    let replyData: Partial<ChatMessage> = {};
    if (replyToId) {
      const parent = chatMessages.find(m => m.id === replyToId);
      if (parent) {
        replyData = {
          replyToId,
          replyToText: parent.text,
          replyToSender: parent.senderName
        };
      }
    }

    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      roomId,
      senderName: currentUser.name,
      senderUsername: currentUser.username,
      senderAvatar: currentUser.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      senderRole: currentUser.role === "Admin" ? "Admin" : currentUser.name === "Gita Lestari" ? "Bendahara" : currentUser.name === "Sarah Amanda" ? "Sekretaris" : "Warga Kelas",
      text,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      file,
      ...replyData
    };

    setChatMessages((prev) => [...prev, newMsg]);
    handleAddLog("Chat", `Kirim pesan di room: ${roomId}`);

    if (text.includes("@")) {
      const match = text.match(/@(\w+)/);
      const nameMentioned = match ? match[1] : "";
      if (nameMentioned) {
        handleTriggerNotification(
          "mention",
          "Anda disebut dalam Chat",
          `${currentUser.name} me-mention Anda di room chat: "${text.substring(0, 30)}"`
        );
      }
    }

    setTimeout(() => {
      const activeClassmates = friends.filter(f => f.isOnline && f.name !== currentUser.name);
      if (activeClassmates.length === 0) return;

      const responder = activeClassmates[Math.floor(Math.random() * activeClassmates.length)];
      
      const slangs = [
        "Wkwkwk betul bgt weey! 😂",
        "Keren, makasih infonya ya kawan-kawan! 👍",
        "E-commerce gw masih bug di bagian API Checkout hiks",
        "Btw jangan lupa bayar kas guys nanti Gita nagih galak wkwk.",
        "Gas lah nanti nugas bareng di perpus ya jam 1!",
        "Aduh deadline tugas mepet banget, pusing pala upin ipin 😭",
        "Revisi terooss! Semangat pejuang S.Kom!",
        "Ada yang punya link zoom dospem ga ya manteman?"
      ];

      const responderMsg: ChatMessage = {
        id: "msg_auto_" + Date.now(),
        roomId,
        senderName: responder.name,
        senderUsername: responder.name.replace(" ", "_").toLowerCase(),
        senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        senderRole: responder.name === "Gita Lestari" ? "Bendahara" : responder.name === "Sarah Amanda" ? "Sekretaris" : "Warga Kelas",
        text: slangs[Math.floor(Math.random() * slangs.length)],
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
      };

      setChatMessages((prev) => [...prev, responderMsg]);
    }, 2200);
  };

  const isChatPage = location.pathname === "/chat";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans tracking-normal antialiased pb-12">
      <div className={`${isChatPage ? "max-w-[1600px] w-full mx-auto px-2 md:px-4" : "max-w-5xl mx-auto px-4 md:px-6"} pt-20`}>
        
        <Header
          user={currentUser}
          isLoggedIn={isLoggedIn}
          onOpenProfile={() => {
            if (currentUser.role === "Guest") {
              handleToast("Harap login terlebih dahulu untuk melihat profil!", "info");
              setIsAuthModalOpen(true);
            } else {
              setIsProfileOpen(true);
            }
          }}
          onLogout={handleLogout}
          notifications={notifications}
          onClearNotification={handleClearNotification}
          onOpenLogin={() => setIsAuthModalOpen(true)}
        />

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
            >
              <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-premium backdrop-blur-md ${
                toast.type === "success" 
                  ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" 
                  : toast.type === "error" 
                    ? "bg-rose-50/90 border-rose-200 text-rose-800" 
                    : "bg-indigo-50/90 border-indigo-200 text-indigo-800"
              }`}>
                {toast.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : toast.type === "error" ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold leading-normal">{toast.message}</p>
                </div>
                <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAuthModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="absolute right-6 top-6 z-50 p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
                <AuthSection
                  onLogin={handleLogin}
                  onEnterAsGuest={() => {
                    setIsLoggedIn(false);
                    const guestUser: UserProfile = {
                      id: "guest",
                      username: "guest",
                      name: "Tamu (Guest)",
                      nim: "-",
                      kelas: "15.5A.02",
                      jurusan: "Teknik Informatika",
                      bio: "Menjelajahi KelasHub secara terbatas.",
                      email: "guest@kelashub.ac.id",
                      role: "Guest",
                      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                      dateJoined: new Date().toISOString().split("T")[0],
                      isActive: true,
                      streakDays: 0,
                      hasCheckedIn: false,
                      bgColor: "#94a3b8",
                      initials: "G"
                    };
                    setCurrentUser(guestUser);
                    setIsAuthModalOpen(false);
                    handleToast("Masuk sebagai Tamu (Guest view)!", "info");
                  }}
                  users={usersList}
                  onRegister={handleRegister}
                  onToast={handleToast}
                  apiMode={USE_BACKEND}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                >
                  <LandingSection
                    memories={memories}
                    assignments={assignments}
                    rooms={rooms}
                    userCount={usersList.length}
                    onNavigateToTab={(tab) => {
                      if (tab === "memories") navigate("/kelas");
                      else if (tab === "assignments") navigate("/tugas");
                      else if (tab === "profile") setIsProfileOpen(true);
                    }}
                    onOpenLogin={() => setIsAuthModalOpen(true)}
                    isLoggedIn={isLoggedIn && currentUser.role !== "Guest"}
                  />
                </motion.div>
              }
            />

            <Route 
              path="/kelas" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <div className="col-span-12 lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
                    <ClassMembersSidebar
                      friends={friends}
                      onAddFriend={handleAddFriend}
                      onToggleOnline={handleToggleOnline}
                      user={currentUser}
                      onCheckIn={handleCheckIn}
                      onToast={handleToast}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
                    <MemoriesSection
                      memories={memories}
                      currentUser={currentUser}
                      onUpdateMemories={setMemories}
                      onAddLog={handleAddLog}
                      onToast={handleToast}
                      onTriggerNotification={handleTriggerNotification}
                    />
                  </div>
                </motion.div>
              }
            />

            <Route 
              path="/chat" 
              element={
                isLoggedIn && currentUser.role !== "Guest" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.15 }}
                    className="w-full"
                  >
                    <ChatroomSection
                      chatMessages={chatMessages}
                      rooms={rooms}
                      currentUser={currentUser}
                      friendsList={friends}
                      onSendMessage={handleSendMessage}
                      onUpdateChats={setChatMessages}
                      onAddLog={handleAddLog}
                      onToast={handleToast}
                      onTriggerNotification={handleTriggerNotification}
                      onAddFile={handleAddFile}
                    />
                  </motion.div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route 
              path="/tugas" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <div className="col-span-12 lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
                    <ClassLinksSidebar user={currentUser} />
                  </div>
                  <div className="col-span-12 lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
                    <AssignmentsSection
                      assignments={assignments}
                      currentUser={currentUser}
                      onUpdateAssignments={setAssignments}
                      onAddLog={handleAddLog}
                      onToast={handleToast}
                      onTriggerNotification={handleTriggerNotification}
                    />
                  </div>
                </motion.div>
              }
            />

            <Route 
              path="/admin" 
              element={
                isLoggedIn && currentUser.role === "Admin" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AdminDashboard
                      currentUser={currentUser}
                      usersList={usersList}
                      memories={memories}
                      assignments={assignments}
                      rooms={rooms}
                      uploadedFiles={uploadedFiles}
                      activityLogs={activityLogs}
                      websiteSettings={websiteSettings}
                      onUpdateUsers={setUsersList}
                      onUpdateMemories={setMemories}
                      onUpdateAssignments={setAssignments}
                      onUpdateRooms={setRooms}
                      onUpdateFiles={setUploadedFiles}
                      onUpdateSettings={setWebsiteSettings}
                      onAddLog={handleAddLog}
                      onToast={handleToast}
                    />
                  </motion.div>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>

        <AnimatePresence>
          {isProfileOpen && (
            <ProfileModal
              user={currentUser}
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              onSave={handleSaveProfile}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}