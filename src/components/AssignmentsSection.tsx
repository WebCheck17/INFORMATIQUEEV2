import React, { useState, useEffect } from "react";
import { DosenAssignment, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X, 
  AlertCircle 
} from "lucide-react";

interface AssignmentsProps {
  assignments: DosenAssignment[];
  currentUser: UserProfile;
  onUpdateAssignments: (updated: DosenAssignment[]) => void;
  onAddLog: (action: string, details: string) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  onTriggerNotification: (type: "deadline", title: string, message: string) => void;
}

export default function AssignmentsSection({ 
  assignments, 
  currentUser, 
  onUpdateAssignments, 
  onAddLog, 
  onToast,
  onTriggerNotification
}: AssignmentsProps) {

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Semua");
  const [sortBy, setSortBy] = useState<"closest" | "farthest">("closest");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Belum" | "Selesai">("Semua");
  const [isLoading, setIsLoading] = useState(true);

  // Simulated latency for skeleton loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedSubject, statusFilter, sortBy]);

  // Selected date on calendar to filter
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);

  // Countdown clock state to force re-render every second
  const [currentTime, setCurrentTime] = useState(new Date());

  // Detail Modal state
  const [detailAssignment, setDetailAssignment] = useState<DosenAssignment | null>(null);

  // CRUD Modal state
  const [isCrudOpen, setIsCrudOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubject, setFormSubject] = useState("");
  const [formLecturer, setFormLecturer] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState<"Tinggi" | "Sedang" | "Biasa">("Sedang");
  const [formNotes, setFormNotes] = useState("");
  const [formAttachName, setFormAttachName] = useState("");

  // Calendar Pagination State
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5)); // June 2026

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute stats helper
  const getDeadlineStatus = (dueDateStr: string, isFinished: boolean) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffMs = due.getTime() - now.getTime();

    if (isFinished) return { label: "Selesai", color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" };
    if (diffMs < 0) return { label: "Terlambat", color: "text-red-600 bg-red-50 border-red-100", dot: "bg-red-500" };
    
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) {
      return { label: "Mendekati Deadline", color: "text-amber-600 bg-amber-50 border-amber-100", dot: "bg-amber-500" };
    }
    return { label: "Masih Lama", color: "text-indigo-600 bg-indigo-50 border-indigo-100", dot: "bg-indigo-500" };
  };

  // Get countdown timer string
  const getCountdownString = (dueDateStr: string) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffMs = due.getTime() - now.getTime();

    if (diffMs <= 0) return "Waktu habis / Terlambat";

    const secs = Math.floor(diffMs / 1000) % 60;
    const mins = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let res = "";
    if (days > 0) res += `${days}h `;
    if (hours > 0 || days > 0) res += `${hours}j `;
    res += `${mins}m ${secs}d`;
    return res;
  };

  const handleToggleStatus = (id: string) => {
    if (currentUser.role === "Guest") {
      onToast("Tolong login terlebih dahulu untuk menandai tugas selesai!", "info");
      return;
    }
    const updated = assignments.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === "Selesai" ? "Belum" : "Selesai";
        onToast(nextStatus === "Selesai" ? "Tugas berhasil diselesaikan! 🎉" : "Status tugas dibatalkan.", "info");
        onAddLog("Edit", `Mengubah status tugas "${a.title}" menjadi ${nextStatus}`);
        return { ...a, status: nextStatus as "Belum" | "Selesai" };
      }
      return a;
    });
    onUpdateAssignments(updated);
  };

  const handleDeleteAssignment = (id: string) => {
    if (currentUser.role !== "Admin") {
      onToast("Hanya Admin yang berhak menghapus deadline tugas!", "error");
      return;
    }
    const updated = assignments.filter(a => a.id !== id);
    onUpdateAssignments(updated);
    onToast("Deadline tugas berhasil dihapus!", "success");
    onAddLog("Delete", `Menghapus tugas ID: ${id}`);
  };

  // Create or Edit Submission
  const handleCrudSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formTitle.trim() || !formDueDate) {
      onToast("Mata Kuliah, Judul, dan Deadline wajib diisi!", "error");
      return;
    }

    if (editingId) {
      // Edit
      const updated = assignments.map(a => {
        if (a.id === editingId) {
          const edited: DosenAssignment = {
            ...a,
            subject: formSubject.trim(),
            lecturer: formLecturer.trim() || "Dosen Pengampu",
            title: formTitle.trim(),
            description: formDesc.trim(),
            dueDate: formDueDate,
            priority: formPriority,
            notes: formNotes.trim() || undefined,
            attachment: formAttachName ? {
              name: formAttachName,
              size: "1.5 MB",
              url: "#"
            } : undefined
          };
          onTriggerNotification(
            "deadline",
            "Deadline Tugas Diubah",
            `Tugas "${edited.title}" untuk matkul ${edited.subject} telah diperbarui.`
          );
          onAddLog("Admin Action", `Mengedit tugas: ${edited.title}`);
          return edited;
        }
        return a;
      });
      onUpdateAssignments(updated);
      onToast("Tugas berhasil diperbarui!", "success");
    } else {
      // Create
      const newAsg: DosenAssignment = {
        id: "a_" + Date.now().toString(),
        subject: formSubject.trim(),
        lecturer: formLecturer.trim() || "Dosen Pengampu",
        title: formTitle.trim(),
        description: formDesc.trim(),
        dueDate: formDueDate,
        priority: formPriority,
        status: "Belum",
        notes: formNotes.trim() || undefined,
        attachment: formAttachName ? {
          name: formAttachName,
          size: "2.1 MB",
          url: "#"
        } : undefined
      };
      onUpdateAssignments([newAsg, ...assignments]);
      onTriggerNotification(
        "deadline",
        "Deadline Tugas Baru",
        `Tugas baru "${newAsg.title}" matkul ${newAsg.subject} dirilis oleh ${newAsg.lecturer}.`
      );
      onAddLog("Admin Action", `Merilis tugas baru: ${newAsg.title}`);
      onToast("Tugas baru berhasil dirilis!", "success");
    }

    // Reset Form
    setIsCrudOpen(false);
    setEditingId(null);
    setFormSubject("");
    setFormLecturer("");
    setFormTitle("");
    setFormDesc("");
    setFormDueDate("");
    setFormPriority("Sedang");
    setFormNotes("");
    setFormAttachName("");
  };

  const openEditModal = (a: DosenAssignment) => {
    setEditingId(a.id);
    setFormSubject(a.subject);
    setFormLecturer(a.lecturer);
    setFormTitle(a.title);
    setFormDesc(a.description);
    // Convert format if necessary, assuming standard ISO input is fine
    setFormDueDate(a.dueDate.substring(0, 16));
    setFormPriority(a.priority);
    setFormNotes(a.notes || "");
    setFormAttachName(a.attachment?.name || "");
    setIsCrudOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormSubject("");
    setFormLecturer("");
    setFormTitle("");
    setFormDesc("");
    setFormDueDate("2026-06-30T23:59");
    setFormPriority("Sedang");
    setFormNotes("");
    setFormAttachName("");
    setIsCrudOpen(true);
  };

  const handleSimulateDownload = (fileName: string) => {
    onToast(`Mengunduh file: ${fileName}...`, "success");
    onAddLog("Download", `Mengunduh lampiran tugas: ${fileName}`);
  };

  // List of unique subjects for filter pill row
  const subjectsList = ["Semua", ...new Set(assignments.map(a => a.subject))];

  // Filtering Logic
  const filtered = assignments.filter(a => {
    const matchSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchSubject = selectedSubject === "Semua" || a.subject === selectedSubject;
    const matchStatus = 
      statusFilter === "Semua" || 
      (statusFilter === "Belum" && a.status === "Belum") ||
      (statusFilter === "Selesai" && a.status === "Selesai");

    // Calendar date match
    const matchCalDate = !selectedCalDate || a.dueDate.split("T")[0] === selectedCalDate;

    return matchSearch && matchSubject && matchStatus && matchCalDate;
  });

  // Sort Logic
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return sortBy === "closest" ? dateA - dateB : dateB - dateA;
  });

  // Monthly Calendar Generators
  const getDaysInMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const firstDayIndex = (days[0].getDay() + 6) % 7; // Align to Monday-start

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      
      {/* Dynamic Header Banner */}
      <div className="bg-[#ffdab9] text-black p-8 relative overflow-hidden border-3 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/25 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <span className="bg-white border-2 border-black text-black text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
              Google Classroom + Notion View
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight text-black">
              Tenggat Waktu & Tugas Akademik
            </h2>
            <p className="text-slate-800 font-bold text-xs max-w-xl leading-relaxed">
              Pantau seluruh tugas aktif, deadline praktikum, dan kuis. Dilengkapi countdown realtime, reminder tingkat kedekatan deadline, dan lampiran file materi dosen.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 900);
              }}
              className="py-2.5 px-4 bg-white hover:bg-[#98f5e1] text-black font-black text-xs border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Sync Tugas 🔄
            </button>
            {currentUser.role === "Admin" && (
              <button
                onClick={openCreateModal}
                className="py-2.5 px-4 bg-[#FF007F] hover:bg-[#FF007F]/90 text-white font-black text-xs border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-center"
              >
                <Plus className="w-4 h-4" /> Tambah Tugas Baru 📝
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Search/Filter + Mini Interactive Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Left Side: Tasks filter and List (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-[#b5e2fa] rounded-2xl p-4 border-3 border-black shadow-[6px_6px_0px_0px_#000] space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-800 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari tugas, matkul, deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border-2 border-black rounded-xl text-xs outline-none transition-all text-slate-900 font-bold focus:bg-[#FFF5B7]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex bg-white p-0.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {(["Semua", "Belum", "Selesai"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-[10.5px] font-black cursor-pointer transition-all border ${
                      statusFilter === tab 
                        ? "bg-[#FF007F] text-white border-black shadow-[1.5px_1.5px_0px_0px_#000]" 
                        : "text-slate-800 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & active filters indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t-2 border-black">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-black uppercase">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "closest" | "farthest")}
                  className="px-2 py-1 bg-white border-2 border-black rounded-lg text-[10px] text-slate-900 font-bold outline-none cursor-pointer focus:bg-[#FFF5B7]"
                >
                  <option value="closest">Tenggat Terdekat</option>
                  <option value="farthest">Tenggat Terjauh</option>
                </select>
              </div>

              {selectedCalDate && (
                <div className="flex items-center gap-1.5 bg-[#FFF5B7] text-black font-black px-2.5 py-0.5 rounded border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                  <span>Tanggal: {selectedCalDate}</span>
                  <button onClick={() => setSelectedCalDate(null)} className="hover:text-red-600 font-black font-sans ml-1 text-xs">×</button>
                </div>
              )}
            </div>
          </div>

          {/* Subject Pills slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {subjectsList.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1 rounded-xl border-2 border-black text-[10.5px] font-black transition-all shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] ${
                  selectedSubject === sub
                    ? "bg-[#FF007F] text-white"
                    : "bg-white text-slate-900 hover:bg-[#FFF5B7]"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Core Deadline Grid */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="neo-box overflow-hidden flex flex-col justify-between p-5 bg-white h-56">
                    <div className="space-y-3.5">
                      <div className="h-5 w-20 neo-shimmer rounded-md" />
                      <div className="space-y-1.5">
                        <div className="h-6 w-3/4 neo-shimmer rounded-md" />
                        <div className="h-3 w-1/3 neo-shimmer rounded" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-3 w-full neo-shimmer rounded" />
                        <div className="h-3 w-5/6 neo-shimmer rounded" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-black/10">
                      <div className="h-7 w-20 neo-shimmer rounded-md" />
                      <div className="h-7 w-24 neo-shimmer rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#ffb7b2] border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_0px_#000]">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Tidak Ada Tugas Akademik</p>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-xs mx-auto font-bold">
                    Bagus! Seluruh tugas yang Anda cari sudah selesai atau tidak ada rilis dalam kategori ini.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sorted.map((a) => {
                  const status = getDeadlineStatus(a.dueDate, a.status === "Selesai");
                  const timerStr = getCountdownString(a.dueDate);
                  const isRed = status.label === "Terlambat" || status.label === "Mendekati Deadline";

                  return (
                    <div 
                      key={a.id}
                      className={`bg-white rounded-2xl border-3 border-black p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between hover:-translate-y-0.5 transition-all relative overflow-hidden ${
                        a.status === "Selesai" ? "bg-[#b5e2fa]/20" : ""
                      }`}
                    >
                      {/* Priority Corner Ribbon */}
                      {a.priority === "Tinggi" && (
                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                          <div className="absolute transform rotate-45 bg-[#FF007F] text-white text-[8px] font-black py-0.5 px-5 text-center -right-4 top-3 border-b border-black shadow">
                            HIGH
                          </div>
                        </div>
                      )}

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-black bg-[#e2bbfd] border-2 border-black px-2 py-0.5 rounded uppercase shadow-[1.5px_1.5px_0px_0px_#000]">
                            {a.subject}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1">{a.title}</h4>
                          <p className="text-[10px] text-slate-700 font-extrabold font-mono mt-0.5">Dosen: {a.lecturer}</p>
                        </div>

                        <p className="text-[10.5px] text-slate-700 font-bold leading-relaxed line-clamp-2">
                          {a.description}
                        </p>

                        {/* Realtime Countdown Timer Block */}
                        {a.status === "Belum" && (
                          <div className={`p-2.5 rounded-xl border-2 border-black flex items-center gap-2 text-[10.5px] font-black shadow-[2px_2px_0px_0px_#000] ${
                            isRed 
                              ? "bg-[#ffb7b2] text-black" 
                              : "bg-[#FFF5B7] text-black"
                          }`}>
                            <Clock className="w-3.5 h-3.5 text-black" />
                            <div className="flex-1 flex justify-between">
                              <span>Sisa Waktu:</span>
                              <span className="font-mono font-black">{timerStr}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Interactions */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-black/10">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDetailAssignment(a)}
                            className="p-1.5 bg-white hover:bg-[#98f5e1] text-slate-800 hover:text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
                            title="Lihat Detail Tugas"
                          >
                            <Eye className="w-3.5 h-3.5 font-black" />
                          </button>

                          {currentUser.role === "Admin" && (
                            <>
                              <button
                                onClick={() => openEditModal(a)}
                                className="p-1.5 bg-white hover:bg-[#FFF5B7] text-slate-800 hover:text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5 font-black" />
                              </button>
                              <button
                                onClick={() => handleDeleteAssignment(a.id)}
                                className="p-1.5 bg-white hover:bg-[#ffb7b2] text-slate-800 hover:text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5 font-black" />
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleToggleStatus(a.id)}
                          className={`px-3 py-1.5 border-2 border-black rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] ${
                            a.status === "Selesai"
                              ? "bg-emerald-500 text-white"
                              : "bg-white hover:bg-[#98f5e1] text-slate-900"
                          }`}
                        >
                          {a.status === "Selesai" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 fill-white text-emerald-600" />
                              <span>Selesai!</span>
                            </>
                          ) : (
                            <span>Tandai Selesai</span>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Interactive Calendar widget (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border-3 border-black shadow-[6px_6px_0px_0px_#000] p-4 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-black" />
                Kalender Tugas
              </h4>

              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 hover:bg-[#98f5e1] rounded-lg border border-black shadow-[1.5px_1.5px_0px_0px_#000] text-black bg-white"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-[11px] font-black text-slate-700 font-mono">
                  {currentMonth.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-[#98f5e1] rounded-lg border border-black shadow-[1.5px_1.5px_0px_0px_#000] text-black bg-white"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-800">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => (
                <span key={d} className="py-1">{d}</span>
              ))}

              {/* Empty days spacing */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days numbers */}
              {days.map((day) => {
                const dayStr = day.toISOString().split("T")[0];
                const dayAssignments = assignments.filter(a => a.dueDate.split("T")[0] === dayStr);
                const hasTask = dayAssignments.length > 0;
                const isSelected = selectedCalDate === dayStr;

                // Highlight today if match
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={dayStr}
                    onClick={() => {
                      setSelectedCalDate(isSelected ? null : dayStr);
                      onToast(hasTask ? `Ditemukan ${dayAssignments.length} tugas untuk tanggal ${dayStr}!` : `Tidak ada tugas di tanggal ${dayStr}.`, "info");
                    }}
                    className={`p-1.5 rounded-xl border-2 relative font-black flex flex-col items-center justify-center aspect-square transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] active:translate-y-[0.5px] ${
                      isSelected 
                        ? "bg-[#FF007F] border-black text-white"
                        : hasTask 
                          ? "bg-[#b5e2fa] border-black text-black"
                          : isToday
                            ? "bg-[#FFF5B7] border-black text-slate-900"
                            : "bg-white border-black text-slate-700 hover:bg-[#98f5e1]"
                    }`}
                  >
                    <span>{day.getDate()}</span>
                    {/* Tiny dots representing multiple tasks */}
                    {hasTask && !isSelected && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 bg-[#FF007F] rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FFF5B7] rounded-xl p-3 text-[10px] text-black leading-relaxed border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1 font-bold">
              <p className="font-black text-black">Panduan Kalender:</p>
              <p>• Hari dengan <span className="bg-[#b5e2fa] border border-black px-1 rounded font-black">Latar Biru</span> memiliki deadline.</p>
              <p>• Klik tanggal untuk memfilter daftar tugas tugas di sebelah kiri.</p>
            </div>

          </div>
        </div>

      </div>

      {/* DETAIL ASSIGNMENT VIEW MODAL */}
      <AnimatePresence>
        {detailAssignment && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg border border-slate-200/80 shadow-premium overflow-hidden"
            >
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-700 px-6 py-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-cyan-200 font-bold uppercase">
                    {detailAssignment.subject}
                  </span>
                  <span className="text-xs font-bold">Rincian Tugas</span>
                </div>
                <button onClick={() => setDetailAssignment(null)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">{detailAssignment.title}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold font-mono">Dosen Pengampu: {detailAssignment.lecturer}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase mb-1">Instruksi Detail:</h4>
                  <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{detailAssignment.description}</p>
                </div>

                {detailAssignment.notes && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <span className="font-bold block">Catatan Penting Dosen:</span>
                      <span>{detailAssignment.notes}</span>
                    </div>
                  </div>
                )}

                {/* Attachment File section */}
                {detailAssignment.attachment && (
                  <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 max-w-[180px] truncate">{detailAssignment.attachment.name}</p>
                        <p className="text-[9px] text-slate-400">Ukuran: {detailAssignment.attachment.size}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulateDownload(detailAssignment.attachment?.name || "file.pdf")}
                      className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <span className="text-[9px] text-rose-500 font-bold uppercase block">Deadline Pengumpulan</span>
                    <span className="font-mono font-bold text-rose-700 mt-0.5 block">{new Date(detailAssignment.dueDate).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Status Kumpul</span>
                    <span className={`font-bold mt-0.5 block ${detailAssignment.status === "Selesai" ? "text-emerald-600" : "text-amber-600"}`}>
                      {detailAssignment.status === "Selesai" ? "Sudah Dikumpulkan" : "Belum Dikumpulkan"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleToggleStatus(detailAssignment.id);
                      setDetailAssignment(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-center text-white ${
                      detailAssignment.status === "Selesai" 
                        ? "bg-slate-500 hover:bg-slate-600"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                    }`}
                  >
                    {detailAssignment.status === "Selesai" ? "Batalkan Selesai" : "Tandai Selesai Sekarang"}
                  </button>
                  
                  <button
                    onClick={() => setDetailAssignment(null)}
                    className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN CRUD MODAL */}
      <AnimatePresence>
        {isCrudOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-xl border border-slate-200/80 shadow-premium overflow-hidden"
            >
              <div className="bg-gradient-to-tr from-rose-500 to-orange-500 px-6 py-4 text-white flex justify-between items-center">
                <h3 className="text-sm font-bold font-display">{editingId ? "Edit Deadline Tugas" : "Rilis Tugas Baru"}</h3>
                <button onClick={() => setIsCrudOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCrudSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Mata Kuliah</label>
                    <input
                      type="text"
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. Pemrograman Web Lanjut"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Dosen Pengampu</label>
                    <input
                      type="text"
                      required
                      value={formLecturer}
                      onChange={(e) => setFormLecturer(e.target.value)}
                      placeholder="e.g. Dr. Eng. Hermawan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Judul Tugas / Ringkasan</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Pembuatan REST API Login & Auth"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Instruksi & Detail Tugas</label>
                  <textarea
                    required
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Tuliskan instruksi dari dosen pengampu..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Deadline (Tanggal & Jam)</label>
                    <input
                      type="datetime-local"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Skala Prioritas</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as "Tinggi" | "Sedang" | "Biasa")}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                    >
                      <option value="Tinggi">Tinggi (Paling Urgent)</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Biasa">Biasa (Santai)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contoh: Kumpul wajib format PDF. No plagiarisme."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama File Lampiran (Opsional)</label>
                  <input
                    type="text"
                    value={formAttachName}
                    onChange={(e) => setFormAttachName(e.target.value)}
                    placeholder="Contoh: Modul_Pertemuan_5.pdf"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingId ? "Simpan Perubahan Tugas 📝" : "Rilis Tugas Baru Sekarang 🚀"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
