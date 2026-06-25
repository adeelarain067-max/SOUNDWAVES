// ============================================================
// data.js  –  SoundWave Music Player
// All seed data: songs, playlists, users, genres
// ============================================================

export const GENRES = [
  "All", "Electronic", "Indie", "Rock", "Ambient",
  "Hip-Hop", "Synth-Pop", "Folk", "Jazz", "Classical",
];

// Note frequencies used by the Web-Audio tone generator (audioEngine.js)
// Each song has a unique root key so it sounds distinct.
export const SONGS = [
  {
    id: 1,
    title: "Midnight Echoes",
    artist: "Luna Shade",
    album: "Neon Horizon",
    genre: "Electronic",
    duration: 214,          // seconds
    bpm: 128,
    year: 2024,
    plays: 1_240_000,
    liked: false,
    color: "#7C3AED",       // accent colour for album art
    rootHz: 220,            // A3  – tone generator root
    waveform: "sawtooth",
  },
  {
    id: 2,
    title: "Golden Hour",
    artist: "The Sundials",
    album: "Summer Static",
    genre: "Indie",
    duration: 198,
    bpm: 95,
    year: 2023,
    plays: 892_000,
    liked: true,
    color: "#D97706",
    rootHz: 261.63,         // C4
    waveform: "sine",
  },
  {
    id: 3,
    title: "Crimson Tide",
    artist: "Red Phantom",
    album: "Deep Waters",
    genre: "Rock",
    duration: 245,
    bpm: 140,
    year: 2024,
    plays: 654_000,
    liked: false,
    color: "#DC2626",
    rootHz: 293.66,         // D4
    waveform: "square",
  },
  {
    id: 4,
    title: "Floating Dreams",
    artist: "Aether",
    album: "Cloud Atlas",
    genre: "Ambient",
    duration: 312,
    bpm: 70,
    year: 2023,
    plays: 430_000,
    liked: false,
    color: "#0891B2",
    rootHz: 174.61,         // F3
    waveform: "sine",
  },
  {
    id: 5,
    title: "Street Lights",
    artist: "Urban Echo",
    album: "City Pulse",
    genre: "Hip-Hop",
    duration: 187,
    bpm: 90,
    year: 2024,
    plays: 2_100_000,
    liked: true,
    color: "#059669",
    rootHz: 196.00,         // G3
    waveform: "sawtooth",
  },
  {
    id: 6,
    title: "Velvet Thunder",
    artist: "Storm Cellar",
    album: "Dark Matter",
    genre: "Electronic",
    duration: 228,
    bpm: 135,
    year: 2023,
    plays: 780_000,
    liked: false,
    color: "#7C3AED",
    rootHz: 246.94,         // B3
    waveform: "sawtooth",
  },
  {
    id: 7,
    title: "Neon Bloom",
    artist: "Pixel Garden",
    album: "Digital Spring",
    genre: "Synth-Pop",
    duration: 202,
    bpm: 118,
    year: 2024,
    plays: 560_000,
    liked: true,
    color: "#EC4899",
    rootHz: 329.63,         // E4
    waveform: "sine",
  },
  {
    id: 8,
    title: "Hollow Mountains",
    artist: "Terra Folk",
    album: "Root & Branch",
    genre: "Folk",
    duration: 267,
    bpm: 82,
    year: 2023,
    plays: 345_000,
    liked: false,
    color: "#92400E",
    rootHz: 164.81,         // E3
    waveform: "triangle",
  },
  {
    id: 9,
    title: "Pulse Code",
    artist: "Digital Nomad",
    album: "Binary Dreams",
    genre: "Electronic",
    duration: 194,
    bpm: 145,
    year: 2024,
    plays: 1_560_000,
    liked: false,
    color: "#1D4ED8",
    rootHz: 369.99,         // F#4
    waveform: "square",
  },
  {
    id: 10,
    title: "Sunday Mornin'",
    artist: "The Rye Fields",
    album: "Soft Landing",
    genre: "Folk",
    duration: 223,
    bpm: 76,
    year: 2023,
    plays: 290_000,
    liked: true,
    color: "#65A30D",
    rootHz: 130.81,         // C3
    waveform: "triangle",
  },
  {
    id: 11,
    title: "Afterglow",
    artist: "Lunar Waves",
    album: "Tidal",
    genre: "Indie",
    duration: 238,
    bpm: 100,
    year: 2024,
    plays: 710_000,
    liked: false,
    color: "#0369A1",
    rootHz: 311.13,         // Eb4
    waveform: "sine",
  },
  {
    id: 12,
    title: "Iron Will",
    artist: "Forge & Fire",
    album: "Steel Curtain",
    genre: "Rock",
    duration: 256,
    bpm: 155,
    year: 2023,
    plays: 890_000,
    liked: false,
    color: "#B45309",
    rootHz: 277.18,         // C#4
    waveform: "square",
  },
];

export const INITIAL_PLAYLISTS = [
  { id: 1, name: "My Favorites",  songs: [2, 5, 7, 10], color: "#7C3AED", icon: "♥" },
  { id: 2, name: "Workout Mix",   songs: [3, 6, 9, 12],  color: "#DC2626", icon: "⚡" },
  { id: 3, name: "Chill Vibes",   songs: [1, 4, 8, 11],  color: "#0891B2", icon: "🌊" },
];

export const DEMO_USERS = [
  {
    id: 1,
    name: "Alex Rivera",
    email: "demo@soundwave.com",
    password: "demo123",
    avatar: "AR",
  },
  {
    id: 2,
    name: "Jordan Lee",
    email: "test@soundwave.com",
    password: "test123",
    avatar: "JL",
  },
];

// ── Helpers ─────────────────────────────────────────────────────
export const fmtTime = (sec) =>
  `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

export const fmtPlays = (n) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(0)}K`
  : `${n}`;