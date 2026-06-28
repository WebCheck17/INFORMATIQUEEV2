import React, { useState } from "react";
import { UserProfile } from "../types";
import { INITIAL_USERS } from "../data";
import { motion, AnimatePresence } from "motion/react";
import { Shield, User, Key, Mail, RefreshCw, LogIn, ArrowRight, GraduationCap } from "lucide-react";
import { api } from "../services/api"; // ← Import api service

interface AuthProps {
  onLogin: (user: UserProfile) => void;
  onEnterAsGuest: () => void;
  users: UserProfile[];
  onRegister: (newUser: UserProfile) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  apiMode?: boolean;
}

// Helper avatar lokal
function getDefaultAvatar(gender: string): string {
  return gender === "female" ? "/images/default-2.png" : "/images/default-1.png";
}

export default function AuthSection({ onLogin, onEnterAsGuest, users, onRegister, onToast, apiMode = false }: AuthProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regGender, setRegGender] = useState("male");
  const [regNim, setRegNim] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regKelas, setRegKelas] = useState("15.5A.02");
  const [regJurusan, setRegJurusan] = useState("Teknik Informatika");

  // Forgot
  const [forgotEmail, setForgotEmail] = useState("");

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log("DEBUG 1 - username:", username, "password:", password);
  
  if (!username) {
    onToast("Username wajib diisi!", "error");
    return;
  }

  setIsLoading(true);

  if (apiMode) {
    try {
      // DEBUG: Coba fetch manual dulu
      console.log("DEBUG 2 - apiMode true, fetching...");
      
      const res = await fetch("https://informatiquee-backend.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      console.log("DEBUG 3 - Response status:", res.status);
      
      const data = await res.json();
      console.log("DEBUG 4 - Response data:", data);

      if (!res.ok) {
        onToast(data.error || "Login gagal!", "error");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("kelashub_token", data.token);

        const user: UserProfile = {
          id: data.user.id.toString(),
          username: data.user.username,
          name: data.user.name,
          nim: data.user.nim || "-",
          kelas: data.user.kelas || "15.5A.02",
          jurusan: data.user.jurusan || "Teknik Informatika",
          bio: data.user.bio || "",
          email: data.user.email,
          role: data.user.role_name || data.user.role || "Member",
          photoUrl: data.user.avatar || getDefaultAvatar(data.user.gender || "male"),
          dateJoined: new Date().toISOString().split("T")[0],
          isActive: true,
          streakDays: 0,
          hasCheckedIn: false,
          bgColor: "#" + Math.floor(Math.random()*16777215).toString(16),
          initials: data.user.name?.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase() || "??",
        };

        onLogin(user);
        onToast(`Selamat datang, ${user.name}!`, "success");

      } catch (err: any) {
        console.error("Login error:", err);
        onToast(err.message || "Gagal terhubung ke server!", "error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mock mode (tetap sama)
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );

    if (foundUser) {
      if (!foundUser.isActive) {
        onToast("Akun Anda dinonaktifkan oleh Admin!", "error");
        setIsLoading(false);
        return;
      }
      onLogin(foundUser);
      onToast(`Selamat datang kembali, ${foundUser.name}!`, "success");
    } else {
      if (username.toLowerCase() === "admin") {
        const ad = users.find(u => u.role === "Admin") || INITIAL_USERS[0];
        onLogin(ad);
        onToast("Logged in as Admin demo!", "success");
      } else if (username.toLowerCase() === "member") {
        const mb = users.find(u => u.role === "Member") || INITIAL_USERS[1];
        onLogin(mb);
        onToast("Logged in as Member demo!", "success");
      } else {
        onToast("User tidak ditemukan!", "error");
      }
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regUsername || !regEmail || !regNim || !regPassword) {
      onToast("Semua data wajib diisi dengan benar!", "error");
      return;
    }

    setIsLoading(true);

    if (apiMode) {
      try {
        // ✅ Gunakan api service
        await api.register({
          name: regName.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          gender: regGender,
          nim: regNim.trim(),
          password: regPassword,
          kelas: regKelas,
          jurusan: regJurusan,
        });

        onToast("Pendaftaran sukses! Silakan login.", "success");
        setActiveTab("login");
        setUsername(regUsername.trim());

      } catch (err: any) {
        onToast(err.message || "Gagal terhubung ke server!", "error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mock mode (tetap sama)
    const exists = users.some(u => u.username.toLowerCase() === regUsername.toLowerCase().trim());
    if (exists) {
      onToast("Username sudah digunakan!", "error");
      setIsLoading(false);
      return;
    }

    const newUser: UserProfile = {
      id: "u_" + Date.now().toString(),
      username: regUsername.trim(),
      name: regName.trim(),
      nim: regNim.trim(),
      kelas: regKelas,
      jurusan: regJurusan,
      bio: "Mahasiswa baru bergabung di KelasHub! 👋",
      email: regEmail.trim(),
      role: "Member",
      photoUrl: getDefaultAvatar(regGender),
      dateJoined: new Date().toISOString().split("T")[0],
      isActive: true,
      streakDays: 1,
      hasCheckedIn: false
    };

    onRegister(newUser);
    onToast("Pendaftaran sukses! Silakan login.", "success");
    setActiveTab("login");
    setUsername(newUser.username);
    setIsLoading(false);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      onToast("Email wajib diisi!", "error");
      return;
    }
    onToast(`Instruksi reset password dikirim ke: ${forgotEmail}`, "success");
    setActiveTab("login");
  };

  const tabButton = (tab: "login" | "register", label: string) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-3 text-sm font-black border-2 border-black rounded-xl transition-all ${
        activeTab === tab
          ? "bg-[#FF007F] text-white shadow-[3px_3px_0px_0px_#000] -translate-y-0.5"
          : "bg-white text-slate-800 hover:bg-[#b5e2fa] shadow-[2px_2px_0px_0px_#000]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF5B7] flex flex-col overflow-auto">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b-3 border-black bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B6B] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">
              Informatiquee<span className="text-[#FF007F]">Class</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Kelas Digital</p>
          </div>
        </div>
        <button
          onClick={onEnterAsGuest}
          className="px-4 py-2 bg-[#98f5e1] hover:bg-[#7ee8c7] text-slate-900 text-xs font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]"
        >
          👀 Guest Mode
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Branding */}
          <div className="lg:col-span-5 bg-[#FF6B6B] border-3 border-black rounded-3xl p-8 flex flex-col justify-between shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD93D] rounded-full border-3 border-black" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#4D96FF] rounded-full border-3 border-black" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000] mb-6">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                Portal Kelas<br/>Terintegrasi
              </h2>
              <p className="text-white/90 text-sm font-bold leading-relaxed">
                Berbagi memori, koordinasi tugas, dan diskusi seru bareng teman kelas!
              </p>
            </div>

            <div className="relative z-10 mt-8 space-y-3">
              {[
                { icon: "🛡️", title: "Aman & Terverifikasi", desc: "CSRF & XSS protection" },
                { icon: "⚡", title: "Discord-like Chat", desc: "Realtime messaging" },
                { icon: "📚", title: "Deadline Tracker", desc: "Jangan sampai telat!" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_#000] flex items-center gap-3"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-black text-slate-900">{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7 bg-white border-3 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_0px_#000]">
            
            {/* Tabs */}
            {activeTab !== "forgot" && (
              <div className="flex gap-2 mb-6">
                {tabButton("login", "🔐 Masuk")}
                {tabButton("register", "🚀 Daftar")}
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-900">Selamat Datang!</h3>
                    <p className="text-slate-500 text-sm font-bold mt-1">Masuk pake akun member kelas.</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="admin"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-black rounded-xl text-sm font-bold focus:ring-0 focus:bg-[#FFF5B7] focus:border-black outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Password</label>
                        <button type="button" onClick={() => setActiveTab("forgot")} className="text-[11px] font-black text-[#FF007F] hover:underline">
                          Lupa?
                        </button>
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-black rounded-xl text-sm font-bold focus:ring-0 focus:bg-[#FFF5B7] focus:border-black outline-none transition-all"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 border-2 border-black rounded"
                      />
                      <span className="text-xs font-black text-slate-600">Ingat saya</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3.5 bg-[#FF007F] hover:bg-[#e60072] text-white font-black text-sm border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] transition-all flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] ${isLoading ? 'opacity-70' : ''}`}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                      {isLoading ? "Loading..." : "Masuk Sekarang"}
                    </button>
                  </form>

                  {/* Quick Login */}
                  <div className="mt-6 pt-6 border-t-2 border-black">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 text-center">Demo Accounts</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { const u = users.find(x => x.role === "Admin") || INITIAL_USERS[0]; onLogin(u); onToast(`Admin: ${u.name}`, "success"); }}
                        className="py-2.5 bg-[#e2bbfd] hover:bg-[#d4a8f5] text-slate-900 text-xs font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" /> Admin
                      </button>
                      <button
                        onClick={() => { const u = users.find(x => x.username === "budi_s") || INITIAL_USERS[1]; onLogin(u); onToast(`Member: ${u.name}`, "success"); }}
                        className="py-2.5 bg-[#b5e2fa] hover:bg-[#9fd4f5] text-slate-900 text-xs font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5" /> Member
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "register" && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-slate-900">Daftar Akun</h3>
                    <p className="text-slate-500 text-sm font-bold mt-1">Gabung sebagai member resmi.</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">Nama</label>
                        <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} placeholder="Budi" className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">Username</label>
                        <input type="text" required value={regUsername} onChange={e => setRegUsername(e.target.value)} placeholder="budi_s" className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">NIM</label>
                        <input type="text" required value={regNim} onChange={e => setRegNim(e.target.value)} placeholder="220101XXX" className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">Gender</label>
                        <select value={regGender} onChange={e => setRegGender(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none">
                          <option value="male">👦 Laki-Laki</option>
                          <option value="female">👧 Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">Email</label>
                      <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="budi@kelashub.ac.id" className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">Password</label>
                      <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min 6 karakter" className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">Kelas</label>
                        <select value={regKelas} onChange={e => setRegKelas(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none">
                          <option value="15.5A.02">15.5A.02</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-1 uppercase">Jurusan</label>
                        <input type="text" value={regJurusan} onChange={e => setRegJurusan(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-bold focus:bg-[#FFF5B7] outline-none" />
                      </div>
                    </div>

                    {/* Avatar Preview */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-black rounded-xl">
                      <img src={getDefaultAvatar(regGender)} alt="Preview" className="w-12 h-12 rounded-lg border-2 border-black object-cover" />
                      <div>
                        <p className="text-xs font-black text-slate-900">Avatar Default</p>
                        <p className="text-[10px] font-bold text-slate-500">{regGender === "female" ? "Perempuan" : "Laki-Laki"}</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 bg-[#FF007F] hover:bg-[#e60072] text-white font-black text-sm border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] transition-all flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] ${isLoading ? 'opacity-70' : ''}`}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "🚀 Buat Akun"}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "forgot" && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-900">Lupa Password?</h3>
                    <p className="text-slate-500 text-sm font-bold mt-1">Kirim instruksi reset ke email.</p>
                  </div>

                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="nim@kelashub.ac.id"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-black rounded-xl text-sm font-bold focus:bg-[#FFF5B7] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-[#98f5e1] hover:bg-[#7ee8c7] text-slate-900 font-black text-sm border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all flex items-center justify-center gap-1"
                      >
                        Kirim <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t-3 border-black bg-white flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-500">© 2026 Informatiquee Class</span>
        <span className="text-[10px] font-black text-[#FF007F]">v2.4.0 • Neobrutalist Edition</span>
      </div>
    </div>
  );
}
