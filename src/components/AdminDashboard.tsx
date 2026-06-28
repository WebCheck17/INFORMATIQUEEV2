import React, { useState } from "react";
import { UserProfile, ClassPhotoMemory, DosenAssignment, ChatRoom, UploadedFile, ActivityLog, WebsiteSettings } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Users, 
  Image as ImageIcon, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  FileText, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit, 
  Sliders, 
  Download, 
  CheckCircle, 
  XCircle,
  Eye,
  Lock,
  Globe,
  Bell
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: UserProfile;
  usersList: UserProfile[];
  memories: ClassPhotoMemory[];
  assignments: DosenAssignment[];
  rooms: ChatRoom[];
  uploadedFiles: UploadedFile[];
  activityLogs: ActivityLog[];
  websiteSettings: WebsiteSettings;
  onUpdateUsers: (users: UserProfile[]) => void;
  onUpdateMemories: (mems: ClassPhotoMemory[]) => void;
  onUpdateAssignments: (asgs: DosenAssignment[]) => void;
  onUpdateRooms: (rms: ChatRoom[]) => void;
  onUpdateFiles: (files: UploadedFile[]) => void;
  onUpdateSettings: (settings: WebsiteSettings) => void;
  onAddLog: (action: string, details: string) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function AdminDashboard({
  currentUser,
  usersList,
  memories,
  assignments,
  rooms,
  uploadedFiles,
  activityLogs,
  websiteSettings,
  onUpdateUsers,
  onUpdateMemories,
  onUpdateAssignments,
  onUpdateRooms,
  onUpdateFiles,
  onUpdateSettings,
  onAddLog,
  onToast
}: AdminDashboardProps) {

  const [activeTab, setActiveTab] = useState<"stats" | "users" | "memories" | "assignments" | "rooms" | "files" | "settings" | "logs">("stats");

  // Local CRUD Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formUserName, setFormUserName] = useState("");
  const [formUserRole, setFormUserRole] = useState<"Admin" | "Member" | "Guest">("Member");
  const [formUserEmail, setFormUserEmail] = useState("");

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null);
  const [formRoomName, setFormRoomName] = useState("");
  const [formRoomDesc, setFormRoomDesc] = useState("");
  const [formRoomPrivate, setFormRoomPrivate] = useState(false);

  // Stats computation
  const activeDeadlinesCount = assignments.filter(a => a.status === "Belum").length;
  const completedDeadlinesCount = assignments.filter(a => a.status === "Selesai").length;

  const barchartData = [
    { name: "Galeri", jumlah: memories.length },
    { name: "Tugas Aktif", jumlah: activeDeadlinesCount },
    { name: "Selesai", jumlah: completedDeadlinesCount },
    { name: "Saluran Chat", jumlah: rooms.length },
    { name: "File Arsip", jumlah: uploadedFiles.length }
  ];

  const piechartData = [
    { name: "Admin", value: usersList.filter(u => u.role === "Admin").length, color: "#f43f5e" },
    { name: "Member", value: usersList.filter(u => u.role === "Member").length, color: "#6366f1" },
    { name: "Guest", value: usersList.filter(u => u.role === "Guest").length, color: "#10b981" }
  ];

  // User Management
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserName.trim()) return;

    if (editingUser) {
      const updated = usersList.map(u => {
        if (u.username === editingUser.username) {
          onToast(`Profil ${u.name} berhasil diperbarui admin!`, "success");
          return { ...u, name: formUserName.trim(), role: formUserRole, email: formUserEmail.trim() };
        }
        return u;
      });
      onUpdateUsers(updated);
      onAddLog("Admin Action", `Mengedit user: ${formUserName}`);
    } else {
      const newUser: UserProfile = {
        id: "u_" + Date.now().toString(),
        name: formUserName.trim(),
        username: "user_" + Date.now(),
        nim: "2201010" + Math.floor(10 + Math.random() * 89),
        kelas: "15.5A.02",
        jurusan: "Teknik Informatika",
        bio: "Mahasiswa baru di KelasHub.",
        email: formUserEmail.trim(),
        role: formUserRole,
        photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        dateJoined: new Date().toISOString().split("T")[0],
        isActive: true,
        streakDays: 0,
        hasCheckedIn: false,
        initials: formUserName.charAt(0).toUpperCase(),
        bgColor: "#" + Math.floor(Math.random()*16777215).toString(16)
      };
      onUpdateUsers([...usersList, newUser]);
      onToast("User baru berhasil ditambahkan!", "success");
      onAddLog("Admin Action", `Menambah user baru: ${newUser.name}`);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (username: string, name: string) => {
    if (username === currentUser.username) {
      onToast("Anda tidak bisa menghapus akun Anda sendiri!", "error");
      return;
    }
    const updated = usersList.filter(u => u.username !== username);
    onUpdateUsers(updated);
    onToast(`User ${name} berhasil dihapus!`, "success");
    onAddLog("Admin Action", `Menghapus user: ${name}`);
  };

  // Rooms Management
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoomName.trim()) return;

    if (editingRoom) {
      const updated = rooms.map(r => {
        if (r.id === editingRoom.id) {
          return { ...r, name: formRoomName.trim(), description: formRoomDesc.trim(), isPrivate: formRoomPrivate };
        }
        return r;
      });
      onUpdateRooms(updated);
      onToast("Kanal chat berhasil diperbarui!", "success");
    } else {
      const newRoom: ChatRoom = {
        id: "room_" + Date.now(),
        name: "# " + formRoomName.trim(),
        category: "UMUM",
        description: formRoomDesc.trim(),
        isPrivate: formRoomPrivate
      };
      onUpdateRooms([...rooms, newRoom]);
      onToast("Saluran obrolan baru dirilis!", "success");
      onAddLog("Admin Action", `Membuat channel: ${newRoom.name}`);
    }
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (id: string, name: string) => {
    if (id === "room_general" || id === "room_rpl") {
      onToast("Saluran utama bawaan sistem tidak boleh dihapus!", "error");
      return;
    }
    const updated = rooms.filter(r => r.id !== id);
    onUpdateRooms(updated);
    onToast(`Channel ${name} berhasil dihapus!`, "success");
    onAddLog("Admin Action", `Menghapus channel: ${name}`);
  };

  // Website Global Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ ...websiteSettings });
    onToast("Konfigurasi website berhasil disimpan!", "success");
    onAddLog("Admin Action", "Memperbarui konfigurasi sistem KelasHub.");
  };

  // Delete inappropriate memories
  const handleForceDeleteMemory = (id: string, title: string) => {
    const updated = memories.filter(m => m.id !== id);
    onUpdateMemories(updated);
    onToast(`Post "${title}" dihapus paksa oleh Admin!`, "success");
    onAddLog("Admin Action", `Menghapus paksa galeri: ${title}`);
  };

  // Delete uploaded file
  const handleDeleteFile = (id: string, name: string) => {
    const updated = uploadedFiles.filter(f => f.id !== id);
    onUpdateFiles(updated);
    onToast(`File "${name}" berhasil dibersihkan dari server!`, "success");
    onAddLog("Admin Action", `Menghapus file arsip: ${name}`);
  };

  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-premium overflow-hidden max-w-5xl mx-auto py-4">
      
      {/* Dashboard Top Title Banner */}
      <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div className="space-y-1">
          <span className="text-[9.5px] bg-red-500 font-extrabold text-white px-2 py-0.5 rounded tracking-widest uppercase">
            Sistem Keamanan Admin
          </span>
          <h2 className="text-xl md:text-2xl font-display font-extrabold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Panel Konsol Kontrol KelasHub
          </h2>
          <p className="text-[10px] text-slate-400">
            Selamat datang, <strong>{currentUser.name}</strong>. Kendalikan seluruh otorisasi user, moderator konten galeri foto, kelola deadline tugas, chat channel, serta audit log sistem secara tersentralisasi.
          </p>
        </div>

        {/* Quick Back Indicator */}
        <span className="text-[10.5px] bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-bold font-mono">
          SEMESTER: {websiteSettings.semester}
        </span>
      </div>

      {/* Dashboard Grid Navigation Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
        
        {/* Left Hand Navigation Sidebar (3 columns) */}
        <div className="md:col-span-3 flex flex-col gap-1.5 bg-white p-3 rounded-2xl border border-slate-200">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-2 mb-2">Pilih Menu Panel</p>
          
          <button
            onClick={() => setActiveTab("stats")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "stats" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BarChart className="w-4 h-4" /> Statistik Server
          </button>
          
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "users" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Users className="w-4 h-4" /> Anggota Kelas
          </button>
          
          <button
            onClick={() => setActiveTab("memories")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "memories" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Moderator Galeri
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "assignments" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Deadline Tugas
          </button>

          <button
            onClick={() => setActiveTab("rooms")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "rooms" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Kanal Saluran
          </button>

          <button
            onClick={() => setActiveTab("files")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "files" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-4 h-4" /> File Manager
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "settings" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4" /> Konfigurasi Portal
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "logs" ? "bg-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Sliders className="w-4 h-4" /> Audit Log Sistem
          </button>
        </div>

        {/* Right Hand Control Console (9 columns) */}
        <div className="md:col-span-9 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: SERVER & DATABASE STATS */}
            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Laporan Statistik & Grafik Penggunaan</h3>
                  <p className="text-[10.5px] text-slate-400">Ikhtisar real-time aktivitas data yang tersimpan dalam database local storage KelasHub.</p>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-left">
                    <span className="text-[9px] text-rose-500 font-bold uppercase block">Warga Terdaftar</span>
                    <span className="text-xl font-extrabold text-rose-700 font-mono block mt-1">{usersList.length}</span>
                  </div>
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-left">
                    <span className="text-[9px] text-indigo-500 font-bold uppercase block">Foto Kebersamaan</span>
                    <span className="text-xl font-extrabold text-indigo-700 font-mono block mt-1">{memories.length}</span>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-left">
                    <span className="text-[9px] text-emerald-500 font-bold uppercase block">Tugas Aktif</span>
                    <span className="text-xl font-extrabold text-emerald-700 font-mono block mt-1">{activeDeadlinesCount}</span>
                  </div>
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-left">
                    <span className="text-[9px] text-amber-500 font-bold uppercase block">Berkas Diunggah</span>
                    <span className="text-xl font-extrabold text-amber-700 font-mono block mt-1">{uploadedFiles.length}</span>
                  </div>
                </div>

                {/* Graph Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  
                  {/* Bar Chart */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <h4 className="text-xs font-bold text-slate-700 mb-3 text-left">Distribusi Konten Database</h4>
                    <div className="h-48 text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barchartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="jumlah" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart Roles */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center">
                    <h4 className="text-xs font-bold text-slate-700 mb-3 text-left w-full">Pembagian Peran Pengguna (Role Privilege)</h4>
                    <div className="h-40 w-full text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={piechartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {piechartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold mt-2">
                      {piechartData.map(p => (
                        <span key={p.name} className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name}: {p.value}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: USER PRIVILEGE MANAGEMENT */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Manajemen Pengguna & Otoritas</h3>
                    <p className="text-[10.5px] text-slate-400">Atur hak akses Administrator, Anggota Kelas, dan Guest secara instan.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setFormUserName("");
                      setFormUserRole("Member");
                      setFormUserEmail("");
                      setIsUserModalOpen(true);
                    }}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-extrabold font-sans text-[10px]">
                        <th className="p-3">Warga Kelas</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Otorisasi</th>
                        <th className="p-3">Keaktifan</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map(u => (
                        <tr key={u.username} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{u.name}</td>
                          <td className="p-3 text-slate-500 font-mono">{u.username}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              u.role === "Admin" ? "bg-rose-100 text-rose-700" : u.role === "Member" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{u.streakDays} Hari Streak</td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setFormUserName(u.name);
                                setFormUserRole(u.role);
                                setFormUserEmail(u.email || "");
                                setIsUserModalOpen(true);
                              }}
                              className="text-cyan-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.username, u.name)}
                              className="text-red-500 hover:underline"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 3: GALLERY MEMORY MODERATOR */}
            {activeTab === "memories" && (
              <motion.div
                key="memories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Moderator Kebersamaan & Postingan</h3>
                  <p className="text-[10.5px] text-slate-400">Periksa konten, tag, filter kategori, serta hapus postingan yang melanggar aturan kesopanan kampus.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memories.map(m => (
                    <div key={m.id} className="p-3 rounded-xl border border-slate-200 flex gap-3 items-center justify-between">
                      <div className="flex items-center gap-3 truncate">
                        <img src={m.imageUrl} alt={m.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="truncate text-left">
                          <p className="font-bold text-slate-800 truncate text-xs">{m.title}</p>
                          <p className="text-[10px] text-indigo-600 font-semibold uppercase">{m.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleForceDeleteMemory(m.id, m.title)}
                        className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg shrink-0 cursor-pointer"
                        title="Hapus paksa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 4: ASSIGNMENTS OVERVIEW (Simple admin triggers) */}
            {activeTab === "assignments" && (
              <motion.div
                key="assignments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Manajemen Penjadwalan Tugas & Kuis</h3>
                  <p className="text-[10.5px] text-slate-400">Kelola dan tinjau status penyelesaian tugas dari setiap mata kuliah.</p>
                </div>

                <div className="space-y-3">
                  {assignments.map(a => (
                    <div key={a.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-extrabold uppercase">{a.subject}</span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{a.title}</h4>
                        <p className="text-[9.5px] text-slate-400">Dosen: {a.lecturer} • Deadline: {new Date(a.dueDate).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          a.status === "Selesai" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 5: CHAT ROOMS CONFIG */}
            {activeTab === "rooms" && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Konfigurasi Kanal & Saluran Diskusi</h3>
                    <p className="text-[10.5px] text-slate-400">Tambah kanal chat khusus praktikum, materi, atau rapat internal angkatan.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingRoom(null);
                      setFormRoomName("");
                      setFormRoomDesc("");
                      setFormRoomPrivate(false);
                      setIsRoomModalOpen(true);
                    }}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Channel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map(r => (
                    <div key={r.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between bg-white">
                      <div>
                        <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                          <span>{r.name}</span>
                          {r.isPrivate && <Lock className="w-3 h-3 text-slate-400" />}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{r.description}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingRoom(r);
                            setFormRoomName(r.name.replace("# ", ""));
                            setFormRoomDesc(r.description || "");
                            setFormRoomPrivate(r.isPrivate || false);
                            setIsRoomModalOpen(true);
                          }}
                          className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.id, r.name)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 6: GLOBAL FILE MANAGER */}
            {activeTab === "files" && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Penyimpanan Berkas (Shared File Manager)</h3>
                  <p className="text-[10.5px] text-slate-400">Daftar lampiran materi kuliah yang diunggah oleh warga kelas di forum chat atau form tugas.</p>
                </div>

                {uploadedFiles.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">Belum ada file yang diupload mahasiswa.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-extrabold text-[10px]">
                          <th className="p-3">Nama Berkas</th>
                          <th className="p-3">Tipe</th>
                          <th className="p-3">Ukuran</th>
                          <th className="p-3">Uploader</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {uploadedFiles.map(f => (
                          <tr key={f.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-indigo-600 truncate max-w-[150px]">{f.name}</td>
                            <td className="p-3 font-mono uppercase">{f.type}</td>
                            <td className="p-3 font-mono">{f.size}</td>
                            <td className="p-3 text-slate-500">{f.owner}</td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  onToast(`Mengunduh berkas: ${f.name}`, "success");
                                  onAddLog("Download", `Mengunduh berkas ${f.name}`);
                                }}
                                className="text-emerald-600 hover:underline"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => handleDeleteFile(f.id, f.name)}
                                className="text-red-500 hover:underline"
                              >
                                Bersihkan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 7: GLOBAL WEBSITE CONFIGURATION */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Opsi Konfigurasi Portal Global</h3>
                  <p className="text-[10.5px] text-slate-400">Atur parameter dasar aplikasi kelas, semester berjalan, dsb.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Portal Kelas</label>
                      <input
                        type="text"
                        value={websiteSettings.className}
                        onChange={(e) => onUpdateSettings({ ...websiteSettings, className: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Semester Berjalan</label>
                      <input
                        type="text"
                        value={websiteSettings.semester}
                        onChange={(e) => onUpdateSettings({ ...websiteSettings, semester: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Status Akses Tamu (Guest)</label>
                      <select
                        value={websiteSettings.allowGuestAccess ? "true" : "false"}
                        onChange={(e) => onUpdateSettings({ ...websiteSettings, allowGuestAccess: e.target.value === "true" })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                      >
                        <option value="true">Bolehkan Baca Konten Terbatas</option>
                        <option value="false">Kunci Penuh (Wajib Login)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Metode Keamanan Form</label>
                      <span className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold block select-none">
                        CSRF Token & XSS Filter (Aktif)
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Terapkan Konfigurasi Portal 🚀
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 8: AUDIT SYSTEM LOGS */}
            {activeTab === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="pb-2 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Jejak Audit Aktivitas Sistem (Audit Log)</h3>
                    <p className="text-[10.5px] text-slate-400">Rekaman kronologis dari seluruh tindakan warga kelas untuk menjamin keamanan portal.</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-500">
                    Live Records
                  </span>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 font-mono text-[10.5px] max-h-72 overflow-y-auto space-y-1.5">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 hover:bg-slate-800/40 p-1 rounded">
                      <span className="text-slate-500 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-cyan-400 font-extrabold uppercase">[{log.action}]</span>
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

      {/* ADMIN SUB-MODAL: USER PRIVILEGE CONTROLLER */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-premium overflow-hidden text-left"
            >
              <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
                <h3 className="text-xs font-bold">{editingUser ? "Edit Privilese User" : "Tambah Anggota Baru"}</h3>
                <button onClick={() => setIsUserModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={formUserName}
                    onChange={(e) => setFormUserName(e.target.value)}
                    placeholder="Contoh: Sarah Amanda"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Mahasiswa</label>
                  <input
                    type="email"
                    value={formUserEmail}
                    onChange={(e) => setFormUserEmail(e.target.value)}
                    placeholder="sarah.amanda@kampus.ac.id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Peran Otorisasi (Otoritas Role)</label>
                  <select
                    value={formUserRole}
                    onChange={(e) => setFormUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  >
                    <option value="Member">Member (Akses Forum & Unggah)</option>
                    <option value="Admin">Admin (Akses Moderator Penuh)</option>
                    <option value="Guest">Guest (Hanya Baca)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Simpan Perubahan User 📝
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN SUB-MODAL: CHAT ROOM CONTROLLER */}
      <AnimatePresence>
        {isRoomModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-premium overflow-hidden text-left"
            >
              <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
                <h3 className="text-xs font-bold">{editingRoom ? "Edit Informasi Kanal" : "Buat Kanal Obrolan Baru"}</h3>
                <button onClick={() => setIsRoomModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Saluran Channel</label>
                  <input
                    type="text"
                    required
                    value={formRoomName}
                    onChange={(e) => setFormRoomName(e.target.value)}
                    placeholder="e.g. praktikum-rpl"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Deskripsi Singkat</label>
                  <input
                    type="text"
                    value={formRoomDesc}
                    onChange={(e) => setFormRoomDesc(e.target.value)}
                    placeholder="Membahas tugas praktikum laboran..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="is_private_chan"
                    checked={formRoomPrivate}
                    onChange={(e) => setFormRoomPrivate(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is_private_chan" className="text-xs font-bold text-slate-600 cursor-pointer">
                    Jadikan Kanal Privat (🔒 Admin Saja)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Simpan Kanal 🚀
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
