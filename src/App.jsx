
import { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";

// Data
import { SONGS, INITIAL_PLAYLISTS, fmtTime } from "./data.js";

// Audio
import { playSong as audioPlay, stopCurrent, setVolume as audioSetVolume, setMuted as audioSetMuted } from "./audioEngine.js";

// Pages & auth
import LoginPage   from "./LoginPage.jsx";
import Sidebar     from "./Sidebar.jsx";
import PlayerBar   from "./PlayerBar.jsx";

// Views
import {
  HomeView, SearchView, PlaylistsView,
  PlaylistDetailView, LikedView, DownloadsView, ProfileView,
} from "./views.jsx";

// Shared components
import { Toast, AddToPlaylistModal } from "./components.jsx";

// ── Helpers ──────────────────────────────────────────────────
const TICK_MS = 500; // how often progress updates (ms)

export default function App() {
  // ── Auth ─────────────────────────────────────────────────
  const [user, setUser] = useState(null);

  // ── Song catalogue ────────────────────────────────────────
  const [songs, setSongs]           = useState(SONGS);
  const [playlists, setPlaylists]   = useState(INITIAL_PLAYLISTS);
  const [downloads, setDownloads]   = useState([]);   // array of song ids

  // ── Playback state ────────────────────────────────────────
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [progress,    setProgress]    = useState(0);   // 0-100
  const [volume,      setVolumeState] = useState(80);
  const [muted,       setMuted]       = useState(false);
  const [shuffle,     setShuffle]     = useState(false);
  const [repeatMode,  setRepeatMode]  = useState(0);  // 0=off 1=all 2=one
  const [queue,       setQueue]       = useState([...SONGS]);

  // ── UI state ──────────────────────────────────────────────
  const [activeView,     setActiveView]     = useState("home");
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [search,         setSearch]         = useState("");
  const [activeGenre,    setActiveGenre]    = useState("All");
  const [toast,          setToast]          = useState(null);
  const [addToModal,     setAddToModal]     = useState(null); // songId or null

  const stopFnRef  = useRef(null);  // ref to current audio stop function
  const tickRef    = useRef(null);  // interval id for progress simulation

  // ────────────────────────────────────────────────────────
  // Toast helper
  // ────────────────────────────────────────────────────────
  const showToast = useCallback((msg, icon = "✓") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ────────────────────────────────────────────────────────
  // Progress ticker
  // ────────────────────────────────────────────────────────
  const startTick = useCallback((song) => {
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(tickRef.current); return 100; }
        return prev + (100 / (song.duration / (TICK_MS / 1000)));
      });
    }, TICK_MS);
  }, []);

  const stopTick = () => clearInterval(tickRef.current);

  // Auto-advance when track finishes
  useEffect(() => {
    if (progress >= 100) handleNext();
  }, [progress]); // eslint-disable-line

  // ────────────────────────────────────────────────────────
  // Core play / stop
  // ────────────────────────────────────────────────────────
  const playSong = useCallback((song, newQueue = null) => {
    // Stop current audio
    stopTick();
    if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }

    // Start new audio
    stopFnRef.current = audioPlay(song);
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    if (newQueue) setQueue(newQueue);
    startTick(song);
    showToast(`Playing "${song.title}"`, "🎵");
  }, [startTick, showToast]);

  const handlePlayPause = useCallback(() => {
    if (!currentSong) {
      if (songs.length) playSong(songs[0], songs);
      return;
    }
    if (isPlaying) {
      // Pause: stop audio node but keep state
      stopTick();
      if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }
      setIsPlaying(false);
    } else {
      // Resume
      stopFnRef.current = audioPlay(currentSong);
      setIsPlaying(true);
      startTick(currentSong);
    }
  }, [currentSong, isPlaying, songs, playSong, startTick]);

  const handleNext = useCallback(() => {
    if (!currentSong) return;
    const idx = queue.findIndex(s => s.id === currentSong.id);
    let next;
    if (shuffle) {
      next = queue[Math.floor(Math.random() * queue.length)];
    } else if (repeatMode === 2) {
      next = currentSong;
    } else {
      next = queue[(idx + 1) % queue.length];
    }
    if (next) playSong(next, queue);
  }, [currentSong, queue, shuffle, repeatMode, playSong]);

  const handlePrev = useCallback(() => {
    if (!currentSong) return;
    // If more than 3s in, restart; else go back
    if (progress > 5) {
      setProgress(0);
      if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }
      stopFnRef.current = audioPlay(currentSong);
      startTick(currentSong);
      return;
    }
    const idx = queue.findIndex(s => s.id === currentSong.id);
    const prev = queue[(idx - 1 + queue.length) % queue.length];
    if (prev) playSong(prev, queue);
  }, [currentSong, progress, queue, playSong, startTick]);

  const handleSeek = useCallback((pct) => {
    setProgress(pct);
    // Restart audio from current song (Web Audio doesn't seek, so we re-trigger)
    if (currentSong && isPlaying) {
      stopTick();
      if (stopFnRef.current) { stopFnRef.current(); stopFnRef.current = null; }
      stopFnRef.current = audioPlay(currentSong);
      startTick(currentSong);
    }
  }, [currentSong, isPlaying, startTick]);

  // ────────────────────────────────────────────────────────
  // Volume
  // ────────────────────────────────────────────────────────
  const handleVolume = (val) => {
    setVolumeState(val);
    setMuted(false);
    audioSetVolume(val / 100);
  };

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    audioSetMuted(next);
    if (!next) audioSetVolume(volume / 100);
  };

  // ────────────────────────────────────────────────────────
  // Like / download / playlist
  // ────────────────────────────────────────────────────────
  const toggleLike = (songId) => {
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, liked: !s.liked } : s));
    const song = songs.find(s => s.id === songId);
    showToast(song?.liked ? "Removed from liked" : "Added to liked ♥", "♥");
  };

  const likeCurrentSong = () => currentSong && toggleLike(currentSong.id);

  const downloadSong = (song) => {
    if (downloads.includes(song.id)) return;
    setDownloads(prev => [...prev, song.id]);
    showToast(`"${song.title}" saved offline`, "⬇");
  };

  const addSongToPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(pl =>
      pl.id === playlistId && !pl.songs.includes(songId)
        ? { ...pl, songs: [...pl.songs, songId] }
        : pl
    ));
    const pl = playlists.find(p => p.id === playlistId);
    showToast(`Added to "${pl?.name}"`, "✓");
    setAddToModal(null);
  };

  const createPlaylist = (name) => {
    const colors = ["#7C3AED","#DC2626","#0891B2","#059669","#D97706","#EC4899"];
    const icons  = ["♪","★","♥","⚡","🎵","🌊"];
    const id = Date.now();
    setPlaylists(prev => [...prev, { id, name, songs: [], color: colors[id % colors.length], icon: icons[id % icons.length] }]);
    showToast(`"${name}" created!`, "✓");
  };

  // ── Derived ──────────────────────────────────────────────
  const likedSongs  = songs.filter(s => s.liked);
  const likedCount  = likedSongs.length;

  // ── Cleanup on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      stopTick();
      stopCurrent();
    };
  }, []);

  // ────────────────────────────────────────────────────────
  // Render: login gate
  // ────────────────────────────────────────────────────────
  if (!user) return <LoginPage onLogin={setUser} />;

  // ────────────────────────────────────────────────────────
  // Main view selector
  // ────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeView) {
      case "home":
        return (
          <HomeView
            user={user} songs={songs}
            currentSong={currentSong} isPlaying={isPlaying}
            onPlaySong={playSong} onPlayPause={handlePlayPause}
            setActiveView={setActiveView} setActiveGenre={setActiveGenre}
          />
        );

      case "search":
      case "library":
        return (
          <SearchView
            songs={songs} currentSong={currentSong} isPlaying={isPlaying}
            onPlaySong={playSong}
            onLike={toggleLike} onDownload={downloadSong}
            downloads={downloads} onAddToPlaylist={id => setAddToModal(id)}
            search={search} setSearch={setSearch}
            activeGenre={activeGenre} setActiveGenre={setActiveGenre}
            title={activeView === "search" ? "Search" : "Library"}
          />
        );

      case "playlists":
        return (
          <PlaylistsView
            playlists={playlists} songs={songs} likedSongs={likedSongs}
            setActivePlaylist={setActivePlaylist} setActiveView={setActiveView}
            onPlaySong={playSong} showToast={showToast} onCreatePlaylist={createPlaylist}
          />
        );

      case "playlist":
        return (
          <PlaylistDetailView
            playlist={activePlaylist} songs={songs}
            currentSong={currentSong} isPlaying={isPlaying}
            onPlaySong={playSong}
            onLike={toggleLike} onDownload={downloadSong}
            downloads={downloads} onAddToPlaylist={id => setAddToModal(id)}
          />
        );

      case "liked":
        return (
          <LikedView
            songs={songs} currentSong={currentSong} isPlaying={isPlaying}
            onPlaySong={playSong}
            onLike={toggleLike} onDownload={downloadSong}
            downloads={downloads} onAddToPlaylist={id => setAddToModal(id)}
          />
        );

      case "downloads":
        return (
          <DownloadsView
            songs={songs} downloads={downloads}
            currentSong={currentSong} isPlaying={isPlaying}
            onPlaySong={playSong}
            onLike={toggleLike} onDownload={downloadSong}
            onAddToPlaylist={id => setAddToModal(id)}
          />
        );

      case "profile":
        return (
          <ProfileView
            user={user} songs={songs} downloads={downloads}
            playlists={playlists} likedCount={likedCount}
            onLogout={() => { stopCurrent(); setUser(null); setIsPlaying(false); setCurrentSong(null); }}
          />
        );

      default:
        return null;
    }
  };

  // ────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        playlists={playlists}
        activePlaylist={activePlaylist}
        setActivePlaylist={setActivePlaylist}
        likedCount={likedCount}
      />

      {/* Main scroll area */}
      <main className="main-scroll">
        {renderView()}
      </main>

      {/* Player bar */}
      <PlayerBar
        song={currentSong}
        isPlaying={isPlaying}
        progress={progress}
        volume={volume}
        muted={muted}
        shuffle={shuffle}
        repeatMode={repeatMode}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolume={handleVolume}
        onMute={handleMute}
        onShuffle={() => setShuffle(p => !p)}
        onRepeat={() => setRepeatMode(m => (m + 1) % 3)}
        onLike={likeCurrentSong}
      />

      {/* Add to playlist modal */}
      {addToModal && (
        <AddToPlaylistModal
          playlists={playlists}
          onAdd={plId => addSongToPlaylist(plId, addToModal)}
          onClose={() => setAddToModal(null)}
        />
      )}

      {/* Toast notification */}
      <Toast toast={toast} />
    </div>
  );
}
