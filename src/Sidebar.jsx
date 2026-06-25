// ============================================================
// Sidebar.jsx  –  SoundWave Music Player
// Left navigation: logo, nav links, playlist quick-jump,
// online (simulated) status.
// ============================================================

import { Icon } from "./components.jsx";

const NAV = [
  { id: "home",      icon: "home",     label: "Home"      },
  { id: "search",    icon: "search",   label: "Search"    },
  { id: "library",   icon: "music",    label: "Library"   },
  { id: "playlists", icon: "list",     label: "Playlists" },
  { id: "downloads", icon: "download", label: "Downloads" },
  { id: "profile",   icon: "user",     label: "Profile"   },
];

export default function Sidebar({
  user,
  activeView,
  setActiveView,
  playlists,
  activePlaylist,
  setActivePlaylist,
  likedCount,
  friendCount = 0,
}) {
  const go = (view) => { setActiveView(view); setActivePlaylist(null); };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "22px 10px 18px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#8B5CF6,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🎵</div>
        <span style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.3px" }}>SoundWave</span>
      </div>

      {/* User mini-card */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", marginBottom: 12, cursor: "pointer" }}
        onClick={() => go("profile")}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>{user?.avatar}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.82rem" }} className="truncate">{user?.name}</p>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.7rem" }}>{likedCount} liked</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ marginBottom: 12 }}>
        {NAV.map(n => (
          <button key={n.id} className={`nav-link${activeView === n.id ? " active" : ""}`}
            onClick={() => go(n.id)}>
            <Icon name={n.icon} size={17} />
            {n.label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "4px 8px 14px" }} />

      {/* Playlists */}
      <p style={{ color: "var(--text-muted)", fontSize: "0.67rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 8px 10px" }}>Playlists</p>
      {playlists.map(pl => (
        <button key={pl.id} className={`nav-link${activePlaylist?.id === pl.id ? " active" : ""}`}
          onClick={() => { setActivePlaylist(pl); setActiveView("playlist"); }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: pl.color + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>{pl.icon}</div>
          <span className="truncate">{pl.name}</span>
        </button>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />
    </aside>
  );
}
