/**
 * Tiny synth sound effects via Web Audio API.
 * No external assets.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const C: typeof AudioContext | undefined =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  ctx = new C();
  return ctx;
}

/** Single typewriter key clack — noise burst + low thunk */
export function playKeyClick(volume = 0.18) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  // noise burst (the "clack")
  const len = 0.05;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 2200;
  noiseFilter.Q.value = 0.8;
  const noiseGain = c.createGain();
  noiseGain.gain.value = volume;
  src.connect(noiseFilter).connect(noiseGain).connect(c.destination);
  src.start(now);
  src.stop(now + len);

  // low thunk
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
  const oGain = c.createGain();
  oGain.gain.setValueAtTime(volume * 0.55, now);
  oGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
  osc.connect(oGain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.11);
}

/** Page-turn rustle: short noise sweep */
export function playPageTurn(volume = 0.25) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const len = 0.45;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    const env = Math.sin(Math.PI * t) ** 1.6;
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(now);
  src.stop(now + len);
}

/** A short typewriter "line of typing" — N clicks */
export function playTypewriterBurst(count = 4, intervalMs = 60) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => playKeyClick(0.12), i * intervalMs);
  }
}
