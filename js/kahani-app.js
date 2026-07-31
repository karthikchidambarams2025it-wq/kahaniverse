/**
 * KAHANIVERSE — Core App State & Data Layer
 * Profiles, sessions, rewards, persistence
 */

const KV_KEY = 'kahaniverse_v1';

/* ─── DEFAULT CHILD PROFILES ─── */
const DEFAULT_PROFILES = [
  { id:'kv-p1', name:'Aarav', age:7, avatar:'🧒', color:'#F2994A', diagnosis:'Phonological Disorder', totalXP:340, streak:3, currentWorld:2, teacherId:'kv-t1', prefs:['dance','animals','festival'], sessions:12, avgMotivation:4.2, lastPlayed: new Date(Date.now()-86400000).toISOString() },
  { id:'kv-p2', name:'Priya', age:6, avatar:'👧', color:'#E14FD8', diagnosis:'Expressive Language Delay', totalXP:120, streak:1, currentWorld:1, teacherId:'kv-t2', prefs:['music','colors','stories'], sessions:5, avgMotivation:3.8, lastPlayed: new Date(Date.now()-172800000).toISOString() },
  { id:'kv-p3', name:'Rohan', age:9, avatar:'👦', color:'#4FE3D8', diagnosis:'Stuttering', totalXP:710, streak:7, currentWorld:4, teacherId:'kv-t1', prefs:['kites','adventure','animals'], sessions:22, avgMotivation:4.7, lastPlayed: new Date().toISOString() },
];

/* ─── DEFAULT TEACHERS ─── */
const DEFAULT_TEACHERS = [
  { id:'kv-t1', name:'Dr. Priya Sharma',  specialty:'Phonological Disorders', avatar:'👩‍🏫', color:'#9B87F5', online:true,  rating:4.9, sessions:142 },
  { id:'kv-t2', name:'Mr. Arjun Nair',    specialty:'Fluency & Stuttering',   avatar:'👨‍🏫', color:'#4FE3D8', online:true,  rating:4.8, sessions:98  },
  { id:'kv-t3', name:'Ms. Kavitha Rao',   specialty:'Language Development',   avatar:'👩‍💼', color:'#00FF88', online:false, rating:4.7, sessions:205 },
  { id:'kv-t4', name:'Dr. Ravi Menon',    specialty:'AAC & Communication',    avatar:'👨‍💼', color:'#F7C948', online:true,  rating:4.9, sessions:176 },
  { id:'kv-t5', name:'Ms. Ananya Iyer',   specialty:'Early Intervention',     avatar:'🧑‍🏫', color:'#F2994A', online:true,  rating:4.6, sessions:89  },
];

/* ─── DEFAULT REWARDS ─── */
const DEFAULT_REWARDS = [
  // Indian Cultural Appreciation
  { id:'rw-1', category:'dance',    title:'Bharatanatyam Dance',   emoji:'💃', desc:'Beautiful classical dance performance' },
  { id:'rw-2', category:'festival', title:'Diwali Fireworks',      emoji:'🎆', desc:'Dazzling festival of lights celebration' },
  { id:'rw-3', category:'music',    title:'Folk Song Medley',       emoji:'🎵', desc:'Traditional folk songs from across India' },
  { id:'rw-4', category:'nature',   title:'Peacock Display',        emoji:'🦚', desc:"India's national bird in full display" },
  { id:'rw-5', category:'festival', title:'Holi Colors',            emoji:'🌈', desc:'Joyful festival of colors' },
  { id:'rw-6', category:'animals',  title:'Baby Elephants',         emoji:'🐘', desc:'Baby elephants playing in water' },
  { id:'rw-7', category:'stories',  title:'Panchatantra Story',     emoji:'📖', desc:'Classic Indian animal fable' },
  { id:'rw-8', category:'music',    title:'Tabla Rhythm',           emoji:'🥁', desc:'Energetic tabla percussion' },
  { id:'rw-9', category:'dance',    title:'Garba Dance Circle',     emoji:'🪷', desc:'Vibrant Navratri celebration' },
  { id:'rw-10',category:'nature',   title:'Tiger of India',         emoji:'🐯', desc:'Majestic Bengal tiger in the wild' },
  // Badges
  { id:'rw-b1', category:'badges', title:'Star Communicator ⭐',   emoji:'⭐', desc:'Excellent communication skills!' },
  { id:'rw-b2', category:'badges', title:'Sound Safari Champion 🦁',emoji:'🦁', desc:'Mastered Sound Safari level!' },
  { id:'rw-b3', category:'badges', title:'Holi Hero 🎨',           emoji:'🎨', desc:'Completed Holi Color Garden!' },
  { id:'rw-b4', category:'badges', title:'Onam Master 🚣',         emoji:'🚣', desc:'Sailed the Onam Flower Boat!' },
  { id:'rw-b5', category:'badges', title:'Kite King 🪁',           emoji:'🪁', desc:'Flew high in the Monsoon Sky!' },
  { id:'rw-b6', category:'badges', title:'Speech Champion 🏆',     emoji:'🏆', desc:'Conquered all 5 worlds!' },
];

/* ─── WORLD DEFINITIONS ─── */
const WORLDS = [
  { id:1, name:'Diwali Lantern Bazaar', festival:'Diwali',   emoji:'🪔', skill:'Articulation',        color:'#F7C948', bg:'#1A0A3D', xp:100, stars:0, unlocked:true  },
  { id:2, name:'Holi Color Garden',     festival:'Holi',     emoji:'🎨', skill:'Vocabulary',          color:'#E14FD8', bg:'#FFF8EC', xp:200, stars:0, unlocked:false },
  { id:3, name:'Onam Flower Boat',      festival:'Onam',     emoji:'🚣', skill:'Sentence Formation',  color:'#52B788', bg:'#0E4A3A', xp:300, stars:0, unlocked:false },
  { id:4, name:'Monsoon Kite Sky',      festival:'Monsoon',  emoji:'🪁', skill:'Sign Clarity',        color:'#4FE3D8', bg:'#87CEEB', xp:400, stars:0, unlocked:false },
  { id:5, name:'Global Plaza',          festival:'Celebrate',emoji:'🌍', skill:'Full Expression',     color:'#F2994A', bg:'#1A0A3D', xp:500, stars:0, unlocked:false },
];

/* ─── SIGN → TEXT DICTIONARY ─── */
const SIGN_DICT = {
  open_palm:   { text:'Hello! 👋',            emoji:'👋', teacherReply:'Hello! I\'m so happy to see you today! Ready for an adventure? 🌟' },
  thumbs_up:   { text:'Yes, I understand! 👍', emoji:'👍', teacherReply:'Wonderful! You\'re doing so well! Keep it up! ⭐' },
  thumbs_down: { text:'No, I don\'t know. 👎', emoji:'👎', teacherReply:'That\'s okay! Let\'s try together. Which part is tricky? 🤗' },
  pointing:    { text:'That one! ☝️',          emoji:'☝️', teacherReply:'Great choice! Can you tell me more about it? 💬' },
  fist:        { text:'Wait, please. ✊',       emoji:'✊', teacherReply:'Of course! Take all the time you need. 💙' },
  v_sign:      { text:'I\'m ready! ✌️',         emoji:'✌️', teacherReply:'Fantastic! Let\'s go! You\'ve got this! 🚀' },
  i_love_you:  { text:'Thank you! 🤟',         emoji:'🤟', teacherReply:'You\'re so welcome! You\'re such a star! ⭐' },
  raised_hand: { text:'I need help please. 🖐️',emoji:'🖐️', teacherReply:'I\'m right here! What do you need help with? 🤗' },
  ok_sign:     { text:'Okay, perfect! 👌',     emoji:'👌', teacherReply:'Perfect! You\'re on a roll! 🔥' },
  active:      { text:'I\'m thinking… 🤔',     emoji:'🤔', teacherReply:'Take your time! I can wait. 😊' },
  none:        { text:'',                       emoji:'',   teacherReply:'' },
};

/* ─── APP STATE ─── */
let kvState = {
  currentProfileId: null,
  profiles: [],
  rewards: [],
  worlds: [],
  messages: [],        // sign↔teacher chat
  sessions: [],        // session history
  rewardHistory: [],   // timeline data
  consent: { cameraAffect: false },
  settings: { teacherName:'', apiKey:'' },
};

/* ─── PERSISTENCE ─── */
function kvSave() { localStorage.setItem(KV_KEY, JSON.stringify(kvState)); }

function kvLoad() {
  const raw = localStorage.getItem(KV_KEY);
  if (raw) {
    try {
      const p = JSON.parse(raw);
      kvState = { ...kvState, ...p };
      // Merge default rewards not in storage
      const existIds = new Set(kvState.rewards.map(r=>r.id));
      DEFAULT_REWARDS.forEach(r=>{ if(!existIds.has(r.id)) kvState.rewards.push(r); });
      // Ensure all worlds present
      WORLDS.forEach((w,i)=>{ if(!kvState.worlds[i]) kvState.worlds[i]=JSON.parse(JSON.stringify(w)); });
    } catch(e) { console.warn('KV load error', e); kvReset(); }
  } else {
    kvReset();
  }
}

function kvReset() {
  kvState.profiles  = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
  kvState.rewards   = JSON.parse(JSON.stringify(DEFAULT_REWARDS));
  kvState.worlds    = JSON.parse(JSON.stringify(WORLDS));
  kvState.messages  = [];
  kvState.sessions  = [];
  kvState.rewardHistory = [];
  kvState.currentProfileId = 'kv-p1';
  kvSave();
}

/* ─── PROFILE ─── */
function getProfiles()      { return kvState.profiles; }
function getProfile(id)     { return kvState.profiles.find(p=>p.id===id); }
function getCurrentProfile(){ return getProfile(kvState.currentProfileId); }
function setCurrentProfile(id){ kvState.currentProfileId=id; kvSave(); }

function addProfile(data) {
  const p = {
    id:'kv-p'+Date.now(), totalXP:0, streak:0, currentWorld:1,
    teacherId:null, prefs:[], sessions:0, avgMotivation:0,
    lastPlayed:null, worlds:JSON.parse(JSON.stringify(WORLDS)),
    createdAt:new Date().toISOString(), ...data,
  };
  kvState.profiles.push(p);
  kvSave();
  return p;
}

/* ─── WORLDS ─── */
function getWorlds(profileId) {
  const profile = getProfile(profileId || kvState.currentProfileId);
  return profile?.worlds || kvState.worlds;
}

function getWorld(id, profileId) {
  const worlds = getWorlds(profileId);
  return worlds.find(w=>w.id===id) || WORLDS.find(w=>w.id===id);
}

function completeWorld(worldId, accuracy, profileId) {
  const pid = profileId || kvState.currentProfileId;
  const profile = getProfile(pid);
  if (!profile) return null;
  if (!profile.worlds) profile.worlds = JSON.parse(JSON.stringify(WORLDS));

  const world = profile.worlds.find(w=>w.id===worldId);
  if (!world) return null;

  const stars = accuracy>=0.9?3 : accuracy>=0.7?2 : accuracy>=0.5?1 : 0;
  const xpEarned = Math.round(world.xp * accuracy);
  if (stars > (world.stars||0)) world.stars = stars;

  profile.totalXP  = (profile.totalXP||0) + xpEarned;
  profile.sessions = (profile.sessions||0) + 1;
  profile.lastPlayed = new Date().toISOString();
  profile.currentWorld = Math.max(profile.currentWorld||1, worldId + (stars>=1?1:0));

  // Unlock next world
  if (stars>=1 && worldId < 5) {
    const next = profile.worlds.find(w=>w.id===worldId+1);
    if (next) next.unlocked = true;
  }

  // Streak update
  const lastDate = profile.lastPlayed ? new Date(profile.lastPlayed).toDateString() : null;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now()-86400000).toDateString();
  if (lastDate !== today) {
    profile.streak = lastDate === yesterday ? (profile.streak||0)+1 : 1;
  }

  // Record in timeline
  kvState.rewardHistory.push({
    profileId: pid,
    worldId, accuracy, stars, xpEarned,
    timestamp: new Date().toISOString(),
    latency: Math.round(Math.random()*20+5),  // seconds to next task (simulated)
  });

  kvSave();
  return { stars, xpEarned, totalXP: profile.totalXP };
}

/* ─── SIGN → TEXT CHAT ─── */
function addSignMessage(gesture) {
  const g = SIGN_DICT[gesture];
  if (!g || !g.text) return null;
  const msg = { id:Date.now(), from:'child', gesture, text:g.text, emoji:g.emoji, ts:new Date().toISOString() };
  kvState.messages.push(msg);
  kvSave();
  return msg;
}

function addTeacherMessage(text, auto=false) {
  const msg = { id:Date.now()+1, from:'teacher', text, auto, ts:new Date().toISOString() };
  kvState.messages.push(msg);
  kvSave();
  return msg;
}

function getTeacherReply(gesture) {
  return SIGN_DICT[gesture]?.teacherReply || 'Great job! Keep going! 💙';
}

/* ─── HELPERS ─── */
function formatDate(iso) {
  if(!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}
function formatTime(iso) {
  if(!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
}
function getPlayerLevelName(xp) {
  if(xp>=1500) return 'Speech Champion 🏆';
  if(xp>=900)  return 'Story Weaver ⭐';
  if(xp>=500)  return 'Word Wizard 🪄';
  if(xp>=200)  return 'Sound Explorer 🔍';
  return 'Kahi\'s Friend 🦚';
}
function showKVToast(msg, type='info', duration=3000) {
  const c = document.getElementById('kv-toast') || (() => {
    const el = document.createElement('div');
    el.id='kv-toast'; el.className='toast-container';
    document.body.appendChild(el); return el;
  })();
  const t = document.createElement('div');
  const icons = {success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  t.className = `k-toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, duration);
}
function launchKonfetti() {
  const colors = ['#F2994A','#E14FD8','#4FE3D8','#F7C948','#3A7D44','#C1272D'];
  for(let i=0;i<60;i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random()*100}vw;top:-10px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${Math.random()*8+5}px;height:${Math.random()*8+5}px;animation-duration:${Math.random()*2+1.5}s;animation-delay:${Math.random()*0.5}s;border-radius:${Math.random()>.5?'50%':'2px'};z-index:9998;`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),3000);
  }
}

/* ─── INIT ─── */
function kvInit() {
  kvLoad();
  if (!kvState.currentProfileId && kvState.profiles.length>0) {
    kvState.currentProfileId = kvState.profiles[0].id;
  }
  kvSave();
}

window.KV = {
  init: kvInit, save: kvSave, load: kvLoad, reset: kvReset,
  getProfiles, getProfile, getCurrentProfile, setCurrentProfile, addProfile,
  getWorlds, getWorld, completeWorld,
  addSignMessage, addTeacherMessage, getTeacherReply,
  showToast: showKVToast, launchKonfetti,
  formatDate, formatTime, getPlayerLevelName,
  get state()  { return kvState; },
  get profiles(){ return kvState.profiles; },
  WORLDS, DEFAULT_TEACHERS, DEFAULT_REWARDS, SIGN_DICT,
};
