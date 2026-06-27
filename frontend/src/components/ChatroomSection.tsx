import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, ChatRoom, UserProfile, UploadedFile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Smile, 
  Paperclip, 
  X, 
  Copy, 
  Check, 
  Trash2, 
  Pin, 
  Hash, 
  MessageSquare, 
  Search, 
  FileText, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info,
  Reply,
  VolumeX,
  Plus,
  PanelLeft,
  PanelRight
} from "lucide-react";

// Highlight.js support
import hljs from "highlight.js";
// Inline code highlight styles
import "highlight.js/styles/atom-one-dark.css";

interface ChatProps {
  chatMessages: ChatMessage[];
  rooms: ChatRoom[];
  currentUser: UserProfile;
  friendsList: Array<{ name: string; initials: string; avatarColor: string; isOnline: boolean; status: string }>;
  onSendMessage: (roomId: string, text: string, file?: any, replyToId?: string) => void;
  onUpdateChats: (updated: ChatMessage[]) => void;
  onAddLog: (action: string, details: string) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  onTriggerNotification: (type: "mention" | "upload" | "room", title: string, message: string) => void;
  onAddFile: (file: UploadedFile) => void;
}

export default function ChatroomSection({
  chatMessages,
  rooms,
  currentUser,
  friendsList,
  onSendMessage,
  onUpdateChats,
  onAddLog,
  onToast,
  onTriggerNotification,
  onAddFile
}: ChatProps) {

  const [activeRoomId, setActiveRoomId] = useState("room_general");
  const [chatSearch, setChatSearch] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Simulated latency for skeleton loading on channel switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeRoomId]);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  // Collapsible Sidebars
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // File Upload Dialog
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [mockFileName, setMockFileName] = useState("");
  const [mockFileType, setMockFileType] = useState<"pdf" | "docx" | "ppt" | "zip" | "image" | "video">("pdf");
  const [mockFileSize, setMockFileSize] = useState("1.8 MB");

  // Copy code indicator
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Mute User simulation list
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);

  // Simulated typing classmate
  const [typingClassmate, setTypingClassmate] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeRoomId]);

  // Simulate Typing Indicators randomly
  useEffect(() => {
    const typingInterval = setInterval(() => {
      const activeFriends = friendsList.filter(f => f.isOnline);
      if (activeFriends.length > 0 && Math.random() < 0.3 && !typingClassmate) {
        const randomFriend = activeFriends[Math.floor(Math.random() * activeFriends.length)].name;
        setTypingClassmate(randomFriend);
        
        // Clear typing after 3 seconds
        setTimeout(() => {
          setTypingClassmate(null);
        }, 3000);
      }
    }, 8000);

    return () => clearInterval(typingInterval);
  }, [friendsList, typingClassmate]);

  // Handle Send Chat Submit
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === "Guest") {
      onToast("Tolong login terlebih dahulu untuk mengirim pesan!", "info");
      return;
    }

    if (!text.trim()) return;

    // Detect mention like @username
    const words = text.split(" ");
    const mentions = words.filter(w => w.startsWith("@"));
    if (mentions.length > 0) {
      mentions.forEach(m => {
        const usernameMentioned = m.replace("@", "");
        if (usernameMentioned === "admin_hub" || usernameMentioned === "budi_s" || usernameMentioned === "sarah_am") {
          onTriggerNotification(
            "mention",
            "Disebut dalam Diskusi",
            `${currentUser.name} menyebut @${usernameMentioned} di forum.`
          );
        }
      });
    }

    // Call actual handler
    onSendMessage(
      activeRoomId, 
      text.trim(), 
      undefined, 
      replyingTo ? replyingTo.id : undefined
    );

    // Reset
    setText("");
    setReplyingTo(null);
  };

  // Handle Mock File Attachment
  const handleAttachFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFileName.trim()) {
      onToast("Nama file wajib diisi!", "error");
      return;
    }

    // Create file payload for chat
    const finalName = mockFileName.includes(".") 
      ? mockFileName 
      : `${mockFileName}.${mockFileType === "image" ? "png" : mockFileType}`;

    const attachmentPayload = {
      name: finalName,
      size: mockFileSize,
      type: mockFileType === "image" ? "image" : mockFileType === "video" ? "video" : mockFileType,
      url: mockFileType === "image" ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80" : "#"
    };

    // Upload to Global File Manager
    const newGlobalFile: UploadedFile = {
      id: "f_" + Date.now().toString(),
      name: finalName,
      size: mockFileSize,
      type: mockFileType,
      uploadedAt: new Date().toISOString(),
      owner: currentUser.name,
      url: attachmentPayload.url
    };
    onAddFile(newGlobalFile);

    // Send as message
    onSendMessage(activeRoomId, `Mengunggah berkas lampiran: ${finalName}`, attachmentPayload);

    // Log & reset
    onAddLog("Upload", `Mengunggah berkas ${finalName} di room chat.`);
    setIsUploadOpen(false);
    setMockFileName("");
    onToast("Berkas sukses diunggah ke ruang obrolan! 📁", "success");
  };

  // Handle Pin message (Admin Only)
  const handlePinMessage = (msgId: string) => {
    if (currentUser.role !== "Admin") {
      onToast("Hanya Admin yang berhak menyematkan (pin) pesan!", "error");
      return;
    }
    const updated = chatMessages.map(m => {
      if (m.id === msgId) {
        const nextPinned = !m.isPinned;
        onToast(nextPinned ? "Pesan berhasil disematkan! 📌" : "Sematkan pesan dilepas.", "info");
        return { ...m, isPinned: nextPinned };
      }
      return m;
    });
    onUpdateChats(updated);
  };

  // Handle Delete message (Self or Admin)
  const handleDeleteMessage = (msgId: string, senderName: string) => {
    const isOwner = senderName.includes(currentUser.name);
    const isAdmin = currentUser.role === "Admin";

    if (!isOwner && !isAdmin) {
      onToast("Anda tidak memiliki hak menghapus pesan ini!", "error");
      return;
    }

    const updated = chatMessages.filter(m => m.id !== msgId);
    onUpdateChats(updated);
    onToast("Pesan obrolan berhasil dihapus.", "success");
    onAddLog("Delete", "Menghapus pesan obrolan kelas.");
  };

  // Mute classmate trigger (Admin Only)
  const handleMuteUser = (username: string) => {
    if (currentUser.role !== "Admin") {
      onToast("Hanya Admin yang berhak membisukan (mute) mahasiswa!", "error");
      return;
    }
    if (mutedUsers.includes(username)) {
      setMutedUsers(mutedUsers.filter(u => u !== username));
      onToast(`@${username} berhasil di-unmute!`, "success");
    } else {
      setMutedUsers([...mutedUsers, username]);
      onToast(`@${username} dibisukan di seluruh saluran! 🔇`, "info");
      onAddLog("Admin Action", `Membisukan user @${username}`);
    }
  };

  // Copy code helper
  const copyCodeToClipboard = (code: string, msgId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(msgId);
    onToast("Kode program berhasil disalin! 📋", "success");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Helper to detect if a text looks like program code
  const looksLikeCode = (textStr: string): { isCode: boolean; language: string } => {
    const codeIndicators = [
      /const\s+\w+\s*=/i,
      /let\s+\w+\s*=/i,
      /import\s+.*\s+from/i,
      /function\s+\w+\s*\(/i,
      /def\s+\w+\s*\(.*\):/i,
      /class\s+\w+\s*\{/i,
      /public\s+static\s+void\s+main/i,
      /console\.log\(/i,
      /System\.out\.print/i,
      /<\/?[a-z][a-z0-9]*[^<>]*>/i, // HTML tags
      /SELECT\s+.*\s+FROM/i,
      /^\s*<\?php/i,
      /package\s+[\w\.]+;/i
    ];

    const lines = textStr.split("\n");
    const hasMultipleLines = lines.length >= 2;
    const hasBracketsOrSemicolons = (textStr.includes("{") && textStr.includes("}")) || textStr.includes(";");

    for (const regex of codeIndicators) {
      if (regex.test(textStr)) {
        let guessedLang = "javascript";
        if (textStr.includes("def ") && textStr.includes(":")) guessedLang = "python";
        else if (textStr.includes("public static void") || textStr.includes("System.out")) guessedLang = "java";
        else if (/<[a-z/][^>]*>/i.test(textStr)) guessedLang = "xml";
        else if (/SELECT\s+.*\s+FROM/i.test(textStr)) guessedLang = "sql";
        else if (textStr.includes("#include")) guessedLang = "cpp";
        return { isCode: true, language: guessedLang };
      }
    }

    if (hasMultipleLines && hasBracketsOrSemicolons && textStr.length > 15) {
      return { isCode: true, language: "javascript" };
    }

    return { isCode: false, language: "" };
  };

  // Regex and Highlight.js parser for Markdown Code blocks & Auto-detected code
  const parseAndRenderMessage = (msg: ChatMessage) => {
    const text = msg.text;
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
    const match = codeBlockRegex.exec(text);

    if (match) {
      const language = match[1] || "javascript";
      const code = match[2];
      
      // Auto highlight
      let highlightedCode = code;
      try {
        highlightedCode = hljs.highlight(code, { language }).value;
      } catch (err) {
        highlightedCode = hljs.highlightAuto(code).value;
      }

      // Extract raw non-code text before/after if any
      const plainText = text.replace(codeBlockRegex, "").trim();

      return (
        <div className="space-y-2 max-w-full overflow-hidden text-left">
          {plainText && <p className="leading-relaxed whitespace-pre-line">{plainText}</p>}
          
          <div className="rounded-lg border-2 border-black bg-slate-900 text-slate-100 overflow-hidden text-xs font-mono max-w-full shadow-[3px_3px_0px_0px_#000]">
            <div className="bg-[#a6ff00] px-3.5 py-1.5 flex justify-between items-center text-[10px] text-black font-black border-b-2 border-black">
              <span className="uppercase font-black tracking-wider text-black">{language}</span>
              <button
                onClick={() => copyCodeToClipboard(code, msg.id)}
                className="hover:underline flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedCodeId === msg.id ? (
                  <>
                    <Check className="w-3 h-3 text-black font-extrabold" />
                    <span className="text-black">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="p-3.5 overflow-x-auto scrollbar-thin text-left max-w-full whitespace-pre font-mono bg-slate-950">
              <code 
                className="hljs whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlightedCode }} 
              />
            </pre>
          </div>
        </div>
      );
    }

    // Auto-detect code without backticks
    const codeCheck = looksLikeCode(text);
    if (codeCheck.isCode) {
      const language = codeCheck.language || "javascript";
      let highlightedCode = text;
      try {
        highlightedCode = hljs.highlight(text, { language }).value;
      } catch (err) {
        try {
          highlightedCode = hljs.highlightAuto(text).value;
        } catch (e) {
          highlightedCode = text;
        }
      }

      return (
        <div className="space-y-2 max-w-full overflow-hidden text-left">
          <div className="rounded-lg border-2 border-black bg-slate-900 text-slate-100 overflow-hidden text-xs font-mono max-w-full shadow-[3px_3px_0px_0px_#000]">
            <div className="bg-[#00FFFF] px-3.5 py-1.5 flex justify-between items-center text-[10px] text-black font-black border-b-2 border-black">
              <span className="uppercase font-black tracking-wider text-black">{language} (auto-detected)</span>
              <button
                onClick={() => copyCodeToClipboard(text, msg.id)}
                className="hover:underline flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedCodeId === msg.id ? (
                  <>
                    <Check className="w-3 h-3 text-black font-extrabold" />
                    <span className="text-black">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="p-3.5 overflow-x-auto scrollbar-thin text-left max-w-full whitespace-pre font-mono bg-slate-950">
              <code 
                className="hljs whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlightedCode }} 
              />
            </pre>
          </div>
        </div>
      );
    }

    // Default plain text return with mention highlighter
    const words = text.split(" ");
    return (
      <p className="leading-relaxed whitespace-pre-line text-left">
        {words.map((word, i) => {
          if (word.startsWith("@")) {
            return (
              <span key={i} className="bg-black text-[#a6ff00] border border-[#a6ff00] font-black px-1.5 py-0.5 rounded mr-1">
                {word}
              </span>
            );
          }
          return word + " ";
        })}
      </p>
    );
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // Filtering messages for this specific room and optional search query
  const filteredMessages = chatMessages
    .filter(m => m.roomId === activeRoomId)
    .filter(m => m.text.toLowerCase().includes(chatSearch.toLowerCase()));

  // Count pinned messages
  const pinnedMessages = filteredMessages.filter(m => m.isPinned);

  const chatColSpan = isLeftSidebarOpen && isRightSidebarOpen
    ? "lg:col-span-6"
    : isLeftSidebarOpen || isRightSidebarOpen
      ? "lg:col-span-9"
      : "lg:col-span-12";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white h-[750px] overflow-hidden w-full mx-auto">
      
      {/* 1. Rooms List Left Sidebar (3 columns) */}
      {isLeftSidebarOpen && (
        <div className="hidden lg:flex lg:col-span-3 bg-slate-900 text-slate-300 flex-col justify-between border-r-3 border-black">
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Workspace Title Header */}
          <div className="p-4 border-b-2 border-black flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF007F] border-2 border-black flex items-center justify-center text-white font-black text-xs shadow-[1.5px_1.5px_0px_0px_#000]">
                KH
              </div>
              <span className="font-display font-black text-xs tracking-wider text-white">KelasHub Server</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Rooms Category Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-left">
            
            {/* Category: General Channels */}
            <div className="space-y-1.5">
              <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1.5">Mata Kuliah & Umum</p>
              {rooms.map(room => {
                const isActive = room.id === activeRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoomId(room.id);
                      setReplyingTo(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                      isActive 
                        ? "bg-[#FF007F] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black" 
                        : "hover:bg-slate-800/50 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-500 font-bold">#</span>
                      <span className="truncate">{room.name.replace("💻-", "").replace("🗣️-", "").replace("🧠-", "").replace("🗄️-", "").replace("📱-", "").replace("🔒-", "")}</span>
                    </div>

                    {room.isPrivate && (
                      <span className="text-[9px] text-slate-500">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Simulated Active Members Quick Overview */}
            <div className="pt-2">
              <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-1.5">Sedang Online ({friendsList.filter(f => f.isOnline).length})</p>
              <div className="space-y-1.5 pl-2 max-h-[140px] overflow-y-auto">
                {friendsList.filter(f => f.isOnline).map(f => (
                  <div key={f.name} className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="truncate max-w-[120px]" title={f.status}>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* User Card at footer left */}
        <div className="p-3 bg-slate-950 border-t-2 border-black flex items-center justify-between gap-2 text-xs text-left">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-[#e2bbfd] border-2 border-black flex items-center justify-center text-black font-black shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="font-black text-white truncate text-[11px] leading-tight">{currentUser.name}</p>
              <p className="text-[9px] text-slate-500 leading-none truncate mt-0.5 font-bold">Role: {currentUser.role}</p>
            </div>
          </div>
          
          <VolumeX className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" title="Bisukan Notif Server" />
        </div>
      </div>
      )}

      {/* 2. Main Chat Canvas */}
      <div className={`col-span-12 ${chatColSpan} flex flex-col justify-between bg-slate-50 min-h-0 ${isRightSidebarOpen ? "border-r-3 border-black" : ""}`}>
        
        {/* Chat Header and Search */}
        <div className="bg-[#98f5e1] px-5 py-3 border-b-3 border-black flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            {/* Left Sidebar Toggle Button */}
            <button
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className="p-1.5 hover:bg-black hover:text-white border-2 border-black rounded-lg transition-all bg-white text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
              title={isLeftSidebarOpen ? "Sembunyikan Saluran" : "Tampilkan Saluran"}
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-black font-black">#</span>
              <div>
                <h3 className="text-xs font-black text-slate-900 leading-tight">
                  {activeRoom.name}
                </h3>
                <p className="text-[9.5px] text-slate-700 leading-none mt-0.5 max-w-[200px] truncate font-bold">{activeRoom.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Local chat search */}
            <div className="relative max-w-[130px] sm:max-w-[160px]">
              <Search className="w-3.5 h-3.5 text-slate-800 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pesan..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1 bg-white border-2 border-black rounded-lg text-[10px] font-black outline-none text-slate-900 focus:bg-[#FFF5B7]"
              />
            </div>

            {/* Right Sidebar Toggle Button */}
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="p-1.5 hover:bg-black hover:text-white border-2 border-black rounded-lg transition-all bg-white text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
              title={isRightSidebarOpen ? "Sembunyikan Anggota" : "Tampilkan Anggota"}
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pinned Messages Ribbon if exist */}
        {pinnedMessages.length > 0 && (
          <div className="bg-[#FFF5B7] px-4 py-1.5 border-b-2 border-black text-[10.5px] text-black flex items-center justify-between font-bold text-left">
            <div className="flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-black fill-black" />
              <span className="font-black">Pesan Disematkan ({pinnedMessages.length})</span>
            </div>
            <button 
              onClick={() => onToast(`Pesan pinned pertama: "${pinnedMessages[0].text.substring(0, 30)}..."`, "info")}
              className="text-[9.5px] text-black hover:underline font-black bg-white border-2 border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px]"
            >
              Lihat
            </button>
          </div>
        )}

        {/* Messaging Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => {
                const isEven = i % 2 === 0;
                return (
                  <div key={i} className={`flex gap-3 max-w-[80%] ${isEven ? "ml-auto flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 rounded-full neo-shimmer shrink-0 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]" />
                    <div className="space-y-2 flex-1">
                      <div className={`flex gap-2 items-center ${isEven ? "justify-end" : ""}`}>
                        <div className="h-3 w-20 neo-shimmer rounded" />
                        <div className="h-3.5 w-10 neo-shimmer rounded" />
                      </div>
                      <div className={`p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-block bg-white ${
                        isEven ? "rounded-tr-none" : "rounded-tl-none"
                      } ${isEven ? "w-48 text-right" : "w-64"}`}>
                        <div className="h-3 w-5/6 neo-shimmer rounded mb-1.5" />
                        <div className="h-3 w-full neo-shimmer rounded mb-1.5" />
                        <div className="h-3 w-2/3 neo-shimmer rounded" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-20 space-y-2 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-semibold">Saluran obrolan kosong</p>
              <p className="text-[10px]">Jadilah yang pertama menyapa teman-teman kelas!</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderName.includes(currentUser.name) || msg.senderUsername === currentUser.username;
              const isMuted = mutedUsers.includes(msg.senderUsername);
              const isPinned = msg.isPinned;

              if (isMuted) return null;

              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[90%] group ${
                    isMe ? "ml-auto flex-row-reverse text-right" : "text-left mr-auto"
                  }`}
                >
                  {/* Avatar */}
                  <img
                    src={msg.senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 mt-1"
                  />

                  {/* Bubble content */}
                  <div className="space-y-1 max-w-full overflow-hidden">
                    
                    {/* Meta info */}
                    <div className={`flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase ${
                      isMe ? "justify-end flex-row-reverse" : ""
                    }`}>
                      <span className="text-slate-700 font-extrabold">{msg.senderName}</span>
                      <span className="bg-slate-200 text-slate-600 font-semibold px-1.5 rounded-[4px] scale-90 tracking-wide lowercase">
                        {msg.senderRole}
                      </span>
                      <span className="text-[8px] font-normal leading-none lowercase">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>

                      {/* Pin Icon badge */}
                      {isPinned && <Pin className="w-3 h-3 text-indigo-600 fill-indigo-600 ml-1" title="Disematkan oleh Admin" />}
                    </div>

                    {/* Chat Bubble container */}
                    <div className="relative max-w-full overflow-hidden">
                      
                      {/* Nested reply reference indicator */}
                      {msg.replyToText && (
                        <div className="text-[10px] bg-slate-200/50 p-2 rounded-xl text-slate-500 mb-1 leading-snug truncate text-left max-w-[240px] border-l-2 border-indigo-500">
                          <span className="font-bold text-slate-600 block text-[9px] uppercase">Membalas @{msg.replyToSender}:</span>
                          <span>{msg.replyToText}</span>
                        </div>
                      )}

                      {/* Actual Bubble */}
                      <div className={`p-3 rounded-2xl text-[11.5px] leading-relaxed break-words text-slate-800 inline-block text-left max-w-full ${
                        isMe 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-sm" 
                          : "bg-white border border-slate-200/80 rounded-tl-none shadow-sm"
                      }`}>
                        
                        {/* If file attachment is present */}
                        {msg.file ? (
                          <div className={`space-y-2 ${isMe ? "text-white" : ""}`}>
                            <p className="font-semibold">{msg.text}</p>
                            
                            <div className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                              isMe ? "bg-indigo-700/50 border-indigo-500/50" : "bg-slate-50 border-slate-200"
                            }`}>
                              <div className="flex items-center gap-2">
                                <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
                                <div className="text-left">
                                  <p className="text-[10.5px] font-bold truncate max-w-[120px]">{msg.file.name}</p>
                                  <p className="text-[8.5px] opacity-70">Ukuran: {msg.file.size}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  onToast(`Simulasi mengunduh lampiran obrolan: ${msg.file?.name}`, "success");
                                  onAddLog("Download", `Mengunduh file chat: ${msg.file?.name}`);
                                }}
                                className="px-2 py-1 bg-white text-slate-800 hover:bg-slate-100 rounded text-[9.5px] font-bold"
                              >
                                Download
                              </button>
                            </div>

                            {/* Render image preview directly in chat if image */}
                            {msg.file.type === "image" && (
                              <div className="rounded-lg overflow-hidden border border-slate-200 aspect-[4/3] w-36 bg-slate-100 mt-2">
                                <img
                                  src={msg.file.url}
                                  alt="Chat upload preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          // Default Text or Code Blocks Parser
                          parseAndRenderMessage(msg)
                        )}

                      </div>

                      {/* Hover action bar */}
                      <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-all flex gap-1 ${
                        isMe ? "-left-12 flex-row-reverse" : "-right-12"
                      }`}>
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm"
                          title="Balas pesan"
                        >
                          <Reply className="w-3 h-3" />
                        </button>

                        {currentUser.role === "Admin" && (
                          <button
                            onClick={() => handlePinMessage(msg.id)}
                            className="p-1 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm"
                            title="Pin pesan"
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                        )}

                        {(isMe || currentUser.role === "Admin") && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id, msg.senderName)}
                            className="p-1 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-lg shadow-sm"
                            title="Hapus pesan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {/* Typing indicator simulator bar */}
        <AnimatePresence>
          {typingClassmate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-100 px-5 py-1 text-[10px] text-slate-400 italic font-medium flex items-center gap-1 shrink-0"
            >
              <div className="flex gap-0.5 mr-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>{typingClassmate} sedang mengetik...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Textbox form footer */}
        <div className="bg-white p-3 border-t border-slate-200/60">
          
          {/* Active Reply Banner */}
          {replyingTo && (
            <div className="bg-indigo-50/80 p-2 rounded-xl mb-2 flex items-center justify-between text-[11px] border border-indigo-100">
              <span className="text-indigo-800">Membalas pesan <strong>@{replyingTo.senderUsername}</strong>: {replyingTo.text.substring(0, 30)}...</span>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => {
                if (currentUser.role === "Guest") {
                  onToast("Tolong login terlebih dahulu untuk mengunggah berkas!", "info");
                } else {
                  setIsUploadOpen(true);
                }
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200/50"
              title="Unggah berkas"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Main Input Text */}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Tulis pesan di #${activeRoom.name}...`}
              className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-150/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all text-slate-800"
            />

            {/* Quick Demo Code Blocks Button helper */}
            <button
              type="button"
              onClick={() => {
                setText("```javascript\n// Halo angkatan!\nconsole.log('Semangat belajar, KelasHub! 🔥');\n```");
                onToast("Kode demo disisipkan! Silakan klik Kirim.", "info");
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold"
              title="Sisipkan Kode Program"
            >
              <Code className="w-4 h-4 text-cyan-600" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* 3. Discord-like Active Members List Right Sidebar (3 columns) */}
      {isRightSidebarOpen && (
        <div className="hidden lg:flex lg:col-span-3 bg-slate-50 flex-col border-l border-slate-200/60 p-4 min-h-0 overflow-y-auto space-y-4">
          
          {/* Search Chat or Quick Info */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-[10.5px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-500" /> Diskusi KelasHub
            </p>
            <p>Dukungan penulisan sintaks program: Gunakan triple backticks ( ``` ) untuk highlighting otomatis.</p>
          </div>

          {/* Member Status Stream */}
          <div className="space-y-3 flex-1">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Anggota Kelas ({friendsList.length})</p>
            
            <div className="space-y-3">
              {/* Render Self */}
              <div className="flex items-center justify-between text-xs p-1">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-full bg-indigo-150 border border-indigo-400 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="truncate text-left">
                    <p className="font-extrabold text-slate-800 truncate leading-tight">{currentUser.name} (Anda)</p>
                    <p className="text-[8.5px] text-emerald-500 truncate leading-none mt-0.5">● Online</p>
                  </div>
                </div>
              </div>

              {/* Render Friends */}
              {friendsList.map(f => {
                const isMuted = mutedUsers.includes(f.name.replace(" ", "_").toLowerCase());
                return (
                  <div 
                    key={f.name} 
                    className="flex items-center justify-between text-xs p-1 group/member"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-slate-900 font-bold shrink-0 text-[10px] border border-slate-200 shadow-sm"
                        style={{ backgroundColor: f.avatarColor }}
                      >
                        {f.initials}
                      </div>
                      <div className="truncate text-left">
                        <p className="font-semibold text-slate-700 truncate leading-tight group-hover/member:text-slate-900">{f.name}</p>
                        <p className={`text-[8.5px] truncate leading-none mt-0.5 ${
                          f.isOnline ? "text-emerald-500" : "text-slate-400"
                        }`}>
                          {f.isOnline ? "● Online" : "📴 Offline"}
                        </p>
                      </div>
                    </div>

                    {/* Admin Only action: Mute user directly */}
                    {currentUser.role === "Admin" && (
                      <button
                        onClick={() => handleMuteUser(f.name.replace(" ", "_").toLowerCase())}
                        className="opacity-0 group-hover/member:opacity-100 p-1 text-[9px] hover:bg-slate-200 text-slate-500 hover:text-indigo-600 rounded-md transition-all shrink-0 cursor-pointer"
                        title={isMuted ? "Unmute Mahasiswa" : "Mute (Bisukan) Mahasiswa"}
                      >
                        {isMuted ? "🔇 Unmute" : "Mute"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* MOCK FILE UPLOAD MODAL */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md border border-slate-200/80 shadow-premium overflow-hidden"
            >
              <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  Kirim Berkas Lampiran
                </h3>
                <button onClick={() => setIsUploadOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAttachFileSubmit} className="p-5 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Berkas</label>
                  <input
                    type="text"
                    required
                    value={mockFileName}
                    onChange={(e) => setMockFileName(e.target.value)}
                    placeholder="Contoh: Laporan_Analisis_Sistem"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenis Berkas</label>
                    <select
                      value={mockFileType}
                      onChange={(e) => setMockFileType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                    >
                      <option value="pdf">PDF Dokumen</option>
                      <option value="docx">Word (DOCX)</option>
                      <option value="zip">ZIP Arsip</option>
                      <option value="ppt">PowerPoint (PPT)</option>
                      <option value="image">Gambar (PNG/JPG)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Simulasi Ukuran</label>
                    <input
                      type="text"
                      required
                      value={mockFileSize}
                      onChange={(e) => setMockFileSize(e.target.value)}
                      placeholder="e.g. 1.2 MB atau 800 KB"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[10px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-600">Simulasi Folder:</p>
                  <p>Berkas yang Anda lampirkan di sini juga akan otomatis tersimpan ke **File Manager** Dashboard Admin.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Upload & Kirim Lampiran 🚀
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
