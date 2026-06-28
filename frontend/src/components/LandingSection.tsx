import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Image as ImageIcon, Calendar, MessageSquare, Users, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { api } from "../services/api";
import { INITIAL_MEMORIES, INITIAL_ASSIGNMENTS, INITIAL_ROOMS } from "../data";
import { ClassPhotoMemory, DosenAssignment, ChatRoom } from "../types";

interface LandingSectionProps {
  onNavigateToTab: (tab: string) => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

// Helper untuk resolve image path
import { getImageUrl } from "../services/imageHelper";

// Usage
<img 
  src={getImageUrl(memory.imageUrl)} 
  alt={memory.title}
  className="w-full h-full object-cover"
  loading="lazy"
  onError={(e) => {
    (e.target as HTMLImageElement).src = '/images/default-1.png';
  }}
/>

export default function LandingSection({
  onNavigateToTab,
  onOpenLogin,
  isLoggedIn,
}: LandingSectionProps) {
  const [memories, setMemories] = useState<ClassPhotoMemory[]>([]);
  const [assignments, setAssignments] = useState<DosenAssignment[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  
  const [loading, setLoading] = useState({
    memories: true,
    assignments: true,
    rooms: true,
    users: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllData();
  }, []);

const fetchAllData = async () => {
    // Fetch posts (memories)
    try {
      const posts = await api.getPosts();
      const mappedMemories: ClassPhotoMemory[] = posts.slice(0, 3).map((post: any) => ({
        id: post.id,
        title: post.title || post.description || "Untitled",
        imageUrl: getImageUrl(post.image_url),  // ← PAKAI HELPER
        date: new Date(post.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        uploaderName: post.author_name,
        likes: parseInt(post.likes_count) || 0,
        commentsCount: parseInt(post.comments_count) || 0,
      }));
      setMemories(mappedMemories);
      setLoading(prev => ({ ...prev, memories: false }));
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      // Fallback ke mock data
      setMemories(INITIAL_MEMORIES.map(m => ({
        id: m.id,
        title: m.title,
        imageUrl: getImageUrl(m.imageUrl),  // ← PAKAI HELPER
        date: new Date(m.date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        uploaderName: m.uploaderName,
        likes: m.likes,
        commentsCount: m.comments?.length || 0,
      })));
      setLoading(prev => ({ ...prev, memories: false }));
    }

    // Fetch deadlines (assignments)
    try {
      const deadlines = await api.getDeadlines();
      const mappedAssignments: DosenAssignment[] = deadlines
        .filter((d: any) => new Date(d.deadline_at) > new Date())
        .slice(0, 3)
        .map((d: any) => ({
          id: d.id,
          title: d.title,
          course: d.mata_kuliah || d.course || "Umum",
          dosen: d.dosen || "Dosen",
          deadline: d.deadline_at,
          description: d.description,
          priority: d.priority,
        }));
      setAssignments(mappedAssignments);
      setLoading(prev => ({ ...prev, assignments: false }));
    } catch (err) {
      console.error("Failed to fetch deadlines:", err);
      setErrors(prev => ({ ...prev, assignments: "Gagal memuat tugas" }));
      setAssignments(INITIAL_ASSIGNMENTS.map(a => ({
        id: a.id,
        title: a.title,
        course: a.subject,
        dosen: a.lecturer,
        deadline: a.dueDate,
        description: a.description,
        priority: a.priority,
      })));
      setLoading(prev => ({ ...prev, assignments: false }));
    }

    // Fetch chat rooms
    try {
      const chatRooms = await api.getChatRooms();
      const mappedRooms: ChatRoom[] = chatRooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        messageCount: parseInt(room.message_count) || 0,
      }));
      setRooms(mappedRooms);
      setLoading(prev => ({ ...prev, rooms: false }));
    } catch (err) {
      console.error("Failed to fetch chat rooms:", err);
      setErrors(prev => ({ ...prev, rooms: "Gagal memuat chat rooms" }));
      setRooms(INITIAL_ROOMS.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        messageCount: 0,
      })));
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  const recentMemories = memories.length > 0 ? memories : [];
  const upcomingAssignments = assignments.length > 0 
    ? assignments.filter(a => new Date(a.deadline || a.dueDate || '') > new Date()).slice(0, 3)
    : [];
  const activeRooms = rooms.length > 0 ? rooms : [];
  const displayUserCount = userCount || activeRooms.length;

  const isLoading = Object.values(loading).some(v => v);

  const handleRetry = () => {
    setErrors({});
    setLoading({
      memories: true,
      assignments: true,
      rooms: true,
      users: true,
    });
    fetchAllData();
  };

  return (
    <div className="space-y-8 pt-6">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-[#FF007F] animate-spin" />
          <span className="ml-3 text-sm font-bold text-slate-600">Memuat data...</span>
        </div>
      )}

      {/* Error Banner */}
      {Object.keys(errors).length > 0 && !isLoading && (
        <div className="bg-[#ffb7b2] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000]">
          <p className="text-xs font-bold text-slate-900 mb-2">
            ⚠️ Beberapa data gagal dimuat. Menampilkan data demo.
          </p>
          <button
            onClick={handleRetry}
            className="text-[11px] font-black text-[#FF007F] underline hover:no-underline"
          >
            Coba Lagi
          </button>
        </div>
      )}

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
          { label: "Warga Kelas", value: displayUserCount, icon: Users, color: "bg-[#b5e2fa]" },
          { label: "Foto Kenangan", value: recentMemories.length, icon: ImageIcon, color: "bg-[#e2bbfd]" },
          { label: "Room Chat", value: activeRooms.length, icon: MessageSquare, color: "bg-[#98f5e1]" },
          { label: "Tugas Aktif", value: upcomingAssignments.length, icon: Calendar, color: "bg-[#ffb7b2]" },
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
                    src={getImageUrl(memory.imageUrl)} 
                    alt={memory.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-1.png';
                    }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-black text-slate-900 truncate">{memory.title}</p>
                  <p className="text-[9px] font-bold text-slate-500 mt-1">{memory.date}</p>
                  {memory.uploaderName && (
                    <p className="text-[9px] font-bold text-[#FF007F] mt-1">
                      by {memory.uploaderName}
                    </p>
                  )}
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
                    <p className="text-[10px] font-bold text-slate-500">
                      {assignment.course || assignment.subject} • {assignment.dosen || assignment.lecturer}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#FF007F] bg-[#FFF5B7] px-2 py-1 border border-black rounded-lg">
                    {new Date(assignment.deadline || assignment.dueDate || '').toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                  {assignment.priority && (
                    <p className={`text-[8px] font-bold mt-1 px-1.5 py-0.5 rounded border border-black inline-block
                      ${assignment.priority === 'high' || assignment.priority === 'Tinggi' ? 'bg-[#ffb7b2]' : 
                        assignment.priority === 'medium' || assignment.priority === 'Sedang' ? 'bg-[#FFF5B7]' : 'bg-[#98f5e1]'}`}>
                      {assignment.priority}
                    </p>
                  )}
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
