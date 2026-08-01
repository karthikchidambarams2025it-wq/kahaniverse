/**
 * hello-celebration.js — Kahaniverse 🎉
 * Fun celebration popup when the child signs "HELLO"
 *
 * Usage: call showHelloCelebration(speakFn?) from any page.
 * Requires no external libraries.
 */

(function () {
  'use strict';

  /* ── Greeting phrases ─────────────────────────────── */
  const GREETINGS = [
    'Hello there! 👋',
    'Namaste! 🙏✨',
    'Hi friend! 🌟',
    'Wonderful hello! 🌈',
    'Great signing! 🎉',
  ];

  /* ── Animals with wave animation ─────────────────── */
  const ANIMALS = [
    { emoji: '🐵', name: 'Monkey', color: '#FF9800' },
    { emoji: '🐶', name: 'Puppy',  color: '#F06292' },
    { emoji: '🐼', name: 'Panda',  color: '#7E57C2' },
    { emoji: '🦁', name: 'Lion',   color: '#FFA726' },
  ];

  /* ── Inject CSS once ──────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('hc-styles')) return;
    const style = document.createElement('style');
    style.id = 'hc-styles';
    style.textContent = `
/* ═══════════════════════════════════════════════════════
   HELLO CELEBRATION — Kahaniverse
   Respects prefers-reduced-motion
═══════════════════════════════════════════════════════ */
.hc-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(14, 10, 26, 0.55);
  backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 0.35s ease;
  cursor: pointer;
}
.hc-overlay.hc-visible { opacity: 1; }
.hc-overlay.hc-hiding   { opacity: 0; }

.hc-card {
  position: relative;
  background: linear-gradient(145deg, #1E0A3C 0%, #2D1060 100%);
  border: 2.5px solid rgba(199, 125, 255, 0.5);
  border-radius: 28px;
  padding: 36px 44px 30px;
  text-align: center;
  box-shadow:
    0 0 0 1px rgba(199,125,255,.15),
    0 24px 80px rgba(110,40,217,.55),
    0  8px 32px rgba(0,0,0,.6);
  max-width: 340px;
  width: 90vw;
  transform: scale(0.5);
  opacity: 0;
  transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1),
              opacity   0.35s ease;
}
.hc-overlay.hc-visible .hc-card {
  transform: scale(1);
  opacity: 1;
}
.hc-overlay.hc-hiding .hc-card {
  transform: scale(0.85);
  opacity: 0;
  transition: transform 0.3s ease-in, opacity 0.3s ease-in;
}

/* Speech bubble */
.hc-bubble {
  position: relative;
  background: linear-gradient(135deg, #6E28D9, #9B59B6);
  border-radius: 20px 20px 20px 4px;
  padding: 11px 20px;
  margin-bottom: 18px;
  display: inline-block;
  color: #fff;
  font-family: 'Fredoka', 'Nunito', cursive, sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: 0 4px 18px rgba(110,40,217,.4);
  line-height: 1.3;
}
.hc-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 24px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #9B59B6 transparent transparent;
}

/* Animal */
.hc-animal {
  font-size: 5.5rem;
  display: block;
  margin: 0 auto 6px;
  line-height: 1;
  user-select: none;
  animation: hc-wave 0.9s ease-in-out infinite alternate;
}

/* Dismiss hint */
.hc-tap {
  margin-top: 16px;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(200,180,255,.38);
  letter-spacing: .07em;
  text-transform: uppercase;
}

/* Animal name chip */
.hc-name {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #fff;
  margin-top: 4px;
  letter-spacing: .04em;
}

/* ── Animations ────────────────────── */
@keyframes hc-wave {
  0%   { transform: rotate(-12deg) scale(1.02); }
  100% { transform: rotate(12deg)  scale(1.08); }
}

/* Confetti dots */
.hc-confetti {
  position: fixed;
  pointer-events: none;
  z-index: 100000;
  border-radius: 3px;
  animation: hc-confetti-fall linear forwards;
}
@keyframes hc-confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* ── Reduced motion overrides ─────── */
@media (prefers-reduced-motion: reduce) {
  .hc-card { transition: opacity 0.2s ease !important; transform: scale(1) !important; }
  .hc-overlay.hc-hiding .hc-card { transform: scale(1) !important; }
  .hc-animal { animation: none !important; }
  .hc-confetti { animation: none !important; display: none !important; }
}
    `;
    document.head.appendChild(style);
  }

  /* ── Confetti burst ───────────────────────────────── */
  const CONFETTI_COLORS = [
    '#FF9800','#F06292','#C77DFF','#00FF88',
    '#4FC3F7','#FFD700','#FF6B6B','#7E57C2'
  ];

  function fireConfetti() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const N = 55;
    for (let i = 0; i < N; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'hc-confetti';
        const size = 6 + Math.random() * 9;
        const dur  = 1.8 + Math.random() * 1.8;
        el.style.cssText = `
          left: ${10 + Math.random() * 80}vw;
          top: 0;
          width: ${size}px;
          height: ${size * (Math.random() > 0.5 ? 0.5 : 1)}px;
          background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
          animation-duration: ${dur}s;
          animation-delay: ${Math.random() * 0.4}s;
          border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), (dur + 0.5) * 1000);
      }, i * 18);
    }
  }

  /* ── Build and show the popup ─────────────────────── */
  let _active = false;
  let _dismissTimer = null;

  window.showHelloCelebration = function (speakFn) {
    if (_active) return;   // prevent double-fire
    _active = true;

    injectStyles();

    const animal   = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

    /* ── Overlay ── */
    const overlay = document.createElement('div');
    overlay.className = 'hc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Hello celebration');

    /* ── Card ── */
    overlay.innerHTML = `
      <div class="hc-card" role="document">
        <div class="hc-bubble">${greeting}</div>
        <span class="hc-animal" aria-label="${animal.name} waving">${animal.emoji}</span>
        <div class="hc-name" style="background:${animal.color}33;color:${animal.color};border:1.5px solid ${animal.color}55;">
          ${animal.name} says hi!
        </div>
        <p class="hc-tap">Tap anywhere to continue</p>
      </div>
    `;
    document.body.appendChild(overlay);

    /* ── Animate in (next frame so CSS transition fires) ── */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('hc-visible'));
    });

    /* ── Fire confetti ── */
    fireConfetti();

    /* ── Speak greeting ── */
    const textToSpeak = greeting.replace(/[^\w\s!']/g, ''); // strip emoji for TTS
    if (typeof speakFn === 'function') {
      setTimeout(() => speakFn(textToSpeak), 300);
    } else if (window.speak && typeof window.speak === 'function') {
      setTimeout(() => window.speak(textToSpeak), 300);
    } else if (window.speechSynthesis) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(textToSpeak);
        u.lang = 'en-IN'; u.rate = 0.88; u.pitch = 1.2;
        speechSynthesis.speak(u);
      }, 300);
    }

    /* ── Dismiss helpers ── */
    function dismiss() {
      if (!_active) return;
      clearTimeout(_dismissTimer);
      overlay.classList.remove('hc-visible');
      overlay.classList.add('hc-hiding');
      setTimeout(() => {
        overlay.remove();
        _active = false;
      }, 380);
    }

    /* Auto-dismiss after 2.8 s */
    _dismissTimer = setTimeout(dismiss, 2800);

    /* Tap anywhere to dismiss early */
    overlay.addEventListener('click', dismiss, { once: true });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        dismiss();
        document.removeEventListener('keydown', onKey);
      }
    });
  };

})();
