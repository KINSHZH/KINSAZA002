let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noise(ac: AudioContext, duration: number, gain: number, filterFreq: number, filterType: BiquadFilterType = 'bandpass'): { source: AudioBufferSourceNode; gainNode: GainNode } {
  const len = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const source = ac.createBufferSource();
  source.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  filter.Q.value = 1;
  const gainNode = ac.createGain();
  gainNode.gain.value = gain;
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ac.destination);
  return { source, gainNode };
}

function toneOsc(ac: AudioContext, freq: number, type: OscillatorType, duration: number, gain: number): { osc: OscillatorNode; gainNode: GainNode } {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const gainNode = ac.createGain();
  gainNode.gain.value = gain;
  osc.connect(gainNode);
  gainNode.connect(ac.destination);
  return { osc, gainNode };
}

// Trowel scraping mortar across brick
function playMortarTuckpointing() {
  const ac = getCtx();
  const t = ac.currentTime;
  const { source, gainNode } = noise(ac, 0.4, 0.12, 2200, 'bandpass');
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.12, t + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.08, t + 0.2);
  gainNode.gain.linearRampToValueAtTime(0, t + 0.4);
  source.start(t);
  source.stop(t + 0.4);
}

// Brick blocks stacking - two thuds
function playBrickMasonry() {
  const ac = getCtx();
  const t = ac.currentTime;
  for (let i = 0; i < 2; i++) {
    const offset = i * 0.15;
    const { osc, gainNode } = toneOsc(ac, 90 - i * 10, 'sine', 0.12, 0.2);
    gainNode.gain.setValueAtTime(0.2, t + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);
    osc.start(t + offset);
    osc.stop(t + offset + 0.12);
    const { source: n, gainNode: ng } = noise(ac, 0.08, 0.06, 600, 'lowpass');
    ng.gain.setValueAtTime(0.06, t + offset);
    ng.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.08);
    n.start(t + offset);
    n.stop(t + offset + 0.08);
  }
}

// Paint roller - smooth rolling noise
function playPainting() {
  const ac = getCtx();
  const t = ac.currentTime;
  const { source, gainNode } = noise(ac, 0.5, 0.08, 900, 'lowpass');
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.08, t + 0.08);
  gainNode.gain.setValueAtTime(0.08, t + 0.35);
  gainNode.gain.linearRampToValueAtTime(0, t + 0.5);
  source.start(t);
  source.stop(t + 0.5);
}

// Hand sander - buzzy texture noise
function playDrywall() {
  const ac = getCtx();
  const t = ac.currentTime;
  const { source, gainNode } = noise(ac, 0.45, 0.1, 3500, 'bandpass');
  const lfo = ac.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 18;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  lfo.start(t);
  lfo.stop(t + 0.45);
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.1, t + 0.05);
  gainNode.gain.setValueAtTime(0.1, t + 0.3);
  gainNode.gain.linearRampToValueAtTime(0, t + 0.45);
  source.start(t);
  source.stop(t + 0.45);
}

// Two glasses clinking
function playGlassBlock() {
  const ac = getCtx();
  const t = ac.currentTime;
  for (let i = 0; i < 2; i++) {
    const offset = i * 0.18;
    const freq = 3200 + i * 400;
    const { osc, gainNode } = toneOsc(ac, freq, 'sine', 0.3, 0.12);
    gainNode.gain.setValueAtTime(0.12, t + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.3);
    osc.start(t + offset);
    osc.stop(t + offset + 0.3);
    // harmonic
    const { osc: o2, gainNode: g2 } = toneOsc(ac, freq * 2.3, 'sine', 0.15, 0.05);
    g2.gain.setValueAtTime(0.05, t + offset);
    g2.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15);
    o2.start(t + offset);
    o2.stop(t + offset + 0.15);
  }
}

// Tightening a screw - metallic ratchet clicks
function playPlumbing() {
  const ac = getCtx();
  const t = ac.currentTime;
  for (let i = 0; i < 4; i++) {
    const offset = i * 0.08;
    const { osc, gainNode } = toneOsc(ac, 800 + i * 50, 'square', 0.04, 0.06);
    gainNode.gain.setValueAtTime(0.06, t + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);
    osc.start(t + offset);
    osc.stop(t + offset + 0.04);
    const { source: n, gainNode: ng } = noise(ac, 0.03, 0.04, 4000, 'highpass');
    ng.gain.setValueAtTime(0.04, t + offset);
    ng.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.03);
    n.start(t + offset);
    n.stop(t + offset + 0.03);
  }
}

// Quick bzz bzzz electricity
function playElectrical() {
  const ac = getCtx();
  const t = ac.currentTime;
  // First bzz
  const { osc: o1, gainNode: g1 } = toneOsc(ac, 120, 'sawtooth', 0.12, 0.1);
  g1.gain.setValueAtTime(0.1, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o1.start(t);
  o1.stop(t + 0.12);
  // Second bzzz (slightly longer)
  const { osc: o2, gainNode: g2 } = toneOsc(ac, 130, 'sawtooth', 0.18, 0.12);
  g2.gain.setValueAtTime(0.12, t + 0.15);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.33);
  o2.start(t + 0.15);
  o2.stop(t + 0.33);
  // Add crackle
  const { source, gainNode } = noise(ac, 0.33, 0.04, 6000, 'highpass');
  gainNode.gain.setValueAtTime(0.02, t);
  gainNode.gain.setValueAtTime(0.04, t + 0.15);
  gainNode.gain.linearRampToValueAtTime(0, t + 0.33);
  source.start(t);
  source.stop(t + 0.33);
}

// Leaf blower - sustained but gentle
function playGutterCleaning() {
  const ac = getCtx();
  const t = ac.currentTime;
  const { source, gainNode } = noise(ac, 0.5, 0.06, 700, 'lowpass');
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.06, t + 0.1);
  gainNode.gain.setValueAtTime(0.06, t + 0.35);
  gainNode.gain.linearRampToValueAtTime(0, t + 0.5);
  source.start(t);
  source.stop(t + 0.5);
  // Motor hum
  const { osc, gainNode: og } = toneOsc(ac, 95, 'sawtooth', 0.5, 0.03);
  og.gain.setValueAtTime(0, t);
  og.gain.linearRampToValueAtTime(0.03, t + 0.1);
  og.gain.setValueAtTime(0.03, t + 0.35);
  og.gain.linearRampToValueAtTime(0, t + 0.5);
  osc.start(t);
  osc.stop(t + 0.5);
}

// Hammer hit
function playHandyman() {
  const ac = getCtx();
  const t = ac.currentTime;
  const { osc, gainNode } = toneOsc(ac, 120, 'sine', 0.15, 0.25);
  gainNode.gain.setValueAtTime(0.25, t);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
  osc.start(t);
  osc.stop(t + 0.15);
  const { source, gainNode: ng } = noise(ac, 0.06, 0.15, 3000, 'highpass');
  ng.gain.setValueAtTime(0.15, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  source.start(t);
  source.stop(t + 0.06);
}

// Door opening creak
function playMaintenance() {
  const ac = getCtx();
  const t = ac.currentTime;
  const { osc, gainNode } = toneOsc(ac, 300, 'sawtooth', 0.4, 0.06);
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.linearRampToValueAtTime(500, t + 0.15);
  osc.frequency.linearRampToValueAtTime(350, t + 0.3);
  osc.frequency.linearRampToValueAtTime(450, t + 0.4);
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.06, t + 0.05);
  gainNode.gain.setValueAtTime(0.06, t + 0.3);
  gainNode.gain.linearRampToValueAtTime(0, t + 0.4);
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 5;
  osc.disconnect();
  osc.connect(filter);
  filter.connect(gainNode);
  osc.start(t);
  osc.stop(t + 0.4);
}

// Wood planks being placed down
function playFlooring() {
  const ac = getCtx();
  const t = ac.currentTime;
  for (let i = 0; i < 2; i++) {
    const offset = i * 0.2;
    const { osc, gainNode } = toneOsc(ac, 150 - i * 20, 'sine', 0.12, 0.15);
    gainNode.gain.setValueAtTime(0.15, t + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);
    osc.start(t + offset);
    osc.stop(t + offset + 0.12);
    const { source, gainNode: ng } = noise(ac, 0.06, 0.08, 1200, 'bandpass');
    ng.gain.setValueAtTime(0.08, t + offset);
    ng.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.06);
    source.start(t + offset);
    source.stop(t + offset + 0.06);
  }
}

// Opening shutters - wooden slide
function playWindows() {
  const ac = getCtx();
  const t = ac.currentTime;
  const { source, gainNode } = noise(ac, 0.35, 0.08, 1500, 'bandpass');
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.08, t + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.04, t + 0.2);
  gainNode.gain.linearRampToValueAtTime(0, t + 0.35);
  source.start(t);
  source.stop(t + 0.35);
  // Thud at end
  const { osc, gainNode: tg } = toneOsc(ac, 100, 'sine', 0.08, 0.1);
  tg.gain.setValueAtTime(0.1, t + 0.28);
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
  osc.start(t + 0.28);
  osc.stop(t + 0.36);
}

const soundMap: Record<string, () => void> = {
  'mortar-and-tuckpointing': playMortarTuckpointing,
  'brick-masonry-repair': playBrickMasonry,
  'painting': playPainting,
  'drywall': playDrywall,
  'glass-block': playGlassBlock,
  'light-plumbing': playPlumbing,
  'light-electrical': playElectrical,
  'gutter-cleaning': playGutterCleaning,
  'general-handyman': playHandyman,
  'general-handyman-services': playHandyman,
  'light-maintenance': playMaintenance,
  'flooring': playFlooring,
  'windows': playWindows,
};

let lastPlayed = 0;
const COOLDOWN = 300;

export function playServiceSound(slug: string) {
  const now = Date.now();
  if (now - lastPlayed < COOLDOWN) return;
  lastPlayed = now;
  const fn = soundMap[slug];
  if (fn) fn();
}
