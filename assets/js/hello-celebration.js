/**
 * sign-celebration.js — Kahaniverse 🎉
 * Fun celebration popup for ALL recognized signs
 * Signs: HELLO, THANK YOU, GOOD, HELP, LOVE, NO, YES, I WANT, OKAY, WATER
 *
 * Usage: showSignCelebration(word, speakFn?)
 *        showHelloCelebration(speakFn?)  ← backward-compat alias
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     SIGN CONFIG — animals, messages, colors, animations
  ══════════════════════════════════════════════════════ */
  const SIGN_CONFIG = {

    'HELLO': {
      animals: [
        { emoji: '🐵', name: 'Cheeky Monkey' },
        { emoji: '🐶', name: 'Bouncy Puppy' },
        { emoji: '🐼', name: 'Cool Panda' },
        { emoji: '🦁', name: 'Friendly Lion' },
      ],
      floaters: ['👋','✨','🌟','💫'],
      messages: ['Hello there! 👋', 'Namaste! 🙏✨', 'Hi friend! 🌟', 'Wonderful hello! 🌈', 'Hey superstar! ⭐'],
      primary: '#C77DFF', secondary: '#6E28D9',
      gradient: 'linear-gradient(145deg,#1E0A3C,#2D1060)',
      border: 'rgba(199,125,255,0.55)',
      glow: 'rgba(110,40,217,0.5)',
      confetti: ['#C77DFF','#6E28D9','#FF9800','#00FF88','#FFD700'],
      animation: 'hc-wave',
      title: 'You signed HELLO! 🖐️',
    },

    'THANK YOU': {
      animals: [
        { emoji: '🦋', name: 'Graceful Butterfly' },
        { emoji: '🦚', name: 'Royal Peacock' },
        { emoji: '🦜', name: 'Polite Parrot' },
        { emoji: '🦩', name: 'Elegant Flamingo' },
      ],
      floaters: ['🙏','🌸','🌺','💐'],
      messages: ['So kind of you! 🙏', 'Shukriya ji! 🌺', 'How gracious! ✨', 'Thank you so much! 💖', 'You are wonderful! 🌸'],
      primary: '#FF6B9D', secondary: '#E14FD8',
      gradient: 'linear-gradient(145deg,#2A0A28,#3D0A38)',
      border: 'rgba(255,107,157,0.55)',
      glow: 'rgba(225,79,216,0.5)',
      confetti: ['#FF6B9D','#E14FD8','#FFD700','#00F0C8','#FF9800'],
      animation: 'hc-bow',
      title: 'You signed THANK YOU! 🙏',
    },

    'GOOD': {
      animals: [
        { emoji: '🦊', name: 'Smart Fox' },
        { emoji: '🐯', name: 'Brave Tiger' },
        { emoji: '🦅', name: 'Mighty Eagle' },
        { emoji: '🐆', name: 'Swift Cheetah' },
      ],
      floaters: ['⭐','🌟','✨','🏆'],
      messages: ['Amazing! ⭐', 'Shabash! You did great! 🏆', 'Super duper GOOD! 🌟', 'Brilliant! ✨', 'You are a star! ⭐'],
      primary: '#F7C948', secondary: '#E07B2A',
      gradient: 'linear-gradient(145deg,#2A1A04,#3D2A08)',
      border: 'rgba(247,201,72,0.6)',
      glow: 'rgba(224,123,42,0.5)',
      confetti: ['#F7C948','#E07B2A','#FF6B9D','#00FF88','#4FC3F7'],
      animation: 'hc-bounce',
      title: 'You signed GOOD! 👍',
    },

    'HELP': {
      animals: [
        { emoji: '🐘', name: 'Strong Elephant' },
        { emoji: '🦸', name: 'Super Hero' },
        { emoji: '🐻‍❄️', name: 'Polar Bear' },
        { emoji: '🦬', name: 'Mighty Bison' },
      ],
      floaters: ['🆘','💪','🌈','🤝'],
      messages: ['Help is on the way! 💪', 'I\'m here for you! 🌈', 'Super helpers! 🦸', 'Together we\'re strong! 🤝', 'You asked for help! Yay! 🌟'],
      primary: '#4FC3F7', secondary: '#0EA5E9',
      gradient: 'linear-gradient(145deg,#041828,#082840)',
      border: 'rgba(79,195,247,0.55)',
      glow: 'rgba(14,165,233,0.5)',
      confetti: ['#4FC3F7','#0EA5E9','#00FF88','#FFD700','#C77DFF'],
      animation: 'hc-pulse',
      title: 'You signed HELP! 🙋',
    },

    'LOVE': {
      animals: [
        { emoji: '🦄', name: 'Magic Unicorn' },
        { emoji: '🐰', name: 'Fluffy Bunny' },
        { emoji: '🐱', name: 'Cuddly Kitty' },
        { emoji: '🐹', name: 'Sweet Hamster' },
      ],
      floaters: ['❤️','💕','💖','🌹'],
      messages: ['Love is beautiful! 💖', 'Pyaar! 🌹✨', 'So much love! 💕', 'You are loved! ❤️', 'Spreading the love! 🦄'],
      primary: '#FF5C8A', secondary: '#C0392B',
      gradient: 'linear-gradient(145deg,#280A14,#3D0A1E)',
      border: 'rgba(255,92,138,0.55)',
      glow: 'rgba(192,57,43,0.5)',
      confetti: ['#FF5C8A','#FF9800','#FFD700','#E14FD8','#FF6B9D'],
      animation: 'hc-heartbeat',
      title: 'You signed LOVE! ❤️',
    },

    'NO': {
      animals: [
        { emoji: '🙈', name: 'Shy Monkey' },
        { emoji: '🐧', name: 'Silly Penguin' },
        { emoji: '🦔', name: 'Spiky Hedgehog' },
        { emoji: '🦦', name: 'Cheeky Otter' },
      ],
      floaters: ['🚫','✋','🛑','😄'],
      messages: ['Nahi nahi! 😄', 'Nope! That\'s okay! 🚫', 'It\'s alright to say NO! ✋', 'Good boundary! 👏', 'You said no! Brave! 🦔'],
      primary: '#FF7043', secondary: '#D84315',
      gradient: 'linear-gradient(145deg,#280C04,#3D1408)',
      border: 'rgba(255,112,67,0.55)',
      glow: 'rgba(216,67,21,0.5)',
      confetti: ['#FF7043','#D84315','#FFD700','#FF6B9D','#4FC3F7'],
      animation: 'hc-shake',
      title: 'You signed NO! 🚫',
    },

    'YES': {
      animals: [
        { emoji: '🐸', name: 'Happy Frog' },
        { emoji: '🦘', name: 'Jumping Kangaroo' },
        { emoji: '🐎', name: 'Galloping Horse' },
        { emoji: '🐬', name: 'Leaping Dolphin' },
      ],
      floaters: ['✅','🎊','🎉','🙌'],
      messages: ['YES! Absolutely! 🎊', 'Haan ji! 🌟', 'That\'s a YES! 🙌', 'Wonderful YES! ✅', 'You agree! Yay! 🎉'],
      primary: '#00FF88', secondary: '#00BCD4',
      gradient: 'linear-gradient(145deg,#041A0C,#082818)',
      border: 'rgba(0,255,136,0.55)',
      glow: 'rgba(0,188,212,0.5)',
      confetti: ['#00FF88','#00BCD4','#F7C948','#FF6B9D','#C77DFF'],
      animation: 'hc-bounce',
      title: 'You signed YES! ✅',
    },

    'I WANT': {
      animals: [
        { emoji: '🐿️', name: 'Eager Squirrel' },
        { emoji: '🦝', name: 'Curious Raccoon' },
        { emoji: '🐨', name: 'Sleepy Koala' },
        { emoji: '🦙', name: 'Fluffy Llama' },
      ],
      floaters: ['☝️','🌟','💡','✨'],
      messages: ['You know what you want! ⭐', 'Great expression! ☝️', 'I want it too! 💡', 'Speak your mind! 🌟', 'Shaabaash! 💪'],
      primary: '#AB47BC', secondary: '#7B1FA2',
      gradient: 'linear-gradient(145deg,#1A0828,#2D0A40)',
      border: 'rgba(171,71,188,0.55)',
      glow: 'rgba(123,31,162,0.5)',
      confetti: ['#AB47BC','#7B1FA2','#FFD700','#FF6B9D','#00FF88'],
      animation: 'hc-lean',
      title: 'You signed I WANT! ☝️',
    },

    'OKAY': {
      animals: [
        { emoji: '🐬', name: 'Smiling Dolphin' },
        { emoji: '🦭', name: 'Cheerful Seal' },
        { emoji: '🐙', name: 'Clever Octopus' },
        { emoji: '🦀', name: 'Happy Crab' },
      ],
      floaters: ['👌','✅','😊','🌊'],
      messages: ['Okay dokey! 😊', 'That\'s alright! 👌', 'All good! ✅', 'Theek hai! 🌊', 'Perfectly okay! 🐬'],
      primary: '#26C6DA', secondary: '#00838F',
      gradient: 'linear-gradient(145deg,#041820,#082830)',
      border: 'rgba(38,198,218,0.55)',
      glow: 'rgba(0,131,143,0.5)',
      confetti: ['#26C6DA','#00838F','#00FF88','#F7C948','#FF6B9D'],
      animation: 'hc-spin',
      title: 'You signed OKAY! 👌',
    },

    'WATER': {
      animals: [
        { emoji: '🐠', name: 'Colourful Fish' },
        { emoji: '🐋', name: 'Gentle Whale' },
        { emoji: '🦈', name: 'Cool Shark' },
        { emoji: '🐊', name: 'Sneaky Croc' },
      ],
      floaters: ['💧','🌊','🐚','🫧'],
      messages: ['Stay hydrated! 💧', 'Paani piyo! 🌊', 'Water is life! 🐠', 'Splash splash! 🫧', 'Refreshing! 💦'],
      primary: '#29B6F6', secondary: '#0277BD',
      gradient: 'linear-gradient(145deg,#041020,#082040)',
      border: 'rgba(41,182,246,0.55)',
      glow: 'rgba(2,119,189,0.5)',
      confetti: ['#29B6F6','#0277BD','#00FF88','#00BCD4','#4FC3F7'],
      animation: 'hc-swim',
      title: 'You signed WATER! 💧',
    },
  };

  /* ══════════════════════════════════════════════════════
     INJECT STYLES (once)
  ══════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('sc-styles')) return;
    const s = document.createElement('style');
    s.id = 'sc-styles';
    s.textContent = `
/* ═══════════════════════════════════════════════════════
   SIGN CELEBRATION — Kahaniverse
   Accessible: respects prefers-reduced-motion
═══════════════════════════════════════════════════════ */

/* Overlay */
.sc-overlay {
  position: fixed; inset: 0; z-index: 99999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(8,4,20,0.6);
  backdrop-filter: blur(8px);
  opacity: 0; transition: opacity 0.35s ease;
  cursor: pointer;
}
.sc-overlay.sc-in  { opacity: 1; }
.sc-overlay.sc-out { opacity: 0; }

/* Card */
.sc-card {
  position: relative;
  border-radius: 28px;
  padding: 28px 36px 24px;
  text-align: center;
  max-width: 360px; width: 92vw;
  transform: scale(0.45) translateY(40px);
  opacity: 0;
  transition:
    transform 0.5s cubic-bezier(0.34,1.56,0.64,1),
    opacity   0.4s ease;
  overflow: hidden;
}
.sc-overlay.sc-in .sc-card {
  transform: scale(1) translateY(0);
  opacity: 1;
}
.sc-overlay.sc-out .sc-card {
  transform: scale(0.85) translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease-in, opacity 0.3s ease-in;
}

/* Glow orb decoration inside card */
.sc-orb {
  position: absolute; border-radius: 50%;
  background: radial-gradient(circle, var(--sc-primary), transparent 70%);
  opacity: 0.2; pointer-events: none;
}
.sc-orb-tl { top:-40px; left:-40px; width:140px; height:140px; }
.sc-orb-br { bottom:-50px; right:-50px; width:160px; height:160px; }

/* Sign title chip */
.sc-title-chip {
  display: inline-block;
  padding: 4px 14px; border-radius: 99px;
  font-size: 0.65rem; font-weight: 900;
  letter-spacing: .1em; text-transform: uppercase;
  color: #fff; margin-bottom: 12px;
}

/* Speech bubble */
.sc-bubble {
  position: relative;
  display: inline-block;
  border-radius: 18px 18px 18px 4px;
  padding: 10px 20px; margin-bottom: 14px;
  font-family: 'Fredoka','Nunito',cursive,sans-serif;
  font-size: 1.2rem; font-weight: 700; color: #fff;
  line-height: 1.3;
}
.sc-bubble::after {
  content: '';
  position: absolute; bottom: -9px; left: 22px;
  border-width: 9px 9px 0; border-style: solid;
}

/* Floating decorators ring */
.sc-floaters {
  position: absolute; inset: 0;
  pointer-events: none; overflow: hidden;
}
.sc-float {
  position: absolute;
  font-size: 1.3rem;
  animation: sc-float-anim 3s ease-in-out infinite alternate;
  opacity: 0.45;
}

/* Animal emoji */
.sc-animal {
  font-size: 5.8rem;
  display: block; margin: 0 auto 6px;
  line-height: 1; user-select: none;
  filter: drop-shadow(0 6px 18px var(--sc-glow));
}

/* Animal name */
.sc-name {
  display: inline-block;
  padding: 4px 14px; border-radius: 99px;
  font-size: 0.78rem; font-weight: 800;
  color: var(--sc-primary);
  border: 1.5px solid var(--sc-primary);
  margin-bottom: 10px;
  background: rgba(0,0,0,0.25);
}

/* Dismiss hint */
.sc-tap {
  font-size: 0.66rem; font-weight: 700;
  color: rgba(255,255,255,.3);
  letter-spacing: .08em; text-transform: uppercase;
  margin-top: 10px;
}

/* ── ANIMAL ANIMATIONS ──────────────────────────────── */
.hc-wave     { animation: sc-wave     0.85s ease-in-out infinite alternate; }
.hc-bounce   { animation: sc-bounce   0.7s ease-in-out infinite alternate; }
.hc-bow      { animation: sc-bow      1.1s ease-in-out infinite alternate; }
.hc-pulse    { animation: sc-pulse    0.7s ease-in-out infinite alternate; }
.hc-heartbeat{ animation: sc-heart    0.5s ease-in-out infinite alternate; }
.hc-shake    { animation: sc-shake    0.4s ease-in-out infinite alternate; }
.hc-lean     { animation: sc-lean     1.2s ease-in-out infinite alternate; }
.hc-spin     { animation: sc-spin     2s   linear      infinite;           }
.hc-swim     { animation: sc-swim     1.4s ease-in-out infinite alternate; }

@keyframes sc-wave     { 0%{transform:rotate(-14deg) scale(1.02)} 100%{transform:rotate(14deg) scale(1.08)} }
@keyframes sc-bounce   { 0%{transform:translateY(0)}              100%{transform:translateY(-22px)}          }
@keyframes sc-bow      { 0%{transform:rotate(0) scale(1)}         100%{transform:rotate(18deg) scale(0.95)} }
@keyframes sc-pulse    { 0%{transform:scale(1)}                   100%{transform:scale(1.22)}               }
@keyframes sc-heart    { 0%{transform:scale(1)}                   100%{transform:scale(1.15)}               }
@keyframes sc-shake    { 0%{transform:rotate(-18deg)}             100%{transform:rotate(18deg)}             }
@keyframes sc-lean     { 0%{transform:rotate(-8deg) translateX(-8px)} 100%{transform:rotate(8deg) translateX(8px)} }
@keyframes sc-spin     { from{transform:rotate(0deg)}             to{transform:rotate(360deg)}              }
@keyframes sc-swim     { 0%{transform:rotate(-10deg) translateY(-6px)} 100%{transform:rotate(10deg) translateY(6px)} }
@keyframes sc-float-anim{ 0%{transform:translateY(0) rotate(-5deg)} 100%{transform:translateY(-16px) rotate(5deg)} }

/* ── CONFETTI ────────────────────────────────────────── */
.sc-confetti {
  position: fixed; pointer-events: none; z-index: 100000;
  border-radius: 3px;
  animation: sc-fall linear forwards;
}
@keyframes sc-fall {
  0%  { transform: translateY(-10px) rotate(0deg);    opacity: 1; }
  100%{ transform: translateY(100vh) rotate(780deg);  opacity: 0; }
}

/* ── REDUCED MOTION ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .sc-card { transition: opacity 0.2s ease !important;
    transform: scale(1) translateY(0) !important; }
  .sc-overlay.sc-out .sc-card { transform: scale(1) !important; }
  .sc-animal,[class^="hc-"] { animation: none !important; }
  .sc-confetti,.sc-float { animation: none !important; display: none !important; }
}
    `;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════
     CONFETTI BURST
  ══════════════════════════════════════════════════════ */
  function fireConfetti(colors) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const N = 60;
    for (let i = 0; i < N; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'sc-confetti';
        const size = 5 + Math.random() * 10;
        const dur  = 1.6 + Math.random() * 2;
        el.style.cssText = `
          left:${8 + Math.random() * 84}vw;
          top:0; width:${size}px;
          height:${size * (Math.random() > 0.5 ? 0.45 : 1)}px;
          background:${colors[Math.floor(Math.random() * colors.length)]};
          animation-duration:${dur}s;
          animation-delay:${Math.random() * 0.5}s;
          border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), (dur + 0.7) * 1000);
      }, i * 15);
    }
  }

  /* ══════════════════════════════════════════════════════
     BUILD POPUP
  ══════════════════════════════════════════════════════ */
  let _active = false;
  let _timer  = null;

  window.showSignCelebration = function (word, speakFn) {
    if (_active) return;

    // Normalise word key
    const key = (word || '').toUpperCase().trim();
    const cfg = SIGN_CONFIG[key];
    if (!cfg) return; // unknown sign — skip

    _active = true;
    injectStyles();

    const animal   = cfg.animals[Math.floor(Math.random() * cfg.animals.length)];
    const greeting = cfg.messages[Math.floor(Math.random() * cfg.messages.length)];

    /* ── Build overlay ── */
    const overlay = document.createElement('div');
    overlay.className = 'sc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `${key} celebration`);

    /* Floaters HTML */
    const floatersHtml = cfg.floaters.map((f, i) => {
      const positions = [
        'top:12%;left:8%',   'top:18%;right:10%',
        'bottom:20%;left:12%','bottom:15%;right:8%'
      ];
      const delays = [0, 0.6, 1.2, 1.8];
      return `<span class="sc-float" style="${positions[i]};animation-delay:${delays[i]}s">${f}</span>`;
    }).join('');

    overlay.innerHTML = `
      <div class="sc-card" role="document" style="
        background:${cfg.gradient};
        border:2.5px solid ${cfg.border};
        box-shadow: 0 0 0 1px rgba(255,255,255,.06),
                    0 24px 80px ${cfg.glow},
                    0  8px 32px rgba(0,0,0,0.7);
        --sc-primary:${cfg.primary};
        --sc-glow:${cfg.glow};
      ">
        <div class="sc-orb sc-orb-tl" style="background:radial-gradient(circle,${cfg.primary},transparent 70%);"></div>
        <div class="sc-orb sc-orb-br" style="background:radial-gradient(circle,${cfg.secondary},transparent 70%);"></div>

        <div class="sc-floaters">${floatersHtml}</div>

        <div class="sc-title-chip" style="background:linear-gradient(135deg,${cfg.secondary},${cfg.primary});">
          ${cfg.title}
        </div>

        <div class="sc-bubble" style="
          background:linear-gradient(135deg,${cfg.secondary},${cfg.primary});
          box-shadow:0 4px 18px ${cfg.glow};
        ">${greeting}<div style="
          position:absolute;bottom:-9px;left:22px;
          border-width:9px 9px 0;border-style:solid;
          border-color:${cfg.primary} transparent transparent;
        "></div></div>

        <span class="sc-animal ${cfg.animation}"
          aria-label="${animal.name}">${animal.emoji}</span>

        <div class="sc-name">${animal.name} celebrates! 🎊</div>
        <p class="sc-tap">Tap anywhere to continue ✨</p>
      </div>
    `;
    document.body.appendChild(overlay);

    /* Animate in */
    requestAnimationFrame(() =>
      requestAnimationFrame(() => overlay.classList.add('sc-in'))
    );

    /* Confetti */
    fireConfetti(cfg.confetti);

    /* TTS */
    const ttsText = greeting.replace(/[^\w\s!'.]/g, '');
    const tts = speakFn || window.speak;
    if (typeof tts === 'function') {
      setTimeout(() => tts(ttsText), 350);
    } else if (window.speechSynthesis) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(ttsText);
        u.lang = 'en-IN'; u.rate = 0.88; u.pitch = 1.2;
        speechSynthesis.speak(u);
      }, 350);
    }

    /* Dismiss */
    function dismiss() {
      if (!_active) return;
      clearTimeout(_timer);
      overlay.classList.remove('sc-in');
      overlay.classList.add('sc-out');
      setTimeout(() => { overlay.remove(); _active = false; }, 380);
    }
    _timer = setTimeout(dismiss, 3000);
    overlay.addEventListener('click', dismiss, { once: true });
    document.addEventListener('keydown', function kh(e) {
      if (['Escape',' ','Enter'].includes(e.key)) { dismiss(); document.removeEventListener('keydown', kh); }
    });
  };

  /* Backward-compat alias */
  window.showHelloCelebration = function (speakFn) {
    window.showSignCelebration('HELLO', speakFn);
  };

})();
