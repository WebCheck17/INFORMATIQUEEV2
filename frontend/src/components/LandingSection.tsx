import React from "react";
import { motion } from "motion/react";
import { ClassPhotoMemory, DosenAssignment, ChatRoom } from "../types";
import { Image as ImageIcon, Calendar, MessageSquare, Users, ArrowRight, Sparkles } from "lucide-react";

interface LandingSectionProps {
  memories: ClassPhotoMemory[];
  assignments: DosenAssignment[];
  rooms: ChatRoom[];
  userCount: number;
  onNavigateToTab: (tab: string) => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

export default function LandingSection({
  memories,
  assignments,
  rooms,
  userCount,
  onNavigateToTab,
  onOpenLogin,
  isLoggedIn
}: LandingSectionProps) {
  
  const recentMemories = memories.slice(0, 3);
  const upcomingAssignments = assignments
    .filter(a => new Date(a.deadline) > new Date())
    .slice(0, 3);

  return (
    <div className="space-y-8 pt-6">
      
      {/* Hero Section */}
      <section className="relative bg-white border-3 border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF007F]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#b5e2fa]/40 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-[#FF007F] text-white text-[10px] font-black border border-black rounded-lg">
              15.5A.02
            </span>
            <span className="px-2 py-1 bg-[#98f5e1] text-slate-900 text-[10px] font-black border border-black rounded-lg">
              Teknik Informatika
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 leading-tight">
            Selamat Datang di <br/>
            <span className="text-[#FF007F]">Informatiquee</span>Class! 🎓
          </h1>
          
          <p className="text-sm text-slate-600 font-bold max-w-lg mb-6 leading-relaxed">
            Portal kelas digital untuk mahasiswa Teknik Informatika. 
            Kelola tugas, berbagi kenangan, dan diskusi bareng teman kelas!
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigateToTab("memories")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF007F] text-white text-xs font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Jelajahi Galeri
            </button>
            
            {!isLoggedIn && (
              <button 
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 text-xs font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <Users className="w-4 h-4" />
                Login Member
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Warga Kelas", value: userCount, icon: Users, color: "bg-[#b5e2fa]" },
          { label: "Foto Kenangan", value: memories.length, icon: ImageIcon, color: "bg-[#e2bbfd]" },
          { label: "Room Chat", value: rooms.length, icon: MessageSquare, color: "bg-[#98f5e1]" },
          { label: "Tugas Aktif", value: assignments.length, icon: Calendar, color: "bg-[#ffb7b2]" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.color} border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_#000]`}
          >
            <stat.icon className="w-5 h-5 text-slate-900 mb-2" />
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Recent Memories Preview */}
      {recentMemories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#FF007F]" />
              Kenangan Terbaru
            </h2>
            <button 
              onClick={() => onNavigateToTab("memories")}
              className="flex items-center gap-1 text-[11px] font-black text-[#FF007F] hover:underline"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentMemories.map((memory, i) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-all"
                onClick={() => onNavigateToTab("memories")}
              >
                <div className="aspect-video bg-slate-200 overflow-hidden">
                  <img 
                    src={memory.imageUrl} 
                    alt={memory.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-black text-slate-900 truncate">{memory.caption}</p>
                  <p className="text-[9px] font-bold text-slate-500 mt-1">{memory.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Assignments Preview */}
      {upcomingAssignments.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF007F]" />
              Deadline Mendatang
            </h2>
            <button 
              onClick={() => onNavigateToTab("assignments")}
              className="flex items-center gap-1 text-[11px] font-black text-[#FF007F] hover:underline"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-2">
            {upcomingAssignments.map((assignment, i) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000] flex items-center justify-between hover:shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer"
                onClick={() => onNavigateToTab("assignments")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFF5B7] border-2 border-black rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{assignment.title}</p>
                    <p className="text-[10px] font-bold text-slate-500">{assignment.course} • {assignment.dosen}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#FF007F] bg-[#FFF5B7] px-2 py-1 border border-black rounded-lg">
                    {new Date(assignment.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Access Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div 
          onClick={() => onNavigateToTab("memories")}
          className="bg-[#e2bbfd] border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-all"
        >
          <ImageIcon className="w-8 h-8 text-slate-900 mb-3" />
          <h3 className="text-sm font-black text-slate-900 mb-1">Galeri Kenangan</h3>
          <p className="text-[11px] font-bold text-slate-700">Lihat dan bagikan momen seru bareng kelas!</p>
        </div>
        
        <div 
          onClick={() => onNavigateToTab("assignments")}
          className="bg-[#b5e2fa] border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000] cursor-pointer hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-all"
        >
          <Calendar className="w-8 h-8 text-slate-900 mb-3" />
          <h3 className="text-sm font-black text-slate-900 mb-1">Deadline Tugas</h3>
          <p className="text-[11px] font-bold text-slate-700">Pantau jadwal tugas dan pengumpulan!</p>
        </div>
      </section>

    </div>
  );
}