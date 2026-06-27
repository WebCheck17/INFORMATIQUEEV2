// Theme Toggle dengan Checkbox
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'light') {
  body.setAttribute('data-theme', 'light');
  themeToggle.checked = true;
}

themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    body.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } else {
    body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
  }
});

// Sample Photos (ganti dengan foto asli kamu)
// Sample Photos dengan Photobox Card
const samplePhotos = [
{
  src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  caption: 'First Day on Campus',
  date: 'September 2024'
},
{
  src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
  caption: 'Kelas Pagi yang Chaos',
  date: 'Oktober 2024'
},
{
  src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  caption: 'Gathering Angkatan',
  date: 'November 2024'
}
];

const photoGrid = document.getElementById('photo-grid');

samplePhotos.forEach(photo => {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.innerHTML = `
    <img src="${photo.src}" alt="${photo.caption}">
    <div class="frame-overlay"></div>
    <div class="card-info">
      <div class="caption">${photo.caption}</div>
      <div class="date">${photo.date}</div>
    </div>
  `;
  
  card.addEventListener('click', () => openLightbox(photo.src, photo.caption));
  photoGrid.appendChild(card);
});

// Load Gallery
function loadGallery() {
  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '';

  photos.forEach((photo, index) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${photo.src}" alt="${photo.alt}" data-index="${index}">
    `;
    div.addEventListener('click', () => openLightbox(photo.src, photo.alt));
    grid.appendChild(div);
  });
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-image');
const closeBtn = document.querySelector('.close');
const downloadBtn = document.getElementById('download-btn');

function openLightbox(src, alt) {
  lightbox.style.display = 'flex';
  lightboxImg.src = src;
  downloadBtn.href = src;
  downloadBtn.download = `informatiquee-2024-${Date.now()}.jpg`;
}

closeBtn.addEventListener('click', () => {
  lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.style.display = 'none';
});

// Sample Videos
const videos = [
  { title: "Hari Pertama Kuliah", url: "https://www.youtube.com/embed/dQw4w9wgxcq" },
  { title: "Kegiatan Praktikum", url: "https://www.youtube.com/embed/3JZ_3VJ8Z4Q" }
];

function loadVideos() {
  const container = document.getElementById('video-grid');
  container.innerHTML = '';

  videos.forEach(video => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${video.title}</h3>
      <iframe width="100%" height="315" src="${video.url}" 
        frameborder="0" allowfullscreen></iframe>
    `;
    container.appendChild(div);
  });
}

// Timeline
const timelineItems = [
  { year: "2024", desc: "Awal perjalanan di Informatiquee Fatmawati" },
  { year: "2025", desc: "Banyak proyek bersama dan kenangan lucu" },
  { year: "2026", desc: "Hari-hari terakhir sebelum wisuda" }
];

function loadTimeline() {
  const tl = document.getElementById('timeline');
  tl.innerHTML = '';

  timelineItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.innerHTML = `<h3>${item.year}</h3><p>${item.desc}</p>`;
    tl.appendChild(div);
  });
}

// Messages
let messages = [];

function submitMessage() {
  const nama = document.getElementById('nama').value.trim();
  const pesan = document.getElementById('pesan').value.trim();

  if (!nama || !pesan) {
    alert("Mohon isi nama dan pesan!");
    return;
  }

  messages.unshift({ nama, pesan, time: new Date().toLocaleDateString('id-ID') });

  renderMessages();
  document.getElementById('nama').value = '';
  document.getElementById('pesan').value = '';
}

function renderMessages() {
  const container = document.getElementById('messages');
  container.innerHTML = '';

  messages.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = `
      <strong>${msg.nama}</strong> 
      <small>— ${msg.time}</small>
      <p>${msg.pesan}</p>
    `;
    container.appendChild(card);
  });
}

// Initialize everything
window.onload = () => {
  loadVideos();
  loadTimeline();
  renderMessages();
};