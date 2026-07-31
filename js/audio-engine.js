/**
 * KAHANIVERSE — SPATIAL AUDIO ENGINE
 * Indian instrumentation via Web Audio API synthesis
 * No external audio files required
 */

const AudioEngine = (function() {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ── Core tone player ── */
  function playTone(freq, type = 'sine', duration = 0.3, volume = 0.4, delay = 0) {
    if (!enabled) return;
    try {
      const c   = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delay);
      gain.gain.setValueAtTime(volume, c.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + duration);
    } catch(e) { /* Audio not available */ }
  }

  /* ── Percussive hit (tabla-like) ── */
  function playPercussion(freq = 120, duration = 0.15, volume = 0.5, delay = 0) {
    if (!enabled) return;
    try {
      const c    = getCtx();
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2, c.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, c.currentTime + delay + duration);
      gain.gain.setValueAtTime(volume, c.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      osc.start(c.currentTime + delay); osc.stop(c.currentTime + delay + duration);
    } catch(e) {}
  }

  /* ── SOUNDS ── */

  // Tabla beat — correct answer
  function playCorrect() {
    playPercussion(200, 0.1, 0.5, 0);
    playPercussion(160, 0.12, 0.3, 0.08);
    playTone(880, 'sine', 0.2, 0.25, 0.1);
    playTone(1320, 'sine', 0.15, 0.15, 0.2);
  }

  // Wrong answer — soft thud
  function playWrong() {
    playPercussion(80, 0.2, 0.3);
    playTone(220, 'sine', 0.25, 0.2, 0.05);
  }

  // Sitar sting — level complete / victory
  function playSitar() {
    // Simulate sitar's characteristic sliding pitch + harmonics
    const notes = [392, 440, 494, 523, 587, 659];
    notes.forEach((freq, i) => {
      playTone(freq, 'sawtooth', 0.4, 0.2, i * 0.12);
      playTone(freq * 2, 'sine', 0.3, 0.08, i * 0.12 + 0.02);
    });
  }

  // Dholak rhythm — streak achieved
  function playDholak() {
    const pattern = [0, 0.15, 0.3, 0.38, 0.5, 0.65, 0.75];
    const freqs   = [150, 200, 150, 250, 150, 200, 300];
    pattern.forEach((t, i) => playPercussion(freqs[i], 0.12, 0.5, t));
  }

  // Chime — letter reveal / unlock
  function playChime(noteIndex = 0) {
    const chimeFreqs = [523, 587, 659, 698, 784, 880, 988];
    const freq = chimeFreqs[noteIndex % chimeFreqs.length];
    playTone(freq, 'sine', 0.5, 0.3);
    playTone(freq * 2, 'sine', 0.3, 0.08, 0.05);
  }

  // Boss round intro — dramatic build
  function playBossIntro() {
    playPercussion(100, 0.3, 0.6, 0);
    playPercussion(100, 0.3, 0.6, 0.35);
    playPercussion(100, 0.3, 0.6, 0.7);
    playTone(110, 'sawtooth', 1.5, 0.2, 0.8);
    playTone(165, 'sine', 0.8, 0.15, 1.0);
  }

  // Ambient hum — intro background drone
  function startAmbientHum() {
    if (!enabled) return null;
    try {
      const c   = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.value = 60;
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 1.5);
      osc.start();
      return { osc, gain };
    } catch(e) { return null; }
  }

  function stopAmbientHum(handle) {
    if (!handle) return;
    try {
      const c = getCtx();
      handle.gain.gain.linearRampToValueAtTime(0, c.currentTime + 1);
      handle.osc.stop(c.currentTime + 1);
    } catch(e) {}
  }

  function setEnabled(val) { enabled = val; }

  return { playCorrect, playWrong, playSitar, playDholak, playChime, playBossIntro, startAmbientHum, stopAmbientHum, setEnabled };
})();

window.AudioEngine = AudioEngine;
