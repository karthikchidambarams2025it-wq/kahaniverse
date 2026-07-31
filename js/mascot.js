/**
 * KAHANIVERSE — MASCOT "KAHI" (Peacock Spirit)
 * Dialogue system, actions, floating companion
 */

const KAHI_DIALOGUES = {
  greeting:    ['Hello! I\'m Kahi! Ready for your story? 🦚', 'Welcome back! Let\'s fly today! 🌟', 'Namaste! Your adventure awaits! ✨'],
  correct:     ['Yes! Amazing! ⭐', 'You got it! Brilliant! 🎉', 'That\'s perfect! 🌟', 'Wonderful! You\'re so smart! 💫'],
  wrong:       ['Oops! Let\'s try again! 💙', 'Almost! You\'re so close! 🤗', 'Don\'t worry! Practice makes perfect! 🌈'],
  levelUp:     ['You unlocked a new world! 🗺️', 'New adventure awaits! Let\'s go! 🚀', 'Amazing! You\'re unstoppable! 🏆'],
  encourage:   ['You can do it! I believe in you! 💪', 'Keep going! You\'re doing great! ⭐', 'One more try! You\'ve got this! 🌟'],
  reward:      ['Here\'s a special reward for you! 🎁', 'You earned this! Enjoy! 🌈', 'A gift from Kahi! 🦚✨'],
  signing:     ['Show me your hands! I\'m watching! 👀', 'Make your sign clearly! 🤲', 'I can see your hands! 👐'],
  sleep:       ['Zzz… wake me when you\'re back! 😴', 'Taking a little nap… 💤', 'Come back soon! I\'ll wait here! 🦚'],
};

const KAHI_EMOJI = '🦚';

class KahiMascot {
  constructor(containerId, mode = 'world') {
    this.container  = document.getElementById(containerId);
    this.mode       = mode;  // 'portal' | 'world'
    this.bubble     = null;
    this.bubbleTimer = null;
    this.currentAction = 'idle';
    if (this.container) this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="kahi-mascot kahi-${this.mode}" id="kahi-inner">
        <div class="kahi-aura"></div>
        <div class="kahi-body" id="kahi-body" style="font-size:inherit;">${KAHI_EMOJI}</div>
        <div class="kahi-bubble" id="kahi-bubble"></div>
      </div>
    `;
    this.bubble = document.getElementById('kahi-bubble');
    this.inner  = document.getElementById('kahi-inner');
  }

  say(text, duration = 3500) {
    if (!this.bubble) return;
    clearTimeout(this.bubbleTimer);
    this.bubble.textContent = text;
    this.bubble.classList.add('visible');
    this.bubbleTimer = setTimeout(() => {
      this.bubble.classList.remove('visible');
    }, duration);
  }

  sayRandom(category, duration) {
    const lines = KAHI_DIALOGUES[category] || KAHI_DIALOGUES.greeting;
    this.say(lines[Math.floor(Math.random() * lines.length)], duration);
  }

  setMode(mode) {
    this.mode = mode;
    if (this.inner) {
      this.inner.classList.remove('kahi-portal','kahi-world');
      this.inner.classList.add('kahi-'+mode);
    }
  }

  setAction(action) {
    if (!this.inner) return;
    this.inner.classList.remove('celebrate','wave','sleep');
    this.currentAction = action;
    if (action !== 'idle') this.inner.classList.add(action);
  }

  celebrate(text) {
    this.setAction('celebrate');
    this.say(text || this.sayRandom('correct', 2500));
    setTimeout(() => this.setAction('idle'), 2500);
  }

  greet() {
    this.setAction('wave');
    this.sayRandom('greeting', 3000);
    setTimeout(() => this.setAction('idle'), 1500);
  }

  showSign(gesture, word) {
    this.setAction('idle');
    // Show subtitle near mascot
    const existing = document.querySelector('.sign-subtitle');
    if (existing) existing.remove();
    if (!word) return;
    const sub = document.createElement('div');
    sub.className = 'sign-subtitle';
    sub.textContent = word;
    if (this.container) {
      this.container.style.position = 'relative';
      this.container.appendChild(sub);
      setTimeout(() => sub.remove(), 3000);
    }
  }

  setSize(size) {
    if (this.container) {
      this.container.classList.remove('kahi-sm','kahi-md','kahi-lg','kahi-xl');
      this.container.classList.add(size);
    }
  }
}

/* ─── FLOATING COMPANION (fixed corner) ─── */
class KahiCompanion {
  constructor() {
    this.el = null;
    this.mascot = null;
    this.mounted = false;
  }

  mount(mode = 'world') {
    if (this.mounted) return;
    const wrap = document.createElement('div');
    wrap.className = 'kahi-companion kahi-md';
    wrap.id = 'kahi-companion';
    wrap.innerHTML = `
      <div class="kahi-mascot kahi-${mode}">
        <div class="kahi-aura" style="width:70px;height:70px;"></div>
        <div class="kahi-body" style="font-size:3rem;">🦚</div>
        <div class="kahi-bubble" id="companion-bubble" style="bottom:calc(100% + 8px);min-width:200px;"></div>
      </div>
    `;
    document.body.appendChild(wrap);
    this.el = wrap;
    this.bubble = document.getElementById('companion-bubble');
    this.mounted = true;

    // Click to greet
    wrap.addEventListener('click', () => {
      const lines = KAHI_DIALOGUES.encourage;
      this.say(lines[Math.floor(Math.random()*lines.length)], 3000);
    });
  }

  say(text, duration = 3500) {
    if (!this.bubble) return;
    this.bubble.textContent = text;
    this.bubble.classList.add('visible');
    setTimeout(() => this.bubble.classList.remove('visible'), duration);
  }
}

window.KahiMascot  = KahiMascot;
window.KahiCompanion = KahiCompanion;
window.KAHI_DIALOGUES = KAHI_DIALOGUES;
