import React, { useState } from "react";
import { UserProfile } from "../types";
import { motion } from "motion/react";
import { X, Check, Award, ShieldAlert, Sparkles, CheckCircle } from "lucide-react";

interface ProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UserProfile>) => void;
}

export default function ProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
}: ProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [initials, setInitials] = useState(user.initials);
  const [bgColor, setBgColor] = useState(user.bgColor);
  const [role, setRole] = useState(user.role);

  if (!isOpen) return null;

  const colors = [
    { value: "#6BCB77", label: "Hijau" },
    { value: "#FFD93D", label: "Kuning" },
    { value: "#4D96FF", label: "Biru" },
    { value: "#FF6B6B", label: "Merah" },
    { value: "#9b5de5", label: "Ungu" },
    { value: "#f15bb5", label: "Pink" },
  ];

  const roles = [
    "Ketua Kelas",
    "Wakil Ketua",
    "Sekretaris",
    "Bendahara",
    "Warga Kelas",
    "Seksi Perlengkapan",
    "Seksi Dokumentasi"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && initials.trim() && role) {
      onSave({
        name: name.trim(),
        initials: initials.trim().toUpperCase().substring(0, 2),
        bgColor,
        role,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-premium max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-tr from-rose-500 to-orange-500 px-6 py-4 text-white flex justify-between items-center">
          <h3 className="text-sm font-bold font-display flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Profil Warga Kelas
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-white"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Preview Badge */}
          <div className="flex justify-center py-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center font-bold text-2xl text-white shadow-md"
                style={{ backgroundColor: bgColor }}
              >
                {initials || "??"}
              </div>
              <span className="font-extrabold text-sm text-slate-800 mt-2.5 leading-none">
                {name || "Nama Kamu"}
              </span>
              <span className="text-[9.5px] font-extrabold text-white px-2 py-0.5 rounded mt-1.5 bg-slate-900 tracking-wide font-mono">
                {role}
              </span>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                const parts = e.target.value.trim().split(" ");
                if (parts.length >= 2) {
                  setInitials((parts[0][0] + parts[1][0]).toUpperCase());
                } else if (parts[0]) {
                  setInitials(parts[0].substring(0, 2).toUpperCase());
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white text-slate-800"
              placeholder="e.g. Budi Santoso"
              required
            />
          </div>

          {/* Initials & Role block */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Inisial Avatar
              </label>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase().substring(0, 2))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white text-slate-800 uppercase"
                placeholder="BS"
                maxLength={2}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Jabatan / Peran
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white text-slate-800"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Avatar theme color */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Warna Tema Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setBgColor(color.value)}
                  className={`w-7 h-7 rounded-full cursor-pointer relative transition-all ${
                    bgColor === color.value ? "scale-110 ring-2 ring-indigo-500 ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {bgColor === color.value && (
                    <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto font-black" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Simpan Profil ✨
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
