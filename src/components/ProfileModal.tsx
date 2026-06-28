import React, { useState, useEffect, useRef, useCallback } from "react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Check,
  Sparkles,
  Camera,
  Loader2,
  AlertCircle,
  Upload,
  User,
  Pencil,
  Shield,
  Users,
} from "lucide-react";
import { api } from "../services/api";
import { getAvatarUrl } from "../services/imageHelper";

// ─── Backend response format ─────────────────────────────────────────
interface BackendUser {
  id: string | number;
  username: string;
  name: string;
  email?: string;
  nim?: string;
  kelas?: string;
  jurusan?: string;
  bio?: string;
  role: string;        // "admin" | "member" (backend only)
  jabatan?: string;    // "Ketua Kelas" | "Wakil Ketua" | "Sekretaris" | dll
  avatar?: string;
  gender?: string;
  bgColor?: string;
  initials?: string;
}

// ─── Props ─────────────────────────────────────────────────────────
interface ProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updates: Partial<UserProfile>) => void;
  onToast?: (msg: string, type?: "success" | "error" | "info") => void;
}

// ─── Helper: map backend → frontend ────────────────────────────────
const mapBackendToFrontend = (u: BackendUser): UserProfile => ({
  id: u.id,
  username: u.username,
  name: u.name,
  nim: u.nim || "-",
  kelas: u.kelas || "15.5A.02",
  jurusan: u.jurusan || "Teknik Informatika",
  bio: u.bio || "",
  email: u.email || "",
  role: u.jabatan || u.role || "Warga Kelas", // Display: jabatan, fallback ke role
  jabatan: u.jabatan,
  avatar: u.avatar,
  gender: u.gender,
  bgColor: u.bgColor || "#4D96FF",
  initials: u.initials || u.name?.substring(0, 2).toUpperCase() || "??",
  photoUrl: getAvatarUrl(u.avatar, u.gender),
});

// ─── Component ─────────────────────────────────────────────────────
export default function ProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
  onToast,
}: ProfileModalProps) {
  // ── Local form state ───────────────────────────────────────────
  const [name, setName] = useState(user.name);
  const [initials, setInitials] = useState(user.initials || "");
  const [bgColor, setBgColor] = useState(user.bgColor || "#4D96FF");
  const [role, setRole] = useState<"admin" | "member">(
    (user.role === "admin" || user.role === "Admin") ? "admin" : "member"
  );
  const [jabatan, setJabatan] = useState(user.jabatan || "Warga Kelas");
  const [bio, setBio] = useState(user.bio || "");
  const [gender, setGender] = useState<"male" | "female">(
    (user.gender as "male" | "female") || "male"
  );

  // ── Avatar state ───────────────────────────────────────────────
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Loading & error states ─────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Data dari backend (real-time) ──────────────────────────────
  const [backendUser, setBackendUser] = useState<UserProfile | null>(null);

  // ── Jabatan options (display only, stored in jabatan column) ─────
  const jabatanOptions = [
    "Ketua Kelas",
    "Wakil Ketua",
    "Sekretaris",
    "Bendahara",
    "Warga Kelas",
    "Seksi Perlengkapan",
    "Seksi Dokumentasi",
  ];

  const colors = [
    { value: "#6BCB77", label: "Hijau" },
    { value: "#FFD93D", label: "Kuning" },
    { value: "#4D96FF", label: "Biru" },
    { value: "#FF6B6B", label: "Merah" },
    { value: "#9b5de5", label: "Ungu" },
    { value: "#f15bb5", label: "Pink" },
    { value: "#00bbf9", label: "Cyan" },
    { value: "#fb5607", label: "Orange" },
  ];

  // ── Fetch real user data saat modal open ───────────────────────
  const fetchUserData = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await api.getMe();
      const mapped = mapBackendToFrontend(data as BackendUser);
      setBackendUser(mapped);

      // Sync form state dengan data terbaru
      setName(mapped.name);
      setInitials(mapped.initials || "");
      setBgColor(mapped.bgColor || "#4D96FF");
      setRole((mapped.role === "admin" || mapped.role === "Admin") ? "admin" : "member");
      setJabatan(mapped.jabatan || "Warga Kelas");
      setBio(mapped.bio || "");
      setGender((mapped.gender as "male" | "female") || "male");
    } catch (err: any) {
      setFetchError(err.message || "Gagal memuat data profil");
      onToast?.("Gagal memuat data profil: " + err.message, "error");
    } finally {
      setIsFetching(false);
    }
  }, [onToast]);

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, fetchUserData]);

  // ── Auto-generate initials dari nama ──────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    const parts = newName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) {
      setInitials((parts[0][0] + parts[1][0]).toUpperCase());
    } else if (parts[0]) {
      setInitials(parts[0].substring(0, 2).toUpperCase());
    } else {
      setInitials("");
    }
  };

  // ── Handle avatar file selection ────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 2MB");
      onToast?.("Ukuran file maksimal 2MB", "error");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format file harus JPG, PNG, atau WebP");
      onToast?.("Format file harus JPG, PNG, atau WebP", "error");
      return;
    }

    setError(null);
    setAvatarFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ── Submit handler ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !initials.trim()) {
      setError("Nama dan inisial wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      const userId = backendUser?.id || user.id;
      let avatarPath = backendUser?.avatar || user.avatar;

      // 1. Upload avatar dulu kalau ada file baru
      if (avatarFile) {
        try {
          const uploadRes = await api.uploadAvatar(avatarFile);
          avatarPath = uploadRes.avatarPath || uploadRes.avatarUrl;
        } catch (uploadErr: any) {
          throw new Error("Gagal upload avatar: " + uploadErr.message);
        }
      }

      // 2. Update profil ke backend
      const updateData = {
        name: name.trim(),
        initials: initials.trim().toUpperCase().substring(0, 2),
        bgColor,
        role,              // "admin" | "member"
        jabatan,           // "Ketua Kelas" | "Wakil Ketua" | dll
        bio: bio.trim(),
        gender,
        ...(avatarPath && { avatar: avatarPath }),
      };

      const updated = await api.updateUser(userId, updateData);

      // 3. Map response & notify parent
      const mappedUpdated = mapBackendToFrontend(updated as BackendUser);
      onSave?.(mappedUpdated);
      onToast?.("Profil berhasil diperbarui! ✨", "success");

      // Cleanup
      setAvatarFile(null);
      setAvatarPreview(null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan");
      onToast?.(err.message || "Gagal menyimpan profil", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Reset saat close ───────────────────────────────────────────
  const handleClose = () => {
    setError(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    onClose();
  };

  // ── Determine display values ────────────────────────────────────
  const displayUser = backendUser || user;
  const currentAvatarUrl =
    avatarPreview || getAvatarUrl(displayUser.avatar, displayUser.gender);

  if (!isOpen) return null;

  // ═════════════════════════════════════════════════════════════════
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="bg-white rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═══════ HEADER ═══════ */}
            <div className="bg-gradient-to-tr from-rose-500 to-orange-500 px-6 py-4 text-white flex justify-between items-center border-b-2 border-slate-900">
              <h3 className="text-sm font-black flex items-center gap-2 tracking-tight">
                <Sparkles className="w-4 h-4" />
                Profil Warga Kelas
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ═══════ FETCHING STATE ═══════ */}
            {isFetching && (
              <div className="p-8 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-slate-600">
                  Memuat data profil...
                </p>
              </div>
            )}

            {/* ═══════ FETCH ERROR ═══════ */}
            {fetchError && !isFetching && (
              <div className="p-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Gagal memuat data
                    </p>
                    <p className="text-xs text-red-600 mt-1">{fetchError}</p>
                    <button
                      onClick={fetchUserData}
                      className="mt-2 text-xs font-bold text-red-700 underline hover:no-underline"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ FORM ═══════ */}
            {!isFetching && !fetchError && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* ── Preview Badge with Avatar Upload ── */}
                <div className="flex justify-center py-5 bg-slate-50 rounded-2xl border-2 border-slate-200 relative">
                  <div className="flex flex-col items-center">
                    {/* Avatar Container - SELALU pakai getAvatarUrl */}
                    <div className="relative group">
                      <img
                        src={currentAvatarUrl}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full border-3 border-white shadow-lg object-cover bg-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getAvatarUrl(
                            undefined,
                            gender
                          );
                        }}
                      />

                      {/* Upload Overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Change avatar text */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      Ganti Foto
                    </button>

                    {/* Name & Jabatan (bukan role) */}
                    <span className="font-black text-sm text-slate-900 mt-2 leading-none">
                      {name.trim() || "Nama Kamu"}
                    </span>
                    <span className="text-[10px] font-black text-white px-2.5 py-1 rounded-md mt-1.5 bg-slate-900 tracking-wide font-mono uppercase">
                      {jabatan}
                    </span>
                  </div>
                </div>

                {/* ── Error Banner ── */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-start gap-2 overflow-hidden"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-red-700">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Name ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 focus:shadow-[3px_3px_0px_0px_rgba(99,102,241,0.3)] text-slate-800 transition-all"
                      placeholder="e.g. Budi Santoso"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* ── Initials ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    Inisial Avatar
                  </label>
                  <div className="relative">
                    <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={initials}
                      onChange={(e) =>
                        setInitials(e.target.value.toUpperCase().substring(0, 2))
                      }
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 focus:shadow-[3px_3px_0px_0px_rgba(99,102,241,0.3)] text-slate-800 uppercase transition-all"
                      placeholder="BS"
                      maxLength={2}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* ── Role (admin/member) ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    Role Sistem
                  </label>
                  <div className="flex gap-2">
                    {(["admin", "member"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 ${
                          role === r
                            ? r === "admin"
                              ? "bg-amber-500 border-amber-600 text-white shadow-[3px_3px_0px_0px_rgba(217,119,6,0.4)]"
                              : "bg-indigo-600 border-indigo-700 text-white shadow-[3px_3px_0px_0px_rgba(79,70,229,0.4)]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                        disabled={isLoading}
                      >
                        {r === "admin" ? (
                          <Shield className="w-3.5 h-3.5" />
                        ) : (
                          <Users className="w-3.5 h-3.5" />
                        )}
                        {r === "admin" ? "Admin" : "Member"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Jabatan (display only) ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    Jabatan / Peran
                  </label>
                  <select
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 focus:shadow-[3px_3px_0px_0px_rgba(99,102,241,0.3)] text-slate-800 transition-all appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {jabatanOptions.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ── Bio ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 focus:shadow-[3px_3px_0px_0px_rgba(99,102,241,0.3)] text-slate-800 transition-all resize-none"
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={2}
                    maxLength={160}
                    disabled={isLoading}
                  />
                  <p className="text-[10px] text-slate-400 font-bold text-right mt-1">
                    {bio.length}/160
                  </p>
                </div>

                {/* ── Gender ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    Gender
                  </label>
                  <div className="flex gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                          gender === g
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-[3px_3px_0px_0px_rgba(79,70,229,0.4)]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                        disabled={isLoading}
                      >
                        {g === "male" ? "👨 Laki-laki" : "👩 Perempuan"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Avatar Color ── */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">
                    Warna Tema Avatar
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setBgColor(color.value)}
                        className={`w-9 h-9 rounded-full cursor-pointer relative transition-all duration-200 hover:scale-110 ${
                          bgColor === color.value
                            ? "scale-110 ring-[3px] ring-slate-900 ring-offset-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                            : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"
                        }`}
                        style={{ backgroundColor: color.value }}
                        aria-label={`Pilih warna ${color.label}`}
                        title={color.label}
                        disabled={isLoading}
                      >
                        {bgColor === color.value && (
                          <Check className="w-4 h-4 text-white absolute inset-0 m-auto stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Buttons ── */}
                <div className="flex gap-3 pt-4 border-t-2 border-slate-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black py-2.5 rounded-xl text-xs border-2 border-slate-200 transition-all disabled:opacity-50"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black py-2.5 rounded-xl text-xs border-2 border-indigo-700 shadow-[3px_3px_0px_0px_rgba(67,56,202,1)] hover:shadow-[2px_2px_0px_0px_rgba(67,56,202,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Simpan Profil
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
