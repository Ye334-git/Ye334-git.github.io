/* ==========================================
   Pointer-responsive frosted lens for the hero title
   ========================================== */

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initHeroLens() {
  const title = document.querySelector('#hero .glitch');
  const text = title ? title.querySelector('.glitch-text') : null;
  const lens = title ? title.querySelector('.hero-glass-lens') : null;
  if (!title || !text || !lens || !finePointer.matches) return;

  const pointer = { x: -9999, y: -9999, active: false };
  const state = { x: 0, y: 0, strength: 0 };
  let frame = 0;

  function distanceToRect(x, y, rect) {
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.hypot(dx, dy);
  }

  function render() {
    frame = 0;
    const titleRect = title.getBoundingClientRect();
    const textRect = text.getBoundingClientRect();
    const proximity = pointer.active
      ? Math.max(0, 1 - distanceToRect(pointer.x, pointer.y, textRect) / 150)
      : 0;
    const targetX = pointer.x - titleRect.left;
    const targetY = pointer.y - titleRect.top;
    const smoothing = reducedMotion.matches ? 1 : 0.2;

    state.x += (targetX - state.x) * smoothing;
    state.y += (targetY - state.y) * smoothing;
    state.strength += (proximity - state.strength) * smoothing;

    lens.style.left = `${state.x.toFixed(2)}px`;
    lens.style.top = `${state.y.toFixed(2)}px`;
    title.style.setProperty('--hero-lens-strength', state.strength.toFixed(3));
    // The title remains readable while becoming visibly translucent under the
    // pointer; the circular layer supplies the local blur and particle halo.
    title.style.setProperty('--hero-pointer-opacity', (1 - state.strength * 0.2).toFixed(3));

    if (Math.abs(state.strength - proximity) > 0.002 ||
        Math.abs(state.x - targetX) > 0.2 || Math.abs(state.y - targetY) > 0.2) {
      frame = requestAnimationFrame(render);
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    schedule();
  }, { passive: true });

  function deactivate() {
    pointer.active = false;
    schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('blur', deactivate);
  document.addEventListener('pointerleave', deactivate);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroLens, { once: true });
} else {
  initHeroLens();
}
