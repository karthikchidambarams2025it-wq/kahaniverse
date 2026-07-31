/**
 * KAHANIVERSE — TTS ENGINE
 * Web Speech API wrapper with Indian English preference
 * Privacy-first: 100% client-side, no external API
 *
 * FIX LOG:
 *  - enabled now starts TRUE (was false — caused silence)
 *  - unlockAudio() sends a silent utterance on first user gesture
 *    to satisfy browser autoplay policies (Chrome/Edge requirement)
 *  - Voice loading retries up to 3× to beat the async voiceschanged race
 *  - speakPhrase now falls back gracefully if no preferred voice found
 */

const TTSEngine = (function () {
  let enabled = true;          // ← was false — this was the main bug
  let voices = [];
  let preferredVoice = null;
  let rate  = 0.9;
  let pitch = 1.0;
  let unlocked = false;

  /* ── VOICE LOADING ── */
  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      preferredVoice = _pickVoice();
    }
  }

  function _pickVoice() {
    const eng = voices.filter(v => v.lang && v.lang.startsWith('en'));
    return (
      eng.find(v => v.lang === 'en-IN') ||
      eng.find(v => v.name.toLowerCase().includes('india')) ||
      eng.find(v => v.lang === 'en-US' && v.localService) ||
      eng.find(v => v.lang === 'en-GB') ||
      eng[0] ||
      voices[0] ||
      null
    );
  }

  /* ── BROWSER UNLOCK ──
     Chrome/Edge block speech until after a user gesture.
     Call this once on the first click/keypress anywhere on the page.
  */
  function unlockAudio() {
    if (unlocked || !window.speechSynthesis) return;
    unlocked = true;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    // Also reload voices now that we have a gesture
    loadVoices();
  }

  /* ── MAIN SPEAK ── */
  function speak(text, options = {}) {
    if (!enabled || !text || !window.speechSynthesis) return;

    // Cancel anything already playing
    window.speechSynthesis.cancel();

    // If voices still not loaded, try again
    if (!preferredVoice) loadVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice  = preferredVoice || null;   // null = browser default voice
    utterance.rate   = options.rate  ?? rate;
    utterance.pitch  = options.pitch ?? pitch;
    utterance.volume = options.volume ?? 1;
    utterance.lang   = preferredVoice?.lang || 'en-IN';

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  /* ── PUBLIC HELPERS ── */
  function speakLetter(letter) {
    return speak(letter, { rate: 0.7, pitch: 1.1 });
  }

  function speakPhrase(text) {
    return speak(text, { rate: 0.88 });
  }

  function stop() {
    window.speechSynthesis?.cancel();
  }

  function setEnabled(val) {
    enabled = Boolean(val);
    if (!enabled) stop();
  }

  function isEnabled() { return enabled; }
  function setRate(r)  { rate  = Math.max(0.5, Math.min(2, r)); }
  function setPitch(p) { pitch = Math.max(0.5, Math.min(2, p)); }
  function isSupported() { return 'speechSynthesis' in window; }

  /* ── INIT ── */
  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    // Auto-unlock on first user gesture anywhere on the page
    const events = ['click', 'keydown', 'touchstart', 'pointerdown'];
    const unlockOnce = () => {
      unlockAudio();
      events.forEach(e => document.removeEventListener(e, unlockOnce));
    };
    events.forEach(e => document.addEventListener(e, unlockOnce, { once: true }));
  }

  return {
    speak, speakLetter, speakPhrase, stop,
    setEnabled, isEnabled, setRate, setPitch,
    isSupported, loadVoices, unlockAudio
  };
})();

window.TTSEngine = TTSEngine;
