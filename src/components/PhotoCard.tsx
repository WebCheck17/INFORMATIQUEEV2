import React, { useState } from "react";
import { ClassPhotoMemory } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageSquare, CornerDownRight, Calendar, User, Trash2 } from "lucide-react";

interface PhotoCardProps {
  key?: React.Key;
  photo: ClassPhotoMemory;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  currentUser: { name: string; initials: string; bgColor: string };
}

export default function PhotoCard({
  photo,
  onLike,
  onDelete,
  onAddComment,
  currentUser,
}: PhotoCardProps) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(photo.id, commentText.trim());
      setCommentText("");
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Kuliah": return "#4D96FF";
      case "Makrab": return "#FF6B6B";
      case "Wisuda": return "#FFD93D";
      case "Santai": return "#9b5de5";
      case "Project": return "#6BCB77";
      default: return "#f15bb5";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      id={`photo-memory-${photo.id}`}
      className="bg-white rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Memory Photo Banner */}
        <div className="relative rounded-2xl border-4 border-black overflow-hidden aspect-[4/3] bg-slate-100 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
          {/* Category overlay */}
          <span
            className="absolute top-3 left-3 text-xs font-black uppercase tracking-wider text-slate-900 px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono"
            style={{ backgroundColor: getCategoryColor(photo.category) }}
          >
            {photo.category}
          </span>
          
          <span className="absolute bottom-3 right-3 text-[10px] font-black tracking-wider bg-black text-white px-2.5 py-1 rounded-md border border-white flex items-center gap-1.5 font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            <Calendar className="w-3.5 h-3.5 text-[#FF6B6B]" />
            {photo.date}
          </span>
        </div>

        {/* Info Area */}
        <div className="mb-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-xl md:text-2xl font-black font-display text-slate-900 leading-tight">
              {photo.title}
            </h3>
            {onDelete && (
              <button
                onClick={() => onDelete(photo.id)}
                className="p-1.5 bg-[#FF6B6B]/15 hover:bg-[#FF6B6B] hover:text-white rounded-lg border-2 border-transparent hover:border-black text-slate-500 cursor-pointer transition-all"
                title="Hapus Memori"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200">
            {photo.description}
          </p>
        </div>
      </div>

      {/* Interactions bar */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100 mt-auto">
        <div className="flex gap-2.5">
          {/* Like Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => onLike(photo.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all cursor-pointer ${
              photo.hasLiked
                ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-slate-800 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <Heart className={`w-4 h-4 ${photo.hasLiked ? "fill-white" : ""}`} />
            <span>{photo.likes}</span>
          </motion.button>

          {/* Comment toggle Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs bg-white text-slate-800 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{photo.comments.length}</span>
          </button>
        </div>

        <span className="text-[9px] font-black tracking-widest font-mono text-slate-400">
          MEMORI KELAS
        </span>
      </div>

      {/* Expandable comments for Photo Memories */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t-2 border-slate-200 space-y-3 bg-[#FFD93D]/5 p-3 rounded-2xl border-2 border-black"
          >
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
              {photo.comments.length === 0 ? (
                <p className="text-center font-bold text-[10px] text-slate-400 py-3">
                  Belum ada komentar. Jadi yang pertama bercerita! 💬
                </p>
              ) : (
                photo.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 items-start text-xs font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-black">
                    <CornerDownRight className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="leading-tight overflow-hidden flex-1">
                      <div className="flex justify-between items-center gap-1.5">
                        <span className="font-black text-slate-900 block truncate">{comment.authorName}</span>
                        <span className="text-[9px] font-bold text-slate-400 shrink-0">{comment.time}</span>
                      </div>
                      <p className="mt-0.5 text-slate-600 font-normal break-words leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Tulis nostalgia kamu..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl border-2 border-black font-bold text-xs focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-[#4D96FF] hover:bg-[#3d85eb] text-white font-black text-xs px-3.5 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                Kirim
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
