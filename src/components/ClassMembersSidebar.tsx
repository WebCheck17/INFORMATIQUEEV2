import React, { useState } from "react";
import { StudentFriend, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Smile, Flame, Users, Sparkles, CheckCircle2 } from "lucide-react";

interface ClassMembersSidebarProps {
  friends: StudentFriend[];
  onAddFriend: (name: string) => void;
  onToggleOnline: (id: string) => void;
  user: UserProfile;
  onCheckIn: () => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function ClassMembersSidebar({
  friends,
  onAddFriend,
  onToggleOnline,
  user,
  onCheckIn,
  onToast,
}: ClassMembersSidebarProps) {
  const [search, setSearch] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [pokeTarget, setPokeTarget] = useState<string | null>(null);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePoke = (friendName: string) => {
    setPokeTarget(friendName);
    onToast(`Menyapa @${friendName.replace(" ", "_").toLowerCase()}! 👋`, "success");
    setTimeout(() => {
      setPokeTarget(null);
    }, 2500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendName.trim()) {
      onAddFriend(newFriendName.trim());
      onToast(`${newFriendName} sukses ditambahkan sebagai warga kelas!`, "success");
      setNewFriendName("");
      setShowAddForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      
      {/* Daily Streak Check-in */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-premium relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
            Mood & Keaktifan
          </span>
          <Flame className={`w-7 h-7 ${user.hasCheckedIn ? "text-orange-500 fill-orange-500 animate-pulse" : "text-slate-300"} transition-all`} />
        </div>
        
        <p className="text-xl font-display font-extrabold text-slate-800 tracking-tight mt-1">
          {user.streakDays} Hari Beruntun
        </p>
        <p className="font-bold text-slate-500 text-[10px] mt-1 mb-4 leading-normal">
          {user.hasCheckedIn
            ? "Hebat! Presensi harian Anda terekam sistem. 🔥"
            : "Klik tombol di bawah untuk absen kehadiran kuliah hari ini."}
        </p>

        <button
          disabled={user.hasCheckedIn}
          onClick={onCheckIn}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
            user.hasCheckedIn
              ? "bg-emerald-50 text-emerald-600 cursor-default border border-emerald-150"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95"
          }`}
        >
          {user.hasCheckedIn ? (
            <span className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-white" />
              Presensi Selesai
            </span>
          ) : "Absen Kehadiran ✍️"}
        </button>
      </div>

      {/* Classmates Sidebar widget */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-premium">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            Warga Kelas
          </h2>
          <button
            onClick={() => {
              if (user.role === "Guest") {
                onToast("Tolong login terlebih dahulu untuk menambah warga kelas!", "info");
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all"
            title="Tambah Mahasiswa"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add Student Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddSubmit}
              className="mb-3 overflow-hidden"
            >
              <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Nama lengkap..."
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-transparent font-semibold text-slate-800 text-[10px] focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Search through class roster */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Cari teman kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-[10.5px] font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Class list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredFriends.length === 0 ? (
            <p className="text-slate-400 font-bold text-center text-[10px] py-4">
              Tidak ada mahasiswa ditemukan.
            </p>
          ) : (
            filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 p-2 rounded-xl border border-slate-100 transition-all"
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    onClick={() => {
                      if (user.role === "Admin") {
                        onToggleOnline(friend.id);
                        onToast(`Status online ${friend.name} diperbarui!`, "info");
                      } else {
                        onToast("Hanya Admin yang berhak mengubah status kehadiran!", "error");
                      }
                    }}
                    title="Klik untuk Toggle Online (Admin Saja)"
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-800 cursor-pointer relative shrink-0"
                    style={{ backgroundColor: friend.avatarColor }}
                  >
                    {friend.initials}
                    <span
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                        friend.isOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden max-w-[110px]">
                    <span className="font-bold text-[11px] text-slate-700 leading-tight truncate">
                      {friend.name}
                    </span>
                    <span className="text-[8.5px] font-medium text-slate-400 truncate mt-0.5" title={friend.status}>
                      {friend.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePoke(friend.name)}
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Sapa"
                >
                  👋
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total stats */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 font-bold text-[9px] uppercase tracking-wider font-mono">
          <span>{friends.filter((f) => f.isOnline).length} Online</span>
          <span>•</span>
          <span>{friends.length} Mahasiswa</span>
        </div>
      </div>

    </div>
  );
}
