

import { useState } from "react";
import { fmtTime, fmtPlays } from "./data.js";

// ── AlbumArt ─────────────────────────────────────────────────
export function AlbumArt({ song, size = 56, spinning = false, style = {} }) {
  if (!song) return (
    <div style={{ width: size, height: size, borderRadius: size > 80 ? 16 : 10, background: "rgba(255,255,255,0.06)", flexShrink: 0, ...style }} />
  );
  return (
    <div
      className={`album-art${spinning ? " spinning" : ""}`}
      style={{
        width: size, height: size,
        borderRadius: size > 80 ? 16 : 10,
        background: `linear-gradient(135deg, ${song.color}cc 0%, ${song.color}44 100%)`,
        fontSize: size * 0.38,
        flexShrink: 0,
        ...style,
      }}
    >
      <span style={{ pointerEvents: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>♪</span>
      {/* shine overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)" }} />
    </div>
  );
}

// ── Visualiser (animated bars when playing) ──────────────────
export function Visualiser({ isPlaying, color = "#8B5CF6", bars = 20, height = 32 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height, paddingBottom: 2 }}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={`vis-bar${isPlaying ? " playing" : ""}`}
          style={{
            background: color,
            height: `${Math.sin(i * 0.9) * 60 + 40}%`,
            "--dur": `${0.4 + (i % 5) * 0.08}s`,
            animationDelay: `${(i % 7) * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Icon SVG ─────────────────────────────────────────────────
const PATHS = {
  play:      <polygon points="5,3 19,12 5,21" fill="currentColor" />,
  pause:     <><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></>,
  next:      <><polygon points="5,4 15,12 5,20" fill="currentColor"/><rect x="16" y="4" width="3" height="16" fill="currentColor"/></>,
  prev:      <><polygon points="19,4 9,12 19,20" fill="currentColor"/><rect x="5" y="4" width="3" height="16" fill="currentColor"/></>,
  shuffle:   <><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  repeat:    <><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  heart:     <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="none"/>,
  heartFill: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>,
  vol:       <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  mute:      <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2"/></>,
  search:    <><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/></>,
  home:      <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/><polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  music:     <><path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  list:      <><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/></>,
  plus:      <><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/></>,
  download:  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" fill="none"/><polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/></>,
  user:      <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  logout:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" fill="none"/><polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/></>,
  check:     <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" fill="none"/>,
  x:         <><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/></>,
  trending:  <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" fill="none"/><polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  grid:      <><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  eq:        <><line x1="4" y1="21" x2="4" y2="14" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="10" x2="4" y2="3" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="21" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/><line x1="20" y1="21" x2="20" y2="16" stroke="currentColor" strokeWidth="2"/><line x1="20" y1="12" x2="20" y2="3" stroke="currentColor" strokeWidth="2"/><line x1="1" y1="14" x2="7" y2="14" stroke="currentColor" strokeWidth="2"/><line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="2"/><line x1="17" y1="16" x2="23" y2="16" stroke="currentColor" strokeWidth="2"/></>,
};

export function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      {PATHS[name] || null}
    </svg>
  );
}

// ── Toast ─────────────────────────────────────────────────────
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast">
      <span style={{ fontSize: "1rem" }}>{toast.icon}</span>
      <span>{toast.msg}</span>
    </div>
  );
}

// ── Song Row ──────────────────────────────────────────────────
export function SongRow({
  song, index, isActive, isPlaying,
  onPlay, onLike, onDownload, isDownloaded, onAddToPlaylist,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`song-row${isActive ? " active" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Index / play toggle */}
      <div
        onClick={onPlay}
        style={{ width: 28, textAlign: "center", flexShrink: 0, cursor: "pointer" }}
      >
        {hovered || isActive ? (
          <button className="btn-ghost" style={{ padding: 0, color: isActive ? "#A78BFA" : "#fff" }}>
            <Icon name={isActive && isPlaying ? "pause" : "play"} size={16} />
          </button>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{index + 1}</span>
        )}
      </div>

      {/* Album art */}
      <AlbumArt song={song} size={40} spinning={isActive && isPlaying} />

      {/* Title / artist */}
      <div onClick={onPlay} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
        <p style={{ margin: 0, fontWeight: isActive ? 700 : 500, color: isActive ? "#A78BFA" : "#fff", fontSize: "0.88rem" }} className="truncate">{song.title}</p>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.78rem" }}>{song.artist}</p>
      </div>

      {/* Album (hidden on small) */}
      <span className="truncate" style={{ color: "var(--text-muted)", fontSize: "0.78rem", minWidth: 90, maxWidth: 120 }}>{song.album}</span>

      {/* Genre chip */}
      <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", background: "rgba(255,255,255,0.05)", padding: "3px 9px", borderRadius: 6, minWidth: 70, textAlign: "center" }}>{song.genre}</span>

      {/* Duration */}
      <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", minWidth: 36, textAlign: "right" }}>{fmtTime(song.duration)}</span>

      {/* Actions */}
      <div style={{ display: "flex", gap: 2, opacity: hovered || isActive ? 1 : 0.25, transition: "opacity 0.2s" }}>
        <button className="btn-ghost" onClick={e => { e.stopPropagation(); onLike(); }}
          style={{ padding: "5px", color: song.liked ? "#EC4899" : "var(--text-muted)" }}>
          <Icon name={song.liked ? "heartFill" : "heart"} size={16} />
        </button>
        <button className="btn-ghost" onClick={e => { e.stopPropagation(); onDownload(); }}
          style={{ padding: "5px", color: isDownloaded ? "#22C55E" : "var(--text-muted)" }}>
          <Icon name={isDownloaded ? "check" : "download"} size={16} />
        </button>
        <button className="btn-ghost" onClick={e => { e.stopPropagation(); onAddToPlaylist(); }}
          style={{ padding: "5px" }}>
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Add-to-Playlist Modal ─────────────────────────────────────
export function AddToPlaylistModal({ playlists, onAdd, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Add to Playlist</h3>
          <button className="btn-ghost" style={{ padding: 4 }} onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        {playlists.map(pl => (
          <button key={pl.id} onClick={() => onAdd(pl.id)}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, color: "#fff", marginBottom: 8, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: pl.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{pl.icon}</div>
            <span style={{ flex: 1, textAlign: "left", fontWeight: 500, fontSize: "0.88rem" }}>{pl.name}</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{pl.songs.length} songs</span>
          </button>
        ))}
      </div>
    </div>
  );
}
