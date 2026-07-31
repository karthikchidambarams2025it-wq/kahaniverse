# 🦚 KAHANIVERSE — Sign & Talk AI

> *"Every child deserves a voice. Yours are your hands."*

A real-time, AI-powered sign language communication platform built for deaf and speech-impaired children to interact with teachers through ISL (Indian Sign Language) gestures — with zero speech required.

---

## 🎯 The Core Problem

Deaf and speech-impaired children in Indian classrooms cannot participate in real-time teacher-student interaction. They are isolated from conversation, dependent on paper, and excluded from the energy of live teaching. Kahaniverse Sign & Talk AI gives them a voice — through their hands.

---

## 🔑 Core Interaction Flow

`
CHILD                                    TEACHER
──────                                   ────────
Shows ISL hand sign to camera
→ MediaPipe AI detects gesture (0.7s)
→ Confidence scored 0–100%
→ Word appears in child's chat bubble   ← Teacher reads text instantly
→ TTS speaks the word aloud             ← Teacher hears it spoken

                                         Teacher types a reply
                                         → Bubble appears in chat
                                         → TTS speaks reply aloud to child
                                         ← Child HEARS the teacher's voice
`

No speech from the child. No special hardware. Just a camera and a browser.

---

## ✨ Features Implemented

### 1. Real-Time ISL Sign Detection
- Live webcam feed via WebRTC (getUserMedia)
- **MediaPipe Hands** for 21-point hand landmark tracking per hand
- Colored skeleton overlay renders on a transparent canvas in real-time
- Gesture classifier maps landmark geometry to ISL signs
- **0.7-second hold threshold** — comfortable for children, avoids accidental sends
- Flip (mirror) mode so child sees a natural reflection

### 2. AI Confidence Scoring System
- **Circular SVG gauge** shows confidence 0–100% live per frame
- **Color-coded validation badge:**
  - Green (>= 80%) → EXCELLENT
  - Cyan (55–79%) → DETECTED
  - Amber (< 55%) → ADJUSTING (never punish — just encourage)
- Smooth confidence interpolation prevents flickering

### 3. Neural Network Visualizer
- SVG neural network with animated nodes and weighted edges
- Activates proportionally to gesture confidence
- Visual proof of AI processing — powerful for hackathon demos

### 4. Two-Way Persistent Chat
- **Child (right side):** ISL sign → text bubble with confidence badge
- **Teacher (left side):** Typed reply → bubble + TTS voice spoken aloud
- All messages timestamped and scroll-preserved
- Teacher Quick Reply buttons for instant responses
- HEAR AGAIN on every teacher bubble for the child

### 5. Text-to-Speech (TTS) Engine
- Web Speech API — 100% on-device, no cloud API needed
- Prefers Indian English (en-IN) voice
- unlockAudio() bypasses browser autoplay restrictions on first gesture
- Reads signed words aloud AND teacher replies aloud
- Toggle on/off with VOICE ON / VOICE OFF

### 6. Session Transcript and Analytics
- **Rolling transcript box** — every confirmed sign word appears live
- READ ALOUD — speaks full transcript as a sentence
- **Session Stats bar:** Words signed · Avg Confidence · Words/Minute · Timer
- EXPORT — downloads .txt session log with timestamps + confidence scores

### 7. Demo Mode (Hackathon-Ready)
- **No camera needed** — signs cycle automatically every 4 seconds
- Shows the full AI flow: detection → confidence → bubble → TTS
- Perfect for presentations where camera access may be blocked
- Teacher can still type and send replies normally in Demo Mode

### 8. Child-Friendly Safety Features
- PAUSE → full-screen calm overlay with breathing animation
- **Never shows red X or failure** — only positive reinforcement
- Auto-encouragement every 3 confirmed words
- Camera is never auto-started — always child's choice

### 9. ISL Sign Library (10 Signs)

| Sign | Gesture | Emoji |
|------|---------|-------|
| Hello | Open hand, spread fingers | 👋 |
| Yes | Thumb pointing up | 👍 |
| No | All fingers closed tight | ✊ |
| More | 2 fingers up (peace sign) | ✌️ |
| I want | 1 finger pointing straight up | ☝️ |
| Help me | Open hand raised high | 🙋 |
| Good | Thumb + index make a circle | 👌 |
| Not okay | Thumb pointing down | 👎 |
| Thank you | Pinky + index + thumb out | 🙏 |
| Water | Only pinky finger up | 💧 |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Hand Tracking | MediaPipe Hands (21-point per hand) |
| Gesture Classifier | Custom rule-based landmark geometry engine |
| TTS Voice | Web Speech API — en-IN preferred |
| UI Framework | Vanilla HTML5 + CSS3 + JavaScript (no dependencies) |
| Fonts | Orbitron (HUD), Inter (body), JetBrains Mono (data) |
| Camera | WebRTC getUserMedia |
| Data Store | localStorage via KV session layer |
| Export | Blob API → .txt download |
| ML CDN | cdn.jsdelivr.net/npm/@mediapipe/hands |

**Zero backend. Zero cloud. Zero cost to run.**

---

## 📁 Project Structure

`
kahaniverse/
├── index.html              ← Homepage with glowing Sign & Talk hero CTA
├── communicate.html        ← SIGN & TALK AI — core feature
├── world-map.html          ← Festival world selector
├── learn.html              ← ISL learning module
├── clinician.html          ← Teacher/clinician dashboard
├── sign-detect.html        ← Standalone sign detection demo
├── level.html              ← Festival gamified levels
├── sticker-book.html       ← Achievement sticker rewards
├── plaza.html              ← Community hub
├── profile.html            ← Child profile and XP
├── settings.html           ← Help and preferences
│
├── js/
│   ├── sign-engine.js      ← MediaPipe hand tracker + gesture classifier
│   ├── tts-engine.js       ← Web Speech API wrapper (en-IN preferred)
│   └── kahani-app.js       ← Global state, SIGN_DICT, session KV
│
└── css/
    ├── tokens.css          ← Design system tokens
    └── a11y.css            ← Accessibility + persistent dock
`

---

## 🚀 How to Run

No install required. Open directly in browser:

1. Open index.html → click SIGN & TALK AI (glowing button)
2. Click START CAMERA → allow camera access
3. Show an ISL sign — hold steady for 0.7 seconds
4. Watch the word appear in chat + TTS speaks it aloud
5. Teacher types a reply → child hears it via TTS
6. Or click DEMO MODE for a camera-free walkthrough

Or serve locally:
  npx serve kahaniverse/

---

## 🌍 Hackathon Impact

| Metric | Value |
|--------|-------|
| Children who cannot speak in India | ~18 million |
| Cost to run this system | Rs. 0 (runs in a browser) |
| Hardware required | Any laptop with a camera |
| Network required | None (100% offline) |
| Languages supported | ISL (expandable) |
| Setup time for a classroom | < 2 minutes |

---

## 🔮 Future Enhancements

- Expand ISL dictionary to 50+ signs using custom TensorFlow.js model
- Real-time fingerspelling (A–Z alphabet recognition)
- Multi-child mode — classroom with multiple cameras
- Progress analytics dashboard for clinicians
- Offline PWA packaging for no-internet schools
- Emotion detection overlay (child's facial expression)
- Hindi + regional language TTS voices
- Session video recording + playback for SLP review
- Gamification — XP, streaks, sticker rewards for signing

---

## 💡 Design Philosophy

Does this actually make a disabled child's experience easier and less frustrating?
Simpler-but-kinder over flashy-but-complex.

- Never punish mistakes — no red X, no failure screens
- Always child's choice — camera never auto-starts
- Positive reinforcement only — auto-encouragement every 3 signs
- Accessible by default — ARIA labels, screen reader support, skip links
- Privacy-first — video never leaves the device

---

## 👩‍💻 Author

Built for Hackathon 2025 — Accessibility and Inclusive Technology Track

**Kahaniverse** — Kahi (कही) — "Something said, something told"

Every child has a story. We give them the tools to tell it.

---

## 📄 License

MIT — Free to use, modify, and deploy in any classroom or special education setting.
