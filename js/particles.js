/* ==========================================
   Canvas Starfield Particle Background
   ========================================== */

const STAR_COUNT = 120;
const LINE_DIST = 140;

class Particle {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, init = false) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.radius = Math.random() * 1.2 + 0.3;
    this.opacity = Math.random() * 0.7 + 0.2;
    this.opacityDir = Math.random() > 0.5 ? 1 : -1;
    this.opacitySpeed = Math.random() * 0.005 + 0.002;
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    if (this.x < -10) this.x = w + 10;
    if (this.x > w + 10) this.x = -10;
    if (this.y < -10) this.y = h + 10;
    if (this.y > h + 10) this.y = -10;

    // Twinkle
    this.opacity += this.opacitySpeed * this.opacityDir;
    if (this.opacity >= 0.8) this.opacityDir = -1;
    if (this.opacity <= 0.15) this.opacityDir = 1;
  }
}

const stars = [];
let canvas, ctx, w, h, animId;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
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
  resize();
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Particle(w, h));
  }
  window.addEventListener('resize', resize);
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

function animate() {
  ctx.clearRect(0, 0, w, h);

  for (let i = 0; i < stars.length; i++) {
    stars[i].update(w, h);

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
