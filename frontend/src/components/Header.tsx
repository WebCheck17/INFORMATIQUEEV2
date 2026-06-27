import React, { useState, useEffect, useRef } from "react";
import { UserProfile, ClassNotification } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MessageSquare, 
  Image as ImageIcon, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Home, 
  Menu, 
  X,
  GraduationCap
} from "lucide-react";

interface HeaderProps {
  user: UserProfile;
  isLoggedIn: boolean;
  onOpenProfile: () => void;
  onLogout: () => void;
  notifications: ClassNotification[];
  onClearNotification: (id: string) => void;
  onOpenLogin: () => void;
}

export default function Header({
  user,
  isLoggedIn,
  onOpenProfile,
  onLogout,
  notifications,
  onClearNotification,
  onOpenLogin
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: "landing", path: "/", label: "Beranda", icon: Home, guestOk: true },
    { id: "memories", path: "/kelas", label: "Galeri Foto", icon: ImageIcon, guestOk: true },
    { id: "chatroom", path: "/chat", label: "Room Chat", icon: MessageSquare, guestOk: false },
    { id: "assignments", path: "/tugas", label: "Deadline Tugas", icon: Calendar, guestOk: true },
  ];

  if (isLoggedIn && user.role === "Admin") {
    tabs.push({ id: "admin", path: "/admin", label: "Admin Panel", icon: ShieldCheck, guestOk: false });
  }

  const currentPath = location.pathname;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (path: string, guestOk: boolean) => {
    if (!isLoggedIn && !guestOk) {
      onOpenLogin();
      return;
    }
    navigate(path);
    setShowMobileMenu(false);
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5B7] border-b-3 border-black shadow-[0px_4px_0px_0px_#000]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none shrink-0" onClick={() => navigate("/")}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FF6B6B] border-2 border-black rounded-xl flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000]">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left leading-none hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1">
                Informatiquee<span className="text-[#FF007F] bg-white px-1 border border-black rounded">Class</span>
              </h1>
              <p className="text-[9px] text-slate-700 font-extrabold uppercase tracking-wider font-sans mt-0.5">
                Kelas Digital
              </p>
            </div>
          </div>

          {/* Desktop Tabs Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {tabs.map((tab) => {
              const isActive = currentPath === tab.path;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path, tab.guestOk)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer transition-all border ${
                    isActive
                      ? "bg-[#FF007F] text-white border-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5"
                      : "text-slate-800 border-transparent hover:bg-[#b5e2fa]/40 hover:border-black"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Widgets Area */}
          <div className="flex items-center gap-2">

            {/* Notifications Center */}
            {isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="p-2 bg-white hover:bg-[#b5e2fa] text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer relative active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]"
                  aria-label="Notifikasi"
                  title="Notifikasi"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF007F] border border-black rounded-full flex items-center justify-center text-[8px] text-white font-black animate-bounce">
                      {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden z-50 text-left"
                    >
                      <div className="p-3 bg-[#e2bbfd] border-b-2 border-black flex justify-between items-center text-xs font-black text-slate-900">
                        <span>Notifikasi Kelas ({unreadNotifsCount})</span>
                        {unreadNotifsCount > 0 && (
                          <span className="text-[10px] bg-white border border-black px-1.5 py-0.5 rounded">Terbaru</span>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y-2 divide-black">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-[10.5px] font-bold text-slate-500">
                            Tidak ada notifikasi baru.
                          </p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="p-3 hover:bg-slate-50/50 flex items-start justify-between gap-3 text-[11px]">
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-black text-slate-900 truncate">{n.title}</p>
                                <p className="text-slate-700 font-bold leading-snug">{n.message}</p>
                                <span className="text-[9px] font-black text-indigo-600 font-mono block pt-1">
                                  {new Date(n.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <button
                                onClick={() => onClearNotification(n.id)}
                                className="text-slate-800 hover:text-black font-black text-lg leading-none shrink-0"
                                aria-label="Hapus notifikasi"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Auth */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1 bg-white hover:bg-[#98f5e1] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]"
                  aria-label="Profil"
                >
                  <div 
                    className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center font-black text-[10.5px] text-white shrink-0 border border-black"
                    style={{ backgroundColor: user.bgColor }}
                  >
                    {user.initials}
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-black text-slate-900 pr-1 truncate max-w-[100px]">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 bg-white hover:bg-[#ffb7b2] text-slate-800 hover:text-black rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]"
                  aria-label="Keluar"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4 font-black" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="py-1.5 px-3 bg-[#FF007F] hover:bg-[#FF007F]/90 text-white border-2 border-black rounded-xl text-[11px] font-black shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]"
              >
                Login Member
              </button>
            )}

            {/* Mobile Hamburguer */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 bg-white hover:bg-slate-100 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] md:hidden cursor-pointer"
              aria-label="Menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.nav
              ref={mobileRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden pt-4 mt-3 border-t-2 border-black flex flex-col gap-1.5 text-left"
            >
              {tabs.map((tab) => {
                const isActive = currentPath === tab.path;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.path, tab.guestOk)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer w-full text-left border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                      isActive
                        ? "bg-[#FF007F] text-white"
                        : "bg-white text-slate-800 hover:bg-[#b5e2fa]/25"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}