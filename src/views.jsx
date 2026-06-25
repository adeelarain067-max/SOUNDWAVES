
import { useState } from "react";
import { GENRES, fmtPlays, fmtTime } from "./data.js";
import { AlbumArt, SongRow, Icon, Visualiser } from "./components.jsx";

// ── shared section heading ────────────────────────────────────
function H2({ children }) {
  return <h2 style={{ margin: "0 0 18px", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.3px" }}>{children}</h2>;
}

// ── Small "now playing" card shown at top of Home ─────────────
function NowPlayingBanner({ song, isPlaying, onPlayPause }) {
  if (!song) return null;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${song.color}28 0%, ${song.color}08 100%)`,
      border: `1px solid ${song.color}44`,
      borderRadius: 20, padding: "20px 22px",
      display: "flex", alignItems: "center", gap: 18, marginBottom: 32,
    }}>
      <AlbumArt song={song} size={72} spinning={isPlaying} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px" }}>Now Playing</p>
        <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: "1.15rem" }} className="truncate">{song.title}</p>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>{song.artist} · {song.album}</p>
      </div>
      {isPlaying && <Visualiser isPlaying={isPlaying} color={song.color} bars={14} height={30} />}
      <button onClick={onPlayPause}
        style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gradient-primary)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px ${song.color}66`, flexShrink: 0 }}>
        <Icon name={isPlaying ? "pause" : "play"} size={20} />
      </button>
    </div>
  );
}

// ── Genre colour palette ──────────────────────────────────────
const GENRE_COLORS = ["#7C3AED","#DC2626","#0891B2","#059669","#D97706","#EC4899","#B45309","#0369A1","#065F46","#7C2D12"];

// ════════════════════════════════════════════════════════════
// HOME VIEW
// ════════════════════════════════════════════════════════════
export function HomeView({ user, songs, currentSong, isPlaying, onPlaySong, onPlayPause, setActiveView, setActiveGenre }) {
  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };

  return (
    <div style={{ padding: "28px 32px", animation: "fadeIn 0.3s ease" }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "1.9rem", fontWeight: 900, letterSpacing: "-0.5px" }}>
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.88rem" }}>
          {songs.filter(s => s.liked).length} liked songs in your library
        </p>
      </div>

      {/* Now Playing Banner */}
      <NowPlayingBanner song={currentSong} isPlaying={isPlaying} onPlayPause={onPlayPause} />

      {/* Top Tracks grid */}
      <H2>🔥 Top Tracks</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14, marginBottom: 36 }}>
        {songs.slice(0, 6).map(song => (
          <div key={song.id} className="card card-hover"
            onClick={() => onPlaySong(song, songs)}
            style={{
              padding: 16, cursor: "pointer",
              background: currentSong?.id === song.id
                ? `linear-gradient(135deg,${song.color}22, rgba(255,255,255,0.025))`
                : "var(--bg-surface)",
              borderColor: currentSong?.id === song.id ? song.color + "55" : "var(--border)",
            }}>
            <AlbumArt song={song} size={110} spinning={currentSong?.id === song.id && isPlaying} style={{ width: "100%", height: 110 }} />
            <p style={{ margin: "12px 0 2px", fontWeight: 700, fontSize: "0.88rem" }} className="truncate">{song.title}</p>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.78rem" }}>{song.artist}</p>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.7rem" }}>{fmtPlays(song.plays)} plays</p>
          </div>
        ))}
      </div>

      {/* Genre Browse */}
      <H2>Browse Genres</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
        {GENRES.slice(1).map((g, i) => (
          <div key={g}
            onClick={() => { setActiveGenre(g); setActiveView("search"); }}
            style={{ height: 76, borderRadius: 14, background: GENRE_COLORS[i % GENRE_COLORS.length] + "28", border: `1px solid ${GENRE_COLORS[i % GENRE_COLORS.length]}44`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", color: GENRE_COLORS[i % GENRE_COLORS.length], transition: "transform 0.18s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >{g}</div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SEARCH / LIBRARY VIEW
// ════════════════════════════════════════════════════════════
export function SearchView({
  songs, currentSong, isPlaying, onPlaySong,
  onLike, onDownload, downloads, onAddToPlaylist,
  search, setSearch, activeGenre, setActiveGenre,
  title = "Search",
}) {
  const filtered = songs.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q);
    const matchG = activeGenre === "All" || s.genre === activeGenre;
    return matchQ && matchG;
  });

  return (
    <div style={{ padding: "28px 32px", animation: "fadeIn 0.3s ease" }}>
      <H2>{title === "Search" ? "🔍 Search" : "🎵 Your Library"}</H2>

      {/* Search input */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
          <Icon name="search" size={17} />
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search songs, artists, albums…"
          style={{ width: "100%", padding: "13px 16px 13px 42px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 14, color: "#fff", fontSize: "0.92rem", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = "#8B5CF6"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {/* Genre chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {GENRES.map(g => (
          <button key={g} className={`genre-chip${activeGenre === g ? " active" : ""}`}
            onClick={() => setActiveGenre(g)}>{g}</button>
        ))}
      </div>

      {/* Song list header */}
      <div style={{ display: "flex", gap: 14, padding: "0 12px 8px", color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
        <span style={{ width: 28, textAlign: "center" }}>#</span>
        <span style={{ width: 40 }} />
        <span style={{ flex: 1 }}>Title</span>
        <span style={{ minWidth: 90 }}>Album</span>
        <span style={{ minWidth: 70 }}>Genre</span>
        <span style={{ minWidth: 36, textAlign: "right" }}>Time</span>
        <span style={{ minWidth: 80 }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "2.5rem", margin: "0 0 12px" }}>🔍</p>
          <p>No songs match "{search}"</p>
        </div>
      ) : filtered.map((song, i) => (
        <SongRow
          key={song.id} song={song} index={i}
          isActive={currentSong?.id === song.id}
          isPlaying={isPlaying}
          onPlay={() => onPlaySong(song, filtered)}
          onLike={() => onLike(song.id)}
          onDownload={() => onDownload(song)}
          isDownloaded={downloads.includes(song.id)}
          onAddToPlaylist={() => onAddToPlaylist(song.id)}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PLAYLISTS VIEW
// ════════════════════════════════════════════════════════════
export function PlaylistsView({ playlists, songs, likedSongs, setActivePlaylist, setActiveView, onPlaySong, showToast, onCreatePlaylist }) {
  const [newName, setNewName] = useState("");

  const create = () => {
    if (!newName.trim()) return;
    onCreatePlaylist(newName.trim());
    setNewName("");
  };

  return (
    <div style={{ padding: "28px 32px", animation: "fadeIn 0.3s ease" }}>
      <H2>📋 Playlists</H2>

      {/* Create */}
      <div className="card" style={{ padding: 20, marginBottom: 28 }}>
        <p style={{ fontWeight: 600, margin: "0 0 12px", fontSize: "0.9rem" }}>Create new playlist</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && create()}
            placeholder="Playlist name…"
            style={{ flex: 1, padding: "11px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", borderRadius: 10, color: "#fff", fontSize: "0.88rem" }}
          />
          <button className="btn-primary" onClick={create} style={{ padding: "11px 20px", fontSize: "0.88rem" }}>Create</button>
        </div>
      </div>

      {/* Grid of playlists */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
        {/* Liked songs card */}
        <div className="card card-hover"
          onClick={() => setActiveView("liked")}
          style={{ padding: 20, cursor: "pointer", background: "linear-gradient(135deg,rgba(236,72,153,0.18),rgba(139,92,246,0.08))", borderColor: "rgba(236,72,153,0.25)" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>♥</div>
          <p style={{ margin: "0 0 4px", fontWeight: 700 }}>Liked Songs</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.78rem" }}>{likedSongs.length} songs</p>
        </div>

        {playlists.map(pl => {
          const plSongs = songs.filter(s => pl.songs.includes(s.id));
          return (
            <div key={pl.id} className="card card-hover"
              onClick={() => { setActivePlaylist(pl); setActiveView("playlist"); }}
              style={{ padding: 20, cursor: "pointer", background: pl.color + "12", borderColor: pl.color + "30" }}>
              <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{pl.icon}</div>
              <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{pl.name}</p>
              <p style={{ margin: "0 0 14px", color: "var(--text-secondary)", fontSize: "0.78rem" }}>{plSongs.length} songs</p>
              <button
                onClick={e => { e.stopPropagation(); if (plSongs.length) onPlaySong(plSongs[0], plSongs); }}
                style={{ padding: "7px 14px", background: pl.color + "33", border: `1px solid ${pl.color}44`, borderRadius: 8, color: pl.color, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                ▶ Play All
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PLAYLIST DETAIL VIEW
// ════════════════════════════════════════════════════════════
export function PlaylistDetailView({ playlist, songs, currentSong, isPlaying, onPlaySong, onLike, onDownload, downloads, onAddToPlaylist }) {
  if (!playlist) return null;
  const plSongs = songs.filter(s => playlist.songs.includes(s.id));

  return (
    <div style={{ padding: "28px 32px", animation: "slideLeft 0.3s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 28 }}>
        <div style={{ width: 100, height: 100, borderRadius: 18, background: playlist.color + "30", border: `1px solid ${playlist.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem", flexShrink: 0 }}>{playlist.icon}</div>
        <div>
          <p style={{ color: "var(--text-muted)", margin: "0 0 4px", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px" }}>Playlist</p>
          <h1 style={{ margin: "0 0 4px", fontSize: "2rem", fontWeight: 900 }}>{playlist.name}</h1>
          <p style={{ margin: "0 0 16px", color: "var(--text-secondary)" }}>{plSongs.length} songs</p>
          <button className="btn-primary"
            onClick={() => plSongs.length && onPlaySong(plSongs[0], plSongs)}
            style={{ padding: "10px 24px", fontSize: "0.88rem", background: `linear-gradient(135deg,${playlist.color},${playlist.color}aa)` }}>
            ▶ Play All
          </button>
        </div>
      </div>

      {plSongs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <p>This playlist is empty. Add songs from the Library.</p>
        </div>
      ) : plSongs.map((song, i) => (
        <SongRow key={song.id} song={song} index={i}
          isActive={currentSong?.id === song.id} isPlaying={isPlaying}
          onPlay={() => onPlaySong(song, plSongs)}
          onLike={() => onLike(song.id)}
          onDownload={() => onDownload(song)}
          isDownloaded={downloads.includes(song.id)}
          onAddToPlaylist={() => onAddToPlaylist(song.id)}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// LIKED SONGS VIEW
// ════════════════════════════════════════════════════════════
export function LikedView({ songs, currentSong, isPlaying, onPlaySong, onLike, onDownload, downloads, onAddToPlaylist }) {
  const liked = songs.filter(s => s.liked);
  return (
    <div style={{ padding: "28px 32px", animation: "slideLeft 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
        <div style={{ width: 96, height: 96, borderRadius: 18, background: "linear-gradient(135deg,rgba(236,72,153,0.3),rgba(139,92,246,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem" }}>♥</div>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "2rem", fontWeight: 900 }}>Liked Songs</h1>
          <p style={{ margin: "0 0 16px", color: "var(--text-secondary)" }}>{liked.length} songs</p>
          <button className="btn-primary" onClick={() => liked.length && onPlaySong(liked[0], liked)} style={{ padding: "10px 24px", fontSize: "0.88rem", background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>▶ Play All</button>
        </div>
      </div>
      {liked.map((song, i) => (
        <SongRow key={song.id} song={song} index={i}
          isActive={currentSong?.id === song.id} isPlaying={isPlaying}
          onPlay={() => onPlaySong(song, liked)}
          onLike={() => onLike(song.id)}
          onDownload={() => onDownload(song)}
          isDownloaded={downloads.includes(song.id)}
          onAddToPlaylist={() => onAddToPlaylist(song.id)}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// DOWNLOADS VIEW
// ════════════════════════════════════════════════════════════
export function DownloadsView({ songs, downloads, currentSong, isPlaying, onPlaySong, onLike, onDownload, onAddToPlaylist }) {
  const saved = songs.filter(s => downloads.includes(s.id));
  return (
    <div style={{ padding: "28px 32px", animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "1.6rem", fontWeight: 900 }}>⬇ Downloads</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.88rem" }}>{saved.length} songs available offline</p>
      </div>
      {saved.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>📥</p>
          <p>No downloads yet. Download songs to listen offline.</p>
        </div>
      ) : saved.map((song, i) => (
        <SongRow key={song.id} song={song} index={i}
          isActive={currentSong?.id === song.id} isPlaying={isPlaying}
          onPlay={() => onPlaySong(song, saved)}
          onLike={() => onLike(song.id)}
          onDownload={() => onDownload(song)}
          isDownloaded={true}
          onAddToPlaylist={() => onAddToPlaylist(song.id)}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PROFILE VIEW
// ════════════════════════════════════════════════════════════
export function ProfileView({ user, songs, downloads, playlists, likedCount, onLogout }) {
  return (
    <div style={{ padding: "28px 32px", animation: "fadeIn 0.3s ease" }}>
      <H2>👤 Profile</H2>
      <div className="card" style={{ maxWidth: 460, padding: 28 }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gradient-pink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 900, flexShrink: 0 }}>{user?.avatar}</div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800 }}>{user?.name}</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            ["♥", likedCount, "Liked"],
            ["📋", playlists.length, "Playlists"],
            ["⬇", downloads.length, "Downloaded"],
          ].map(([icon, val, label]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>{icon}</p>
              <p style={{ margin: "0 0 2px", fontWeight: 900, fontSize: "1.3rem", color: "var(--purple-light)" }}>{val}</p>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.72rem" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Library stats */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: "0.85rem" }}>Your Taste</p>
          {Object.entries(
            songs.filter(s => s.liked).reduce((acc, s) => ({ ...acc, [s.genre]: (acc[s.genre] || 0) + 1 }), {})
          ).slice(0, 4).map(([genre, count]) => (
            <div key={genre} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", minWidth: 80 }}>{genre}</span>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                <div style={{ width: `${(count / likedCount) * 100}%`, height: "100%", background: "var(--gradient-primary)", borderRadius: 2 }} />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{count}</span>
            </div>
          ))}
        </div>

        <button onClick={onLogout}
          style={{ width: "100%", padding: 13, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, color: "#F87171", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="logout" size={17} /> Sign Out
        </button>
      </div>
    </div>
  );
}
