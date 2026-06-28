import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smile, Send, Sparkles, X, Image as ImageIcon } from "lucide-react";

interface NewPhotoMemoryModalProps {
  onAddPhoto: (title: string, description: string, category: "Kuliah" | "Makrab" | "Wisuda" | "Santai" | "Project", imageUrl: string, date: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewPhotoMemoryModal({
  onAddPhoto,
  isOpen,
  onClose,
}: NewPhotoMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Kuliah" | "Makrab" | "Wisuda" | "Santai" | "Project">("Kuliah");
  const [imageUrl, setImageUrl] = useState("");
  const [date, setDate] = useState("");

  const presets = [
    { name: "Begadang Coding 💻", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" },
    { name: "Kelas Lab Rame 🎓", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" },
    { name: "Nongkrong Santai ☕", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80" },
    { name: "Hari Wisuda / Sukses 🎉", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80" },
    { name: "Library Study 📚", url: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80" },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      const finalImgUrl = imageUrl.trim() || presets[0].url;
      const finalDate = date.trim() || "Hari Ini";
      onAddPhoto(title.trim(), description.trim(), category, finalImgUrl, finalDate);
      
      // Reset
      setTitle("");
      setDescription("");
      setImageUrl("");
      setDate("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[32px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-slate-100 border-2 border-black flex items-center justify-center hover:bg-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>

        <h3 className="text-2xl font-black font-display text-slate-900 mb-2 flex items-center gap-1.5">
          <ImageIcon className="w-6 h-6 text-[#FF6B6B]" />
          Tambah Memori Foto Baru 📸
        </h3>
        <p className="text-slate-500 font-bold text-xs mb-5">
          Abadikan foto momen seru, wisuda, atau sekadar nongkrong bareng teman sekelas!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Judul Kenangan
              </label>
              <input
                type="text"
                placeholder="e.g. Makrab Seru Lembang"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Kapan Kejadiannya? (Tanggal/Bulan)
              </label>
              <input
                type="text"
                placeholder="e.g. 15 Juni 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">
              Pilih Kategori Kegiatan
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(["Kuliah", "Makrab", "Wisuda", "Santai", "Project"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border-2 border-black font-black text-xs cursor-pointer transition-all ${
                    category === cat
                      ? "bg-black text-[#FFD93D] shadow-none"
                      : "bg-white hover:bg-slate-50 text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">
              Pilih Foto Preset Seru ATAU Masukkan URL Foto Sendiri
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {presets.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`p-2 rounded-xl border-2 border-black text-left text-[10px] font-black transition-all overflow-hidden ${
                      isSelected ? "bg-[#FFD93D] text-black scale-95" : "bg-slate-50 hover:bg-white text-slate-700"
                    }`}
                  >
                    <div className="h-14 rounded-lg overflow-hidden border border-black mb-1 select-none">
                      <img src={preset.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate block">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="url"
              placeholder="Atau tempel link gambar custom kamu di sini (http...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">
              Tulis Cerita Singkat / Nostalgia
            </label>
            <textarea
              placeholder="Ceritakan momen serunya, kekocakan apa yang terjadi, atau pesan hangatnya..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={400}
              className="w-full px-3 py-2 bg-white rounded-xl border-2 border-black text-xs font-bold resize-none"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t-2 border-slate-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border-2 border-black font-black text-xs uppercase"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="bg-[#6BCB77] hover:bg-[#5bb866] text-slate-950 font-black px-5 py-2 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs uppercase"
            >
              Posting Kenangan 🎉
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
