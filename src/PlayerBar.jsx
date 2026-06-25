
import { AlbumArt, Icon, Visualiser } from "./components.jsx";
import { fmtTime } from "./data.js";

export default function PlayerBar({
  song,
  isPlaying,
  progress,        // 0-100
  volume,          // 0-100
  muted,
  shuffle,
  repeatMode,      // 0=off 1=all 2=one
  onPlayPause,
  onNext,
  onPrev,
  onSeek,          // (pct) => void
  onVolume,        // (val) => void
  onMute,
  onShuffle,
  onRepeat,
  onLike,
}) {
  const elapsed  = song ? (progress / 100) * song.duration : 0;
  const fillPct  = `${progress}%`;

  // Progress bar style with dynamic gradient fill
  const progressStyle = {
    width: "100%",
    height: 4,
    borderRadius: 4,
    background: `linear-gradient(to right, #8B5CF6 ${fillPct}, rgba(255,255,255,0.15) ${fillPct})`,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
  };

  const volFill = `${muted ? 0 : volume}%`;
  const volStyle = {
    width: 90,
    height: 4,
    borderRadius: 4,
    background: `linear-gradient(to right, #8B5CF6 ${volFill}, rgba(255,255,255,0.15) ${volFill})`,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
  };

  return (
    <div className="player-bar">
      {/* ── LEFT: song info ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: 260, minWidth: 200 }}>
        {song ? (
          <>
            <AlbumArt song={song} size={52} spinning={isPlaying} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.88rem" }} className="truncate">{song.title}</p>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.75rem" }}>{song.artist}</p>
            </div>
            <button className="btn-ghost" style={{ padding: 5, flexShrink: 0, color: song.liked ? "#EC4899" : "var(--text-muted)" }} onClick={onLike}>
              <Icon name={song.liked ? "heartFill" : "heart"} size={18} />
            </button>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Nothing playing</p>
        )}
      </div>

      {/* ── CENTRE: controls + progress ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {/* Control buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button className="btn-ghost" onClick={onShuffle}
            style={{ padding: 6, color: shuffle ? "#A78BFA" : "var(--text-muted)", opacity: shuffle ? 1 : 0.5 }}>
            <Icon name="shuffle" size={18} />
          </button>

          <button className="btn-ghost" onClick={onPrev} style={{ padding: 6 }}>
            <Icon name="prev" size={22} />
          </button>

          {/* Big play / pause button */}
          <button
            onClick={onPlayPause}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "var(--gradient-primary)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(139,92,246,0.45)",
              transition: "transform 0.15s, box-shadow 0.15s",
              flexShrink: 0,
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <Icon name={isPlaying ? "pause" : "play"} size={20} />
          </button>

          <button className="btn-ghost" onClick={onNext} style={{ padding: 6 }}>
            <Icon name="next" size={22} />
          </button>

          <button className="btn-ghost" onClick={onRepeat}
            style={{ padding: 6, color: repeatMode > 0 ? "#A78BFA" : "var(--text-muted)", opacity: repeatMode > 0 ? 1 : 0.5, position: "relative" }}>
            <Icon name="repeat" size={18} />
            {repeatMode === 2 && (
              <span style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, borderRadius: "50%", background: "#A78BFA" }} />
            )}
          </button>
        </div>

        {/* Progress row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 500 }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", minWidth: 36, textAlign: "right" }}>
            {fmtTime(elapsed)}
          </span>
          <input
            type="range" min={0} max={100} step={0.1}
            value={progress}
            onChange={e => onSeek(parseFloat(e.target.value))}
            style={{ ...progressStyle, flex: 1 }}
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", minWidth: 36 }}>
            {song ? fmtTime(song.duration) : "0:00"}
          </span>
        </div>
      </div>

      {/* ── RIGHT: volume + visualiser ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: 220, justifyContent: "flex-end" }}>
        {/* Mini visualiser */}
        {isPlaying && song && (
          <Visualiser isPlaying={isPlaying} color={song.color || "#8B5CF6"} bars={12} height={24} />
        )}

        <button className="btn-ghost" onClick={onMute} style={{ padding: 5, color: "var(--text-secondary)" }}>
          <Icon name={muted ? "mute" : "vol"} size={18} />
        </button>
        <input
          type="range" min={0} max={100}
          value={muted ? 0 : volume}
          onChange={e => { onVolume(parseInt(e.target.value)); }}
          style={volStyle}
        />
        <span style={{ color: "var(--text-muted)", fontSize: "0.68rem", minWidth: 28 }}>
          {muted ? 0 : volume}%
        </span>
      </div>
    </div>
  );
}
