import React, { useState } from "react";
import { motion } from "motion/react";
import { Smile, Send, Sparkles, X } from "lucide-react";

interface NewPostCardProps {
  onAddPost: (content: string, category: string, bgColor: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewPostCard({
  onAddPost,
  isOpen,
  onClose,
}: NewPostCardProps) {
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("#GENERAL");
  const [selectedBg, setSelectedBg] = useState("#FF6B6B"); // Default Red

  const tags = ["#GENERAL", "#DESIGN", "#TRAVEL", "#LIFESTYLE", "#MUSIC"];
  const colors = [
    { value: "#FF6B6B", label: "Red" },
    { value: "#4D96FF", label: "Blue" },
    { value: "#6BCB77", label: "Green" },
    { value: "#FFD93D", label: "Yellow" },
    { value: "#9b5de5", label: "Purple" },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAddPost(content.trim(), selectedTag, selectedBg);
      setContent("");
      setSelectedTag("#GENERAL");
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="bg-white p-6 rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 overflow-hidden relative"
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-slate-100">
        <h3 className="text-xl font-black font-display text-slate-900 flex items-center gap-1.5">
          <Smile className="w-5 h-5 text-[#FF6B6B]" />
          Create a Haloo Update
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-black flex items-center justify-center hover:bg-slate-200 cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-700" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Color Palette & Custom Post Preview Block */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-500 mb-2">
            Select Accent Card Background
          </label>
          <div className="flex gap-2.5">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedBg(color.value)}
                className={`w-7 h-7 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 cursor-pointer ${
                  selectedBg === color.value ? "scale-110 border-slate-900 shadow-none ring-4 ring-slate-100" : ""
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Dynamic preview textbox */}
        <div
          className="rounded-2xl border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
          style={{ backgroundColor: `${selectedBg}15` }} // 15% opacity
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your positive thought today? Say haloo to the feed..."
            maxLength={280}
            rows={3}
            className="w-full bg-transparent border-0 font-bold text-slate-800 placeholder-slate-500 focus:ring-0 focus:outline-none text-base resize-none"
            required
          />
          <div className="flex justify-end text-[10px] font-black text-slate-400 mt-2">
            {content.length}/280 Characters
          </div>
        </div>

        {/* Tag selection & Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Select Tag Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-lg border-2 border-black font-black text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-black text-[#FFD93D] shadow-none translate-y-0.5"
                        : "bg-white hover:bg-slate-50 text-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            id="publish-post-btn"
            className="self-end sm:self-center bg-[#6BCB77] hover:bg-[#5bb566] text-black font-black py-3 px-5 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 uppercase text-xs tracking-wider cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Share Haloo!
          </button>
        </div>
      </form>
    </motion.div>
  );
}
