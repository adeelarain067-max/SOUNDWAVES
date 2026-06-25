
let ctx = null;           // AudioContext (singleton)
let masterGain = null;    // controls overall volume
let currentNodes = null;  // { osc, lfo, stopAll }

// Interval ratios for a minor-pentatonic scale
const PENTA = [1, 1.189, 1.335, 1.587, 1.782, 2];

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.8;
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/**
 * Start playing a synthesised version of `song`.
 * Returns a stop() function.
 */
export function playSong(song) {
  stopCurrent();
  const audioCtx = getCtx();
  const root = song.rootHz || 220;
  const wave = song.waveform || "sine";

  // ── Main melody oscillator ────────────────────────────────
  const osc = audioCtx.createOscillator();
  osc.type = wave;
  osc.frequency.value = root;

  // Gain envelope
  const envGain = audioCtx.createGain();
  envGain.gain.value = 0;
  osc.connect(envGain);
  envGain.connect(masterGain);

  // ── Pad oscillator (one octave down, sine, quieter) ───────
  const pad = audioCtx.createOscillator();
  pad.type = "sine";
  pad.frequency.value = root / 2;
  const padGain = audioCtx.createGain();
  padGain.gain.value = 0;
  pad.connect(padGain);
  padGain.connect(masterGain);

  // ── LFO for gentle tremolo ────────────────────────────────
  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 4; // Hz
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain);
  lfoGain.connect(envGain.gain);

  // ── Melody scheduling ─────────────────────────────────────
  // Each note lasts one beat (60/bpm seconds).
  // Pattern cycles through the pentatonic ratios.
  const bpm = song.bpm || 120;
  const beatLen = 60 / bpm;
  const patternLen = PENTA.length * 2; // up + reflect down
  const pattern = [
    ...PENTA,
    ...[...PENTA].reverse().slice(1, -1),
  ];

  let scheduleHandle = null;
  let noteIdx = 0;
  let nextNoteTime = audioCtx.currentTime + 0.05;

  const ATTACK  = 0.04;
  const RELEASE = beatLen * 0.3;

  function scheduleNote() {
    if (audioCtx.state === "closed") return;

    const ratio = pattern[noteIdx % pattern.length];
    const freq  = root * ratio;
    const start = nextNoteTime;
    const end   = start + beatLen - RELEASE;

    // Pitch
    osc.frequency.setTargetAtTime(freq, start, 0.015);

    // Envelope
    envGain.gain.cancelScheduledValues(start);
    envGain.gain.setValueAtTime(0, start);
    envGain.gain.linearRampToValueAtTime(0.4, start + ATTACK);
    envGain.gain.setValueAtTime(0.4, end);
    envGain.gain.linearRampToValueAtTime(0, end + RELEASE);

    // Pad follows at half volume, same pitch / 2
    pad.frequency.setTargetAtTime(freq / 2, start, 0.08);
    padGain.gain.setValueAtTime(0.15, start);
    padGain.gain.linearRampToValueAtTime(0, end + RELEASE);

    noteIdx++;
    nextNoteTime += beatLen;

    // Schedule 150 ms ahead
    scheduleHandle = setTimeout(scheduleNote, (nextNoteTime - audioCtx.currentTime - 0.15) * 1000);
  }

  osc.start();
  pad.start();
  lfo.start();
  scheduleNote();

  // Fade in master
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.3);

  function stop() {
    clearTimeout(scheduleHandle);
    const t = audioCtx.currentTime;
    envGain.gain.cancelScheduledValues(t);
    envGain.gain.setValueAtTime(envGain.gain.value, t);
    envGain.gain.linearRampToValueAtTime(0, t + 0.3);
    padGain.gain.linearRampToValueAtTime(0, t + 0.3);
    setTimeout(() => {
      try { osc.stop(); pad.stop(); lfo.stop(); } catch (_) {}
    }, 350);
  }

  currentNodes = { stop };
  return stop;
}

/** Stop whatever is playing right now (with a short fade). */
export function stopCurrent() {
  if (currentNodes) {
    currentNodes.stop();
    currentNodes = null;
  }
}

/** Set master volume [0 – 1]. */
export function setVolume(v) {
  if (!masterGain) return;
  masterGain.gain.cancelScheduledValues(getCtx().currentTime);
  masterGain.gain.setTargetAtTime(
    Math.max(0, Math.min(1, v)),
    getCtx().currentTime,
    0.05
  );
}

/** Mute / unmute without destroying nodes. */
export function setMuted(muted) {
  setVolume(muted ? 0 : 0.8);
}