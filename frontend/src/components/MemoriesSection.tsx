import React, { useState, useEffect } from "react";
import { ClassPhotoMemory, Comment, CommentReply, UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  MessageCircle, 
  CornerDownRight, 
  Calendar, 
  Eye, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Pin, 
  Video, 
  Image as ImageIcon 
} from "lucide-react";

interface MemoriesProps {
  memories: ClassPhotoMemory[];
  currentUser: UserProfile;
  onUpdateMemories: (updated: ClassPhotoMemory[]) => void;
  onAddLog: (action: string, details: string) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  onTriggerNotification: (type: "like" | "comment" | "reply" | "upload", title: string, message: string) => void;
}

export default function MemoriesSection({ 
  memories, 
  currentUser, 
  onUpdateMemories, 
  onAddLog, 
  onToast,
  onTriggerNotification
}: MemoriesProps) {
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState<"newest" | "trending">("newest");
  const [isLoading, setIsLoading] = useState(true);

  // Simulated latency for skeleton loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedCategory, sortBy]);

  // State: Lightbox
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // State: Create Post Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImageUrls, setNewImageUrls] = useState<string>(""); // Comma separated for multiples
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Kuliah");
  const [newTagsString, setNewTagsString] = useState(""); // Comma separated

  // State: Editing Comment ID
  const [editingCommentId, setEditingCommentId] = useState<{postId: string, commentId: string} | null>(null);
  const [editingText, setEditingText] = useState("");

  // State: Reply Comment ID
  const [replyingCommentId, setReplyingCommentId] = useState<{postId: string, commentId: string} | null>(null);
  const [replyText, setReplyText] = useState("");

  // Local state for active input of comments
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});

  const handleLike = (post: ClassPhotoMemory) => {
    if (currentUser.role === "Guest") {
      onToast("Tolong login terlebih dahulu untuk menyukai postingan!", "info");
      return;
    }

    const updated = memories.map(m => {
      if (m.id === post.id) {
        const liked = !m.hasLiked;
        
        // Log & Notification trigger
        if (liked) {
          onAddLog("Like", `Menyukai postingan kenangan: ${m.title}`);
          if (m.uploaderName !== currentUser.name) {
            onTriggerNotification(
              "like",
              "Postingan Anda disukai",
              `${currentUser.name} menyukai postingan Anda: "${m.title}"`
            );
          }
        }
        
        return {
          ...m,
          likes: liked ? m.likes + 1 : Math.max(0, m.likes - 1),
          hasLiked: liked
        };
      }
      return m;
    });
    onUpdateMemories(updated);
  };

  const handleBookmark = (postId: string) => {
    if (currentUser.role === "Guest") {
      onToast("Tolong login terlebih dahulu untuk bookmark postingan!", "info");
      return;
    }
    const updated = memories.map(m => {
      if (m.id === postId) {
        const bookmarked = !m.isBookmarked;
        onToast(bookmarked ? "Postingan berhasil disimpan ke bookmark!" : "Postingan dihapus dari bookmark.", "success");
        return { ...m, isBookmarked: bookmarked };
      }
      return m;
    });
    onUpdateMemories(updated);
  };

  const handleShare = (post: ClassPhotoMemory) => {
    const dummyLink = `${window.location.origin}/#/memories?id=${post.id}`;
    navigator.clipboard.writeText(dummyLink);
    onToast("Link postingan berhasil disalin ke clipboard! 📋", "success");
    onAddLog("Download", `Membagikan postingan: ${post.title}`);
  };

  const handleDeletePost = (postId: string) => {
    if (currentUser.role !== "Admin") {
      onToast("Hanya Admin yang berhak menghapus postingan!", "error");
      return;
    }
    const filtered = memories.filter(m => m.id !== postId);
    onUpdateMemories(filtered);
    onToast("Postingan berhasil dihapus!", "success");
    onAddLog("Delete", `Menghapus postingan ID: ${postId}`);
  };

  // Add primary comment
  const handleAddComment = (postId: string) => {
    if (currentUser.role === "Guest") {
      onToast("Tolong login terlebih dahulu untuk memberikan komentar!", "info");
      return;
    }

    const text = commentInputs[postId] || "";
    if (!text.trim()) return;

    const updated = memories.map(m => {
      if (m.id === postId) {
        const newComment: Comment = {
          id: "c_" + Date.now().toString(),
          authorName: currentUser.name,
          authorAvatar: currentUser.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          text: text.trim(),
          time: "Baru saja",
          replies: []
        };
        
        if (m.uploaderName !== currentUser.name) {
          onTriggerNotification(
            "comment",
            "Komentar Baru",
            `${currentUser.name} berkomentar pada postingan Anda: "${text.substring(0, 20)}..."`
          );
        }

        onAddLog("Comment", `Memberikan komentar pada postingan: ${m.title}`);
        return {
          ...m,
          comments: [...m.comments, newComment]
        };
      }
      return m;
    });

    onUpdateMemories(updated);
    setCommentInputs({ ...commentInputs, [postId]: "" });
    onToast("Komentar berhasil ditambahkan!", "success");
  };

  // Delete comment
  const handleDeleteComment = (postId: string, commentId: string) => {
    const updated = memories.map(m => {
      if (m.id === postId) {
        const filteredComments = m.comments.filter(c => c.id !== commentId);
        return { ...m, comments: filteredComments };
      }
      return m;
    });
    onUpdateMemories(updated);
    onToast("Komentar berhasil dihapus!", "success");
    onAddLog("Delete", "Menghapus komentar postingan.");
  };

  // Edit comment
  const handleSaveEditComment = (postId: string, commentId: string) => {
    if (!editingText.trim()) return;

    const updated = memories.map(m => {
      if (m.id === postId) {
        const updatedComments = m.comments.map(c => {
          if (c.id === commentId) {
            return { ...c, text: editingText.trim() };
          }
          return c;
        });
        return { ...m, comments: updatedComments };
      }
      return m;
    });
    onUpdateMemories(updated);
    setEditingCommentId(null);
    setEditingText("");
    onToast("Komentar berhasil diperbarui!", "success");
    onAddLog("Edit", "Mengubah komentar postingan.");
  };

  // Reply comment (Nested Comment Replies)
  const handleAddReply = (postId: string, commentId: string) => {
    if (currentUser.role === "Guest") {
      onToast("Tolong login terlebih dahulu untuk membalas komentar!", "info");
      return;
    }
    if (!replyText.trim()) return;

    const updated = memories.map(m => {
      if (m.id === postId) {
        const updatedComments = m.comments.map(c => {
          if (c.id === commentId) {
            const newReply: CommentReply = {
              id: "rep_" + Date.now().toString(),
              authorName: currentUser.name,
              authorAvatar: currentUser.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
              text: replyText.trim(),
              time: "Baru saja"
            };
            
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        });
        return { ...m, comments: updatedComments };
      }
      return m;
    });
    onUpdateMemories(updated);
    setReplyingCommentId(null);
    setReplyText("");
    onToast("Balasan komentar terkirim!", "success");
    onAddLog("Comment", "Membalas komentar.");
  };

  // Create Post Submit
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === "Guest") {
      onToast("Tolong login terlebih dahulu untuk membuat postingan!", "info");
      return;
    }

    if (!newTitle.trim() || !newDesc.trim()) {
      onToast("Judul dan Deskripsi wajib diisi!", "error");
      return;
    }

    // Process multiple images
    const imagesArray = newImageUrls
      .split(",")
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    // Default image if empty
    const mainImg = imagesArray[0] || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80";

    const tagList = newTagsString
      .split(",")
      .map(t => t.trim().replace("#", ""))
      .filter(t => t.length > 0);

    const newPost: ClassPhotoMemory = {
      id: "m_" + Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      imageUrl: mainImg,
      videoUrl: newVideoUrl.trim() || undefined,
      category: newCategory,
      tags: tagList,
      date: new Date().toISOString().split("T")[0],
      uploaderName: currentUser.name,
      likes: 0,
      hasLiked: false,
      views: 1,
      comments: [],
      isPinned: false,
      isFeatured: false
    };

    onUpdateMemories([newPost, ...memories]);
    setIsCreateOpen(false);
    
    // Reset states
    setNewTitle("");
    setNewDesc("");
    setNewImageUrls("");
    setNewVideoUrl("");
    setNewCategory("Kuliah");
    setNewTagsString("");

    onToast("Postingan kenangan berhasil ditambahkan ke Galeri! 📸", "success");
    onAddLog("Upload", `Mengunggah postingan kenangan baru: ${newPost.title}`);
  };

  // Open Lightbox
  const openLightbox = (url: string, index = 0) => {
    setLightboxImages([url]);
    setLightboxIndex(index);
  };

  // Filter & Search Logic
  const filtered = memories.filter(m => {
    const matchSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchCat = selectedCategory === "Semua" || m.category === selectedCategory;

    return matchSearch && matchCat;
  });

  // Sort Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "trending") {
      return b.likes - a.likes;
    }
    return b.id.localeCompare(a.id); // Newest first
  });

  const categoriesList = ["Semua", "Kuliah", "Makrab", "Wisuda", "Santai", "Project"];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      
      {/* Title Jumbotron Section with Dynamic Banner */}
      <div className="bg-[#e2bbfd] text-slate-950 p-8 relative overflow-hidden border-3 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <span className="bg-white border-2 border-black text-black text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
              Galeri Kenang-Kenangan
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight text-black">
              Arsip Kebersamaan Kelas
            </h2>
            <p className="text-slate-800 text-xs max-w-xl font-bold leading-relaxed">
              Abadikan momen berharga seputar kuliah, makrab, wisuda, hingga nugas santai. Diperbarui otomatis oleh seluruh anggota.
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
              Sync Feed 🔄
            </button>
            <button
              onClick={() => {
                if (currentUser.role === "Guest") {
                  onToast("Tolong login terlebih dahulu untuk mengupload foto!", "info");
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="py-2.5 px-4 bg-[#FF007F] hover:bg-[#FF007F]/90 text-white font-black text-xs border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Upload Momen 📸
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="bg-[#98f5e1] rounded-2xl p-4 border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-800 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul, tag, atau pengupload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-xl text-xs outline-none transition-all text-slate-900 font-bold focus:bg-[#FFF5B7]"
          />
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <span className="text-[11px] text-slate-900 font-black uppercase tracking-wider">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "trending")}
            className="px-3 py-1.5 bg-white border-2 border-black text-slate-900 font-bold rounded-xl text-xs outline-none cursor-pointer focus:bg-[#FFF5B7]"
          >
            <option value="newest">Terbaru</option>
            <option value="trending">Terpopuler (Suka)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <Filter className="w-3.5 h-3.5 text-slate-800 shrink-0 mr-1" />
        {categoriesList.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-black text-[11px] font-black transition-all shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] ${
                isActive
                  ? "bg-[#FF007F] text-white"
                  : "bg-white text-slate-900 hover:bg-[#FFF5B7]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="neo-box overflow-hidden flex flex-col h-full bg-white">
              <div className="aspect-[16/10] w-full neo-shimmer border-b-3 border-black" />
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-4.5 w-1/4 neo-shimmer rounded-md" />
                  <div className="h-6 w-3/4 neo-shimmer rounded-md" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3 w-full neo-shimmer rounded" />
                    <div className="h-3 w-5/6 neo-shimmer rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-black/10">
                  <div className="h-5 w-24 neo-shimmer rounded" />
                  <div className="h-5 w-16 neo-shimmer rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-3 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#ffb7b2] border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_0px_#000]">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900">Kenangan Tidak Ditemukan</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-bold">
              Coba ganti filter kategori atau kata kunci pencarian Anda untuk menemukan dokumentasi kelas.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((m) => (
            <div 
              key={m.id} 
              className={`bg-white rounded-2xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all ${
                m.isPinned ? "bg-[#FFF5B7]/45" : ""
              }`}
            >
              {/* Image & Category Overlay */}
              <div className="relative aspect-[16/10] w-full bg-slate-50 group overflow-hidden border-b-3 border-black">
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  onClick={() => openLightbox(m.imageUrl)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-102"
                />

                {/* Pin Badge if pinned */}
                {m.isPinned && (
                  <span className="absolute top-3 left-3 bg-[#FF007F] text-white font-black text-[8.5px] px-2.5 py-1 border-2 border-black rounded-lg flex items-center gap-1 uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                    <Pin className="w-3 h-3 fill-white" /> PINNED
                  </span>
                )}

                {/* Category tag */}
                <span className="absolute top-3 right-3 bg-white text-black border-2 border-black text-[8.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                  {m.category}
                </span>

                {/* Video Indicator */}
                {m.videoUrl && (
                  <div className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-[8.5px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1 shadow">
                    <Video className="w-3 h-3 fill-white" /> VIDEO READY
                  </div>
                )}
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-snug line-clamp-2">
                      {m.title}
                    </h4>
                    {currentUser.role === "Admin" && (
                      <button
                        onClick={() => handleDeletePost(m.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus Postingan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10.5px] text-slate-500 leading-relaxed line-clamp-3">
                    {m.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.tags.map((t) => (
                      <span 
                        key={t}
                        className="text-[9.5px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-all cursor-pointer"
                        onClick={() => setSearchQuery(t)}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Footer Metadata */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[8px] text-indigo-600 border border-indigo-200">
                      {m.uploaderName.charAt(0)}
                    </span>
                    <span>{m.uploaderName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {m.views + (m.likes * 2)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {m.date}</span>
                  </div>
                </div>

                {/* Likes / Comments Interaction row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2.5">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(m)}
                      className={`py-1.5 px-3 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        m.hasLiked
                          ? "bg-red-500 border-red-500 text-white shadow-sm shadow-red-200"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${m.hasLiked ? "fill-white" : ""}`} />
                      <span>{m.likes}</span>
                    </button>

                    {/* Bookmark button */}
                    <button
                      onClick={() => handleBookmark(m.id)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        m.isBookmarked
                          ? "bg-cyan-50 border-cyan-200 text-cyan-600"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400"
                      }`}
                      title="Bookmark postingan"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${m.isBookmarked ? "fill-cyan-600" : ""}`} />
                    </button>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={() => handleShare(m)}
                    className="p-1.5 rounded-xl border bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer"
                    title="Salin Link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expandable Comments Section */}
                <div className="pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Diskusi ({m.comments.length})
                    </span>
                  </div>

                  {/* List of Comments */}
                  <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1">
                    {m.comments.length === 0 ? (
                      <p className="text-center text-[10.5px] text-slate-400 py-4 font-semibold">
                        Belum ada komentar. Berikan kesan pertamamu! 💬
                      </p>
                    ) : (
                      m.comments.map((comment) => {
                        const isAuthor = comment.authorName === currentUser.name;
                        const canDelete = isAuthor || currentUser.role === "Admin";
                        
                        return (
                          <div key={comment.id} className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-100 text-[11px] group relative shadow-sm">
                            
                            {/* Comment Metadata */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={comment.authorAvatar}
                                  alt={comment.authorName}
                                  className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                />
                                <span className="font-bold text-slate-700">{comment.authorName}</span>
                                <span className="text-[9.5px] text-slate-400 font-medium">{comment.time}</span>
                              </div>

                              {/* Actions on comment */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                {isAuthor && (
                                  <button
                                    onClick={() => {
                                      setEditingCommentId({ postId: m.id, commentId: comment.id });
                                      setEditingText(comment.text);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 transition-all"
                                    title="Edit komentar"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteComment(m.id, comment.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-all"
                                    title="Hapus komentar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setReplyingCommentId({ postId: m.id, commentId: comment.id });
                                    setReplyText("");
                                  }}
                                  className="p-1 text-slate-400 hover:text-cyan-500 transition-all"
                                  title="Balas komentar"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Comment body */}
                            {editingCommentId?.commentId === comment.id ? (
                              <div className="mt-1 flex gap-2">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-slate-50 focus:bg-white"
                                />
                                <button
                                  onClick={() => handleSaveEditComment(m.id, comment.id)}
                                  className="px-2 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[10px]"
                                >
                                  Simpan
                                </button>
                              </div>
                            ) : (
                              <p className="text-slate-600 pl-1">{comment.text}</p>
                            )}

                            {/* Replies List */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="pl-4 mt-2 pt-2 border-l border-slate-100 space-y-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-2 items-start bg-slate-50/50 p-2 rounded-lg border border-slate-100/50">
                                    <CornerDownRight className="w-3 h-3 text-slate-400 mt-1" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <img
                                          src={reply.authorAvatar}
                                          alt={reply.authorName}
                                          className="w-4 h-4 rounded-full object-cover"
                                        />
                                        <span className="font-bold text-slate-700">{reply.authorName}</span>
                                        <span className="text-[9px] text-slate-400">{reply.time}</span>
                                      </div>
                                      <p className="text-slate-600 mt-0.5">{reply.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Form */}
                            {replyingCommentId?.commentId === comment.id && (
                              <div className="mt-2 pl-4 flex gap-1.5 items-center">
                                <input
                                  type="text"
                                  placeholder="Tulis balasan..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="flex-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10.5px] outline-none"
                                />
                                <button
                                  onClick={() => handleAddReply(m.id, comment.id)}
                                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[9.5px] rounded-lg transition-all"
                                >
                                  Balas
                                </button>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Primary Comment input */}
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Bagikan tanggapanmu..."
                      value={commentInputs[m.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [m.id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(m.id); }}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                    <button
                      onClick={() => handleAddComment(m.id)}
                      className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Kirim
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PHOTO MEMORY MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl border border-slate-200/80 shadow-premium overflow-hidden"
            >
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-700 px-6 py-4 text-white flex justify-between items-center">
                <h3 className="text-sm font-bold font-display">Upload Kenangan Foto & Video</h3>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Judul Dokumentasi</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Kuliah Tamu Bersama Pak Hermawan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  >
                    <option value="Kuliah">Kuliah</option>
                    <option value="Makrab">Makrab</option>
                    <option value="Wisuda">Wisuda</option>
                    <option value="Santai">Santai</option>
                    <option value="Project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Deskripsi / Cerita Singkat</label>
                  <textarea
                    required
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Gambarkan suasana seru di dalam foto tersebut..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Image URL(s)</label>
                  <p className="text-[10px] text-slate-400 mb-1.5">Pisahkan dengan tanda koma ( , ) jika mengunggah banyak foto.</p>
                  <input
                    type="text"
                    required
                    value={newImageUrls}
                    onChange={(e) => setNewImageUrls(e.target.value)}
                    placeholder="https://images.unsplash.com/..., https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Video URL (Opsional)</label>
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="Contoh: https://assets.mixkit.co/videos/preview/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tag / Hashtags</label>
                  <p className="text-[10px] text-slate-400 mb-1.5">Pisahkan dengan tanda koma tanpa spasi.</p>
                  <input
                    type="text"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    placeholder="Contoh: RPL,begadang,seru,koding"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Publish Memori Sekarang 🎉
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxImages && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-center items-center p-4">
            <button 
              onClick={() => setLightboxImages(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
              <img
                src={lightboxImages[lightboxIndex]}
                alt="Full preview"
                className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-glow-cyan"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-white text-xs mt-4">Zoomed Preview</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
