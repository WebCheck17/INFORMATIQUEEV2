import { 
  UserProfile, 
  ClassPhotoMemory, 
  ChatMessage, 
  DosenAssignment, 
  ChatRoom, 
  ClassNotification, 
  ActivityLog, 
  WebsiteSettings, 
  UploadedFile 
} from "./types";

// User database for simulation
export const INITIAL_USERS = [
  {
    id: "u_admin",
    username: "admin",
    name: "Ahmad Mujahid",
    gender: "male",
    photoUrl: "/images/default-1.png",
  },
  {
    id: "u_1",
    username: "budi_s",
    initials: "BS",
    name: "Budi Santoso",
    gender: "male",
    photoUrl: "/images/default-1.png",
  },
  {
    id: "u_2",
    username: "sarah_am",
    name: "Sarah Amanda",
    gender: "female",
    photoUrl: "/images/default-2.png",
  }
];

export const INITIAL_ROOMS: ChatRoom[] = [
  {
    id: "room_general",
    name: "🗣️-obrolan-santai",
    category: "UMUM",
    description: "Ruang bebas tempat warga kelas mabar, curhat, dengerin musik, atau gibah santai.",
    isPrivate: false
  },
  {
    id: "room_web",
    name: "💻-pemrograman-web",
    category: "MATA KULIAH",
    description: "Diskusi seputar React, Node.js, Express, Tailwind CSS, dan error-error routing web lanjut.",
    isPrivate: false
  },
  {
    id: "room_ai",
    name: "🧠-kecerdasan-buatan",
    category: "MATA KULIAH",
    description: "Belajar Machine Learning, Deep Learning, CNN, NLP, dan implementasi Jupyter Notebook.",
    isPrivate: false
  },
  {
    id: "room_db",
    name: "🗄️-basis-data",
    category: "MATA KULIAH",
    description: "Tanya jawab SQL, DDL/DML, optimalisasi index, Normalisasi, dan NoSQL (MongoDB/Redis).",
    isPrivate: false
  },
  {
    id: "room_mobile",
    name: "📱-mobile-programming",
    category: "MATA KULIAH",
    description: "Tempat sharing seputar Kotlin, Flutter, React Native, Gradle, dan rilis APK.",
    isPrivate: false
  },
  {
    id: "room_admin",
    name: "🔒-rapat-internal",
    category: "ADMIN ONLY",
    description: "Ruang khusus admin, ketua kelas, dan pengurus kelas untuk mengatur keuangan dan event.",
    isPrivate: true
  }
];

export const INITIAL_MEMORIES: ClassPhotoMemory[] = [
  {
    id: "m1",
    title: "Begadang Nyelesaiin Project Web di Cafe",
    description: "Momen ngambis bareng di Kopi Koopen buat nyelesaiin project e-commerce. Penuh tawa, tumpahan kafein, dan kejutan git conflict jam 3 pagi! Akhirnya build kelar juga.",
    imageUrl: "/images/bootcamp-1.jpeg",  // ← LOCAL PATH
    category: "Project",
    tags: ["React", "Express", "Ngambis", "Begadang"],
    date: "2026-06-20",
    uploaderName: "Budi Santoso",
    likes: 18,
    hasLiked: false,
    views: 125,
    isPinned: true,
    isFeatured: true,
    comments: [
      {
        id: "mc1",
        authorName: "Sarah Amanda",
        authorAvatar: "/images/default-2.png",  // ← LOCAL PATH
        text: "Laptop Aditya sampe panas bgt waktu itu wkwk!",
        time: "3 hari yang lalu",
        replies: [
          {
            id: "mcr1",
            authorName: "Budi Santoso",
            authorAvatar: "/images/default-1.png",  // ← LOCAL PATH
            text: "Emang, untung ngga meleduk dah laptopnya 😂",
            time: "2 hari yang lalu"
          }
        ]
      },
      {
        id: "mc2",
        authorName: "Ahmad Mujahid (Admin)",
        authorAvatar: "/images/default-1.png",  // ← LOCAL PATH
        text: "Keren kalian! Nanti share ya repo github-nya di room-web, mau liat kodenya.",
        time: "2 hari yang lalu"
      }
    ]
  },
  {
    id: "m2",
    title: "Keseruan Makrab Kelas di Villa Lembang",
    description: "Momen tak terlupakan pas dingin-dingin bakar jagung, main gitar bareng, dan sesi jujur-jujuran pas malam hari. Kerasa bgt vibes kekeluargaannya!",
    imageUrl: "/images/bootcamp-2.jpeg",  // ← LOCAL PATH
    category: "Makrab",
    tags: ["Lembang", "Kebersamaan", "BakarJagung"],
    date: "2026-05-12",
    uploaderName: "Sarah Amanda",
    likes: 35,
    hasLiked: true,
    views: 240,
    isPinned: false,
    isFeatured: true,
    comments: [
      {
        id: "mc3",
        authorName: "Budi Santoso",
        authorAvatar: "/images/default-1.png",  // ← LOCAL PATH
        text: "Bakar jagungnya gosong tapi tetep enak wkwk.",
        time: "1 bulan yang lalu"
      }
    ]
  },
  {
    id: "m3",
    title: "Suasana Praktikum Jaringan Komputer",
    description: "Materi crimping kabel LAN dan konfigurasi routing static Cisco. Ada yang kabel LAN-nya kebalik pas dites, auto bikin se-lab ngakak!",
    imageUrl: "/images/bootcamp-3.jpeg",  // ← LOCAL PATH
    category: "Kuliah",
    tags: ["Jaringan", "Cisco", "Praktikum"],
    date: "2026-04-18",
    uploaderName: "Ahmad Mujahid (Admin)",
    likes: 12,
    hasLiked: false,
    views: 89,
    isPinned: false,
    isFeatured: false,
    comments: []
  }
];

export const INITIAL_ASSIGNMENTS: DosenAssignment[] = [
  {
    id: "a1",
    subject: "Pemrograman Web Lanjut",
    lecturer: "Dr. Eng. Hermawan, M.T.",
    title: "E-Commerce Fullstack dengan React & Express",
    description: "Membuat aplikasi web belanja online sederhana lengkap dengan state management, routing, API CRUD, dan auth dasar. Dikumpulkan berupa link repo GitHub di portal kulon.",
    dueDate: "2026-06-28T23:59:00",
    status: "Belum",
    priority: "Tinggi",
    attachment: {
      name: "Panduan_Project_Web.pdf",
      size: "2.4 MB",
      url: "#"
    },
    notes: "Wajib menggunakan Tailwind CSS untuk styling frontend."
  },
  {
    id: "a2",
    subject: "Kecerdasan Buatan",
    lecturer: "Prof. Dr. Ir. Rina Astuti",
    title: "Klasifikasi Gambar Menggunakan Model CNN",
    description: "Implementasi deep learning sederhana untuk klasifikasi dataset gambar CIFAR-10 memakai TensorFlow/PyTorch. Output berupa file .ipynb dan laporan format PDF.",
    dueDate: "2026-07-03T15:00:00",
    status: "Belum",
    priority: "Sedang",
    attachment: {
      name: "CIFAR10_Dataset_Guide.zip",
      size: "12.8 MB",
      url: "#"
    },
    notes: "Akurasi model minimal mencapai 75% di validation set."
  },
  {
    id: "a3",
    subject: "Etika Profesi IT",
    lecturer: "Drs. Bambang Wijaya, M.Si.",
    title: "Resume Analisis Kasus Pelanggaran UU ITE",
    description: "Analisis salah satu kasus pelanggaran UU ITE terpopuler di Indonesia. Berikan tanggapan etika TI, pasal yang dilanggar, serta solusi preventif minimal 3 halaman A4.",
    dueDate: "2026-06-26T22:00:00",
    status: "Belum",
    priority: "Biasa",
    notes: "Format penulisan Times New Roman 12, Spasi 1.5, Justify."
  },
  {
    id: "a4",
    subject: "Data Warehouse",
    lecturer: "Iwan Setiawan, S.Kom., M.T.",
    title: "Perancangan Skema ETL dan Star Schema",
    description: "Membuat rancangan tabel dimensi, tabel fakta, dan alur integrasi data (ETL) dari database transaksi retail ke data warehouse.",
    dueDate: "2026-06-22T08:00:00",
    status: "Selesai",
    priority: "Sedang"
  }
];

export const INITIAL_CHATS: ChatMessage[] = [
  {
    id: "c1",
    roomId: "room_general",
    senderName: "Sarah Amanda",
    senderUsername: "sarah_am",
    senderAvatar: "/images/default-2.png",  // ← LOCAL PATH
    senderRole: "Sekretaris",
    text: "Halo guys! Jangan lupa besok pagi ada kuliah tamu Etika Profesi IT jam 08:00 WIB di Aula Utama ya. Absensi wajib!",
    timestamp: "2026-06-25T14:15:00"
  },
  {
    id: "c2",
    roomId: "room_general",
    senderName: "Budi Santoso",
    senderUsername: "budi_s",
    senderAvatar: "/images/default-1.png",  // ← LOCAL PATH
    senderRole: "Ketua Kelas",
    text: "Siap Sar! Nanti biar aku umumin juga di grup WA biar yang lagi push rank langsung baca wkwk.",
    timestamp: "2026-06-25T14:18:00"
  },
  {
    id: "c3",
    roomId: "room_web",
    senderName: "Budi Santoso",
    senderUsername: "budi_s",
    senderAvatar: "/images/default-1.png",  // ← LOCAL PATH
    senderRole: "Ketua Kelas",
    text: "Ada yang udah dapet logic custom middleware buat validasi JWT di Express? Share dong, aku nyangkut di next() token verification.",
    timestamp: "2026-06-26T08:30:00"
  },
  {
    id: "c4",
    roomId: "room_web",
    senderName: "Ahmad Mujahid (Admin)",
    senderUsername: "admin_hub",
    senderAvatar: "/images/default-1.png",  // ← LOCAL PATH
    senderRole: "Admin",
    text: "Ini Bud, potongan kode ringkas buat verifikasi token JWT di middleware Express...",
    timestamp: "2026-06-26T08:35:00"
  },
  {
    id: "c5",
    roomId: "room_web",
    senderName: "Budi Santoso",
    senderUsername: "budi_s",
    senderAvatar: "/images/default-1.png",  // ← LOCAL PATH
    senderRole: "Ketua Kelas",
    text: "Wah mantap bang jago! Sangat mencerahkan. Langsung copas & test dlu! @admin_hub 👍⚡️",
    timestamp: "2026-06-26T08:42:00"
  }
];

export const INITIAL_NOTIFICATIONS: ClassNotification[] = [
  {
    id: "n1",
    type: "mention",
    title: "Disebut dalam Chat",
    message: "Ahmad Mujahid menyebut Anda di room pemrograman-web.",
    time: "2026-06-26T08:35:00",
    isRead: false
  },
  {
    id: "n2",
    type: "deadline",
    title: "Deadline Tugas Baru",
    message: "Tugas baru 'E-Commerce Fullstack' telah ditambahkan oleh Dr. Eng. Hermawan.",
    time: "2026-06-24T10:00:00",
    isRead: true
  },
  {
    id: "n3",
    type: "like",
    title: "Postingan Disukai",
    message: "Sarah Amanda menyukai postingan kenangan 'Begadang Nyelesaiin Project Web'.",
    time: "2026-06-21T18:30:00",
    isRead: true
  }
];

export const INITIAL_SETTINGS: WebsiteSettings = {
  websiteName: "Informatiquee Class",
  logoUrl: "/images/logo.png",  // ← LOCAL PATH
  bannerUrl: "/images/banner.jpg",  // ← LOCAL PATH
  themeColor: "indigo",
  isDarkMode: false,
  allowRegister: true,
  maxUploadSize: 20,
  className: "15.5A.02",
  semester: "Genap 2025/2026",
  allowGuestAccess: true
};

export const INITIAL_FILES: UploadedFile[] = [
  {
    id: "f1",
    name: "Panduan_Project_Web.pdf",
    size: "2.4 MB",
    type: "pdf",
    uploadedAt: "2026-06-24T10:05:00",
    owner: "Ahmad Mujahid (Admin)",
    url: "#"
  },
  {
    id: "f2",
    name: "CIFAR10_Dataset_Guide.zip",
    size: "12.8 MB",
    type: "zip",
    uploadedAt: "2026-06-25T11:20:00",
    owner: "Ahmad Mujahid (Admin)",
    url: "#"
  },
  {
    id: "f3",
    name: "screenshot_routing_error.png",
    size: "1.1 MB",
    type: "image",
    uploadedAt: "2026-06-26T08:29:00",
    owner: "Budi Santoso",
    url: "/images/screenshot_routing_error.png"  // ← LOCAL PATH
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "l1",
    username: "budi_s",
    action: "Login",
    details: "User budi_s masuk ke aplikasi KelasHub via Web Chrome.",
    timestamp: "2026-06-26T08:12:00"
  },
  {
    id: "l2",
    username: "budi_s",
    action: "Upload",
    details: "Berhasil mengunggah screenshot_routing_error.png ke ruang penyimpanan.",
    timestamp: "2026-06-26T08:29:00"
  },
  {
    id: "l3",
    username: "admin_hub",
    action: "Chat",
    details: "Mengirimkan pesan code snippet bantuan JWT di pemrograman-web.",
    timestamp: "2026-06-26T08:35:00"
  }
];
