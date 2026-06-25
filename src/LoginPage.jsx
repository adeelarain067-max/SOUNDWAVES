// ============================================================
// LoginPage.jsx  –  SoundWave Music Player
// Authentication screen: sign-in / create account
// ============================================================

import { useState } from "react";
import { DEMO_USERS } from "./data.js";

const AVATAR_GRAD = {
  AR: "linear-gradient(135deg,#8B5CF6,#EC4899)",
  JL: "linear-gradient(135deg,#D97706,#EF4444)",
};

function MiniAvatar({ user }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: AVATAR_GRAD[user.avatar] || "linear-gradient(135deg,#8B5CF6,#6D28D9)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.65rem", fontWeight: 800, color: "#fff", flexShrink: 0,
    }}>{user.avatar}</div>
  );
}

export default function LoginPage({ onLogin }) {
  const [mode, setMode]     = useState("login");   // "login" | "signup"
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const submit = () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);

    setTimeout(() => {
      if (mode === "login") {
        const found = DEMO_USERS.find(u => u.email === form.email && u.password === form.password);
        if (found) {
          onLogin(found);
        } else {
          setError("Wrong email or password. Try demo@soundwave.com / demo123");
          setLoading(false);
        }
      } else {
        if (!form.name.trim()) { setError("Name is required."); setLoading(false); return; }
        onLogin({
          id: Date.now(),
          name: form.name.trim(),
          email: form.email,
          avatar: form.name.trim().slice(0, 2).toUpperCase(),
        });
      }
    }, 600);
  };

  return (
    <div className="login-root">
      {/* ── Floating decorative blobs ── */}
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(#8B5CF620, transparent 70%)", top: "-10%", left: "-5%", pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(#EC489915, transparent 70%)", bottom: "5%", right: "5%", pointerEvents: "none" }} />

      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: "linear-gradient(135deg,#8B5CF6,#EC4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", fontSize: "2rem",
            animation: "glow 3s ease-in-out infinite",
            boxShadow: "0 0 0 1px rgba(139,92,246,0.3)",
          }}>🎵</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.5px", margin: "0 0 5px" }}>SoundWave</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Your music, your world</p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4, marginBottom: 24, border: "1px solid rgba(255,255,255,0.07)" }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => { setMode(t); setError(""); }}
              style={{
                flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer",
                background: mode === t ? "var(--gradient-primary)" : "transparent",
                color: mode === t ? "#fff" : "var(--text-secondary)",
                fontWeight: 600, fontSize: "0.88rem", transition: "all 0.2s",
              }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Fields */}
        {mode === "signup" && (
          <input className="login-input" placeholder="Full name" value={form.name} onChange={set("name")} />
        )}
        <input className="login-input" type="email" placeholder="Email address" value={form.email} onChange={set("email")} />
        <input className="login-input" type="password" placeholder="Password"
          value={form.password} onChange={set("password")}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ marginBottom: 18 }}
        />

        {error && (
          <p style={{ color: "#F87171", fontSize: "0.8rem", textAlign: "center", marginBottom: 12 }}>{error}</p>
        )}

        <button className="btn-primary" onClick={submit} disabled={loading}
          style={{ width: "100%", padding: "13px", fontSize: "0.95rem", opacity: loading ? 0.6 : 1 }}>
          {loading ? "…" : mode === "login" ? "Sign In" : "Join SoundWave"}
        </button>

        {/* Quick-login accounts */}
        <div style={{ marginTop: 24 }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "center", marginBottom: 10 }}>
            Or sign in instantly as
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {DEMO_USERS.map(u => (
              <button key={u.id} onClick={() => onLogin(u)}
                style={{ flex: 1, padding: "9px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "rgba(255,255,255,0.75)", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              >
                <MiniAvatar user={u} />
                <span className="truncate">{u.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textAlign: "center", marginTop: 18 }}>
          Demo: demo@soundwave.com / demo123
        </p>
      </div>
    </div>
  );
}
