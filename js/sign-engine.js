/**
 * KAHANIVERSE — SIGN ENGINE (v2)
 * MediaPipe Hands with per-finger colored skeleton + AI confidence ring
 * Glowing skeletal tracking overlay so child sees "AI understanding you"
 */

const FINGER_COLORS = [
  '#4FE3D8', // Thumb — cyan
  '#F7C948', // Index — gold
  '#E14FD8', // Middle — magenta
  '#52B788', // Ring — green
  '#F2994A', // Pinky — orange
];

const FINGER_CONNECTIONS = [
  [[0,1],[1,2],[2,3],[3,4]],         // Thumb
  [[0,5],[5,6],[6,7],[7,8]],         // Index
  [[0,9],[9,10],[10,11],[11,12]],    // Middle
  [[0,13],[13,14],[14,15],[15,16]],  // Ring
  [[0,17],[17,18],[18,19],[19,20]],  // Pinky
];

class SignEngine {
  constructor(videoEl, canvasEl, options = {}) {
    this.video    = videoEl;
    this.canvas   = canvasEl;
    this.ctx      = canvasEl?.getContext('2d');
    this.isRunning = false;
    this.gesture  = 'none';
    this.activityScore = 0;
    this.confidence = 0;     // 0–1, drives the confidence ring
    this.simMode  = false;
    this.onGesture = options.onGesture || null;
    this.onActivity = options.onActivity || null;
    this._simInterval = null;
    this._hands = null;
    this._recognitionProgress = 0;  // fills over ~1s for held gesture
    this._lastGestureTs = 0;
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }, audio: false,
      });
      this.video.srcObject = stream;
      await this.video.play();
      if (this.canvas) { this.canvas.width = 640; this.canvas.height = 480; }
      this.isRunning = true;

      if (typeof Hands !== 'undefined' && typeof Camera !== 'undefined') {
        await this._initMediaPipe();
      } else {
        this._startSim();
      }
    } catch (err) {
      this.simMode = true;
      this._startSim();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.video?.srcObject) {
      this.video.srcObject.getTracks().forEach(t => t.stop());
      this.video.srcObject = null;
    }
    if (this._hands) { this._hands.close?.(); this._hands = null; }
    clearInterval(this._simInterval);
  }

  async _initMediaPipe() {
    this._hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
    this._hands.setOptions({ maxNumHands: 2, modelComplexity: 0, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
    this._hands.onResults(r => this._processResults(r));
    const cam = new Camera(this.video, {
      onFrame: async () => { if (this.isRunning) await this._hands.send({ image: this.video }); },
      width: 640, height: 480,
    });
    cam.start();
  }

  _processResults(results) {
    if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!results.multiHandLandmarks?.length) {
      this.activityScore = Math.max(0, this.activityScore - 0.05);
      this._recognitionProgress = Math.max(0, this._recognitionProgress - 0.05);
      this._emit('none');
      return;
    }
    const lm = results.multiHandLandmarks[0];
    this._drawColoredSkeleton(lm);
    this.activityScore = this._computeActivity(lm);
    const g = this._classify(lm);

    // Confidence ring: fills as gesture is held consistently
    if (g === this.gesture && g !== 'none' && g !== 'active') {
      this._recognitionProgress = Math.min(1, this._recognitionProgress + 0.08);
    } else {
      this._recognitionProgress = Math.max(0, this._recognitionProgress - 0.1);
    }
    this.confidence = this._recognitionProgress;
    this._drawConfidenceRing(lm);
    this._emit(g);
  }

  _startSim() {
    this.simMode = true;
    const gestures = ['open_palm','thumbs_up','v_sign','pointing','fist','raised_hand','ok_sign','i_love_you','thumbs_down'];
    let idx = 0;
    this._simInterval = setInterval(() => {
      if (!this.isRunning) return;
      this._recognitionProgress = 0;
      const g = gestures[idx % gestures.length];
      const ramp = setInterval(() => {
        this._recognitionProgress = Math.min(1, this._recognitionProgress + 0.1);
        this.confidence = this._recognitionProgress;
        if (this._recognitionProgress >= 1) { clearInterval(ramp); this._emit(g); }
      }, 80);
      idx++;
    }, 4500);
  }

  _emit(gesture) {
    const prevGesture = this.gesture;
    if (gesture !== 'none' && gesture !== 'active') this.gesture = gesture;
    // Safe lookup — SIGN_DICT is a global const, not on KV
    const dict = window.SIGN_DICT || {};
    const info = dict[gesture] || {};
    if (gesture !== prevGesture && this.onGesture) {
      this.onGesture(gesture, info, this.confidence);
    }
    if (this.onActivity) this.onActivity(this.activityScore, this.confidence);
  }

  /* ── Per-finger colored skeleton ── */
  _drawColoredSkeleton(lm) {
    if (!this.ctx || !this.canvas) return;
    const W = this.canvas.width, H = this.canvas.height;
    const ctx = this.ctx;

    // Draw each finger in its unique color
    FINGER_CONNECTIONS.forEach((finger, fi) => {
      const color = FINGER_COLORS[fi];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;

      finger.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * W, lm[a].y * H);
        ctx.lineTo(lm[b].x * W, lm[b].y * H);
        ctx.stroke();
      });

      // Fingertip glow node
      const tipIdx = [4, 8, 12, 16, 20][fi];
      const tip = lm[tipIdx];
      const grad = ctx.createRadialGradient(tip.x*W, tip.y*H, 0, tip.x*W, tip.y*H, 12);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(tip.x * W, tip.y * H, 8, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Palm center node
    const palm = lm[0];
    ctx.beginPath();
    ctx.arc(palm.x * W, palm.y * H, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /* ── Confidence ring around wrist ── */
  _drawConfidenceRing(lm) {
    if (!this.ctx || !this.canvas || this._recognitionProgress <= 0) return;
    const ctx = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    const wrist = lm[0];
    const cx = wrist.x * W, cy = wrist.y * H;
    const radius = 28;

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Progress arc
    const startAngle = -Math.PI / 2;
    const endAngle   = startAngle + (this._recognitionProgress * Math.PI * 2);
    const color = this._recognitionProgress >= 1 ? '#00FF88' : '#4FE3D8';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Complete flash
    if (this._recognitionProgress >= 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,136,0.4)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }
  }

  _computeActivity(lm) {
    const wrist = lm[0], tip = lm[8];
    return Math.min(1, (Math.abs(wrist.x - tip.x) + Math.abs(wrist.y - tip.y)) * 3);
  }

  _classify(lm) {
    const thumbUp   = lm[4].y < lm[3].y && lm[4].y < lm[2].y;
    const thumbDown = lm[4].y > lm[3].y && lm[4].y > lm[5].y;
    const indexUp   = lm[8].y < lm[6].y;
    const middleUp  = lm[12].y < lm[10].y;
    const ringUp    = lm[16].y < lm[14].y;
    const pinkyUp   = lm[20].y < lm[18].y;
    const openPalm  = indexUp && middleUp && ringUp && pinkyUp;
    const fist      = !indexUp && !middleUp && !ringUp && !pinkyUp;
    const vSign     = indexUp && middleUp && !ringUp && !pinkyUp;
    const pointing  = indexUp && !middleUp && !ringUp && !pinkyUp;
    const thumbIndex = Math.abs(lm[4].x - lm[8].x) + Math.abs(lm[4].y - lm[8].y);
    const okSign    = thumbIndex < 0.06;
    if (thumbUp && !indexUp && !middleUp)   return 'thumbs_up';
    if (thumbDown && !indexUp)               return 'thumbs_down';
    if (openPalm)                            return 'open_palm';
    if (fist)                                return 'fist';
    if (vSign)                               return 'v_sign';
    if (pointing)                            return 'pointing';
    if (okSign)                              return 'ok_sign';
    if (indexUp && pinkyUp && thumbUp)       return 'i_love_you';
    if (openPalm && lm[0].y > 0.5)          return 'raised_hand';
    return 'active';
  }
}

window.SignEngine = SignEngine;
