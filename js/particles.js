/* ==========================================
   Canvas Starfield Particle Background
   ========================================== */

const STAR_COUNT = 240;          // was 120
const LINE_DIST = 140;

const DRIFT_SPEED = 0.075;       // per-particle drift, was 0.15 — halved
const TWINKLE_SPEED = 0.002;     // breathing rate base, was 0.005 — halved
const TWINKLE_SPEED_VAR = 0.001; // was 0.002 — halved
const STEP_MS = 1000 / 60;       // original per-frame units were 60fps based

const CURSOR_RADIUS = 170;       // how far the pointer disturbs particles
const CURSOR_FORCE = 7;          // push strength at the very centre
const HOME_EASE = 0.0005;        // loose tether: lets the particle wander locally
const HOME_SNAP = 0.09;          // firm pull once it has been knocked clear
const HOME_SLACK = 30;           // displacement still counted as local wandering
const HOME_LATCH = 2;            // distance at which it counts as home again

class Particle {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, init = false) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.homeX = this.x;
    this.homeY = this.y;
    // Drift is stored as a fixed speed + direction so it can be scaled
    // independently of the velocity the cursor perturbation adds.
    this.driftSpeed = DRIFT_SPEED;
    this.driftAngle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(this.driftAngle) * this.driftSpeed;
    this.vy = Math.sin(this.driftAngle) * this.driftSpeed;
    this.radius = Math.random() * 1.2 + 0.3;
    this.opacity = Math.random() * 0.7 + 0.2;
    this.opacityDir = Math.random() > 0.5 ? 1 : -1;
    this.opacitySpeed = Math.random() * TWINKLE_SPEED_VAR + TWINKLE_SPEED;
    this.returning = false;
  }

  update(w, h, k, mouse) {
    // Drift — always at DRIFT_SPEED, never braked by the tether below.
    this.x += this.vx * k;
    this.y += this.vy * k;

    // Cursor perturbation — pushes the particle away from the pointer, strongest
    // at the centre and easing out to nothing at CURSOR_RADIUS.
    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CURSOR_RADIUS) {
        const falloff = 1 - dist / CURSOR_RADIUS;
        const push = CURSOR_FORCE * falloff * falloff;
        const nx = dist > 0.001 ? dx / dist : Math.cos(this.driftAngle);
        const ny = dist > 0.001 ? dy / dist : Math.sin(this.driftAngle);
        this.x += nx * push * k;
        this.y += ny * push * k;
      }
    }

    // Tether home. Below HOME_SLACK the pull is slack, so the particle is free to
    // wander locally at full drift speed; past it — which only happens when the
    // pointer has shoved it — the firm pull takes over and reels it back. The
    // firm pull holds until HOME_LATCH, so it returns to its place and stays.
    const hdx = this.homeX - this.x;
    const hdy = this.homeY - this.y;
    const homeDist = Math.sqrt(hdx * hdx + hdy * hdy);
    if (this.returning) {
      if (homeDist <= HOME_LATCH) this.returning = false;
    } else if (homeDist > HOME_SLACK) {
      this.returning = true;
    }
    const ease = this.returning ? HOME_SNAP : HOME_EASE;
    this.x += hdx * ease * k;
    this.y += hdy * ease * k;

    // Wrap around edges, carrying the home point along so the tether never
    // tries to drag a particle back across the whole canvas.
    if (this.x < -10) { this.x += w + 20; this.homeX += w + 20; }
    if (this.x > w + 10) { this.x -= w + 20; this.homeX -= w + 20; }
    if (this.y < -10) { this.y += h + 20; this.homeY += h + 20; }
    if (this.y > h + 10) { this.y -= h + 20; this.homeY -= h + 20; }

    // Twinkle
    this.opacity += this.opacitySpeed * this.opacityDir * k;
    if (this.opacity >= 0.8) this.opacityDir = -1;
    if (this.opacity <= 0.15) this.opacityDir = 1;
  }
}

const stars = [];
const mouse = { x: -9999, y: -9999, active: false };
let canvas, ctx, w, h, animId, lastTime = 0;

function onPointerMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
}

function onPointerLeave() {
  mouse.active = false;
  mouse.x = -9999;
  mouse.y = -9999;
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const nextW = window.innerWidth;
  const nextH = window.innerHeight;
  const sx = w ? nextW / w : 1;
  const sy = h ? nextH / h : 1;
  // Keep particles (and their home points) proportionally placed on resize.
  for (const s of stars) {
    s.x *= sx;  s.homeX *= sx;
    s.y *= sy;  s.homeY *= sy;
  }
  w = nextW;
  h = nextH;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function init() {
  canvas = document.getElementById('particles');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  w = window.innerWidth;
  h = window.innerHeight;
  resize();
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Particle(w, h));
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('blur', onPointerLeave);
  lastTime = 0;
  animate();
}

function drawLine(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < LINE_DIST) {
    const alpha = (1 - dist / LINE_DIST) * 0.12;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

function animate(now) {
  // Frame-rate independent step, expressed in original 60fps frames,
  // so halving a speed means the same thing on any display.
  const k = lastTime ? Math.min((now - lastTime) / STEP_MS, 6) : 1;
  lastTime = now;

  ctx.clearRect(0, 0, w, h);

  for (let i = 0; i < stars.length; i++) {
    stars[i].update(w, h, k, mouse);

    // Draw star
    ctx.beginPath();
    ctx.arc(stars[i].x, stars[i].y, stars[i].radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 240, 255, ${stars[i].opacity})`;
    ctx.fill();

    // Draw connections
    for (let j = i + 1; j < stars.length; j++) {
      drawLine(stars[i], stars[j]);
    }
  }

  animId = requestAnimationFrame(animate);
}

// Check for reduced-motion preference
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!mq.matches) {
  init();
}
mq.addEventListener('change', (e) => {
  if (e.matches) {
    cancelAnimationFrame(animId);
    if (canvas) canvas.style.display = 'none';
  } else {
    if (canvas) canvas.style.display = '';
    init();
  }
});
