/**
 * KAHANIVERSE — 3D REWARD REVEAL
 * Portal-mode overlay with Three.js spinning reward + particle burst
 */

class Reward3D {
  constructor() {
    this.overlay  = null;
    this.renderer = null;
    this.scene    = null;
    this.camera   = null;
    this.animId   = null;
  }

  /* ── Show reward reveal ── */
  show(reward, onClose) {
    this._buildOverlay(reward, onClose);
    this._buildThreeScene(reward);
    this._spawnParticles();
    KV.launchKonfetti();
  }

  _buildOverlay(reward, onClose) {
    // Remove any existing overlay
    const existing = document.getElementById('r3d-overlay');
    if (existing) existing.remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'r3d-overlay';
    this.overlay.style.cssText = [
      'position:fixed;inset:0;z-index:900',
      'background:rgba(11,14,43,0.97)',
      'backdrop-filter:blur(30px)',
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'opacity:0;transition:opacity 0.5s',
    ].join(';');

    this.overlay.innerHTML = `
      <canvas id="r3d-canvas" width="340" height="340" style="border-radius:50%;box-shadow:0 0 60px rgba(79,227,216,0.3);"></canvas>
      <div style="text-align:center;margin-top:2rem;">
        <div style="font-size:5rem;margin-bottom:1rem;filter:drop-shadow(0 0 30px #F7C948);animation:rewardFloat 2s ease-in-out infinite;">${reward.emoji}</div>
        <h2 style="font-family:'Baloo 2',sans-serif;font-size:1.8rem;font-weight:800;color:#fff;margin-bottom:0.5rem;">${reward.title}</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;margin-bottom:2rem;">${reward.desc || 'You earned this special reward!'}</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          <button onclick="window._r3d?.close()" style="background:linear-gradient(135deg,#4FE3D8,#0E7C7B);border:none;color:#fff;padding:0.8rem 2rem;border-radius:999px;font-family:'Baloo 2',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(79,227,216,0.4);">Awesome! 🎉</button>
        </div>
      </div>
      <style>
        @keyframes rewardFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-16px) rotate(3deg)}}
      </style>
    `;

    document.body.appendChild(this.overlay);
    window._r3d = this;
    this._onClose = onClose;
    requestAnimationFrame(() => { this.overlay.style.opacity = '1'; });
  }

  _buildThreeScene(reward) {
    const canvas = document.getElementById('r3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    this.camera.position.z = 4;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(340, 340);
    this.renderer.setClearColor(0x000000, 0);

    // Holographic rotating torus knot
    const geo = new THREE.TorusKnotGeometry(1, 0.3, 128, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x4FE3D8, wireframe: true, transparent: true, opacity: 0.7,
    });
    this._mesh = new THREE.Mesh(geo, mat);
    this.scene.add(this._mesh);

    // Outer ring
    const rGeo = new THREE.TorusGeometry(1.8, 0.02, 8, 80);
    const rMat = new THREE.MeshBasicMaterial({ color: 0xF7C948, transparent: true, opacity: 0.5 });
    this.scene.add(new THREE.Mesh(rGeo, rMat));

    // Ambient glow
    this.scene.add(new THREE.AmbientLight(0x4FE3D8, 0.6));
    this.scene.add(new THREE.PointLight(0xF7C948, 2, 10));

    let t = 0;
    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      t += 0.015;
      if (this._mesh) {
        this._mesh.rotation.x = t * 0.7;
        this._mesh.rotation.y = t;
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  _spawnParticles() {
    const colors = ['#4FE3D8','#F7C948','#E14FD8','#F2994A','#00FF88'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      const angle = (i / 40) * Math.PI * 2;
      const dist  = 120 + Math.random() * 100;
      p.style.cssText = [
        'position:fixed;border-radius:50%;pointer-events:none;z-index:950',
        `width:${Math.random()*8+4}px;height:${Math.random()*8+4}px`,
        `background:${colors[i % colors.length]}`,
        `top:50%;left:50%`,
        `transform:translate(-50%,-50%)`,
        `animation:burstFly ${Math.random()*0.5+0.5}s ease-out ${Math.random()*0.3}s forwards`,
        `--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px`,
      ].join(';');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  }

  close() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer) this.renderer.dispose();
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => this.overlay?.remove(), 500);
    }
    if (this._onClose) this._onClose();
    window._r3d = null;
  }
}

window.Reward3D = Reward3D;
