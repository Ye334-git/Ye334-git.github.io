/* ==========================================
   Hero heading → nav title, driven by scroll
   ------------------------------------------
   Scrolling down shrinks the hero heading up into the nav's pill; the pill and
   the frosted bar take over and stay put no matter how far down you go.
   Scrolling back up runs the whole thing in reverse, pulling the heading back
   down into the hero.

   The transform is applied to a clone so the original heading keeps its place
   in the hero layout — nothing below it ever shifts.
   ========================================== */

/* Self-starting: at the end of the body the DOM is already parsed, so run at
   once rather than waiting for DOMContentLoaded. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { try { initHeroCollapse(); } catch (e) { console.error(e); } });
} else {
  try { initHeroCollapse(); } catch (e) { console.error(e); }
}

export function initHeroCollapse() {
  const nav = document.querySelector('.nav');
  const title = document.querySelector('#hero .glitch');
  const heroText = title ? title.querySelector('.glitch-text') : null;
  const refName = document.querySelector('.nav-title-pill .nt-fly');
  const label = document.querySelector('.nav-title-pill .nt-label');
  const tagline = document.querySelector('.hero-tagline');
  const desc = document.querySelector('.hero-desc');
  const scrollCue = document.querySelector('.hero-scroll');
  if (!nav || !title || !heroText || !refName) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // The hand-over is deliberately kept inside the last tenth of the travel: the
  // heading only sits exactly on the pill's label at p = 1, so an earlier swap
  // would briefly show the two typefaces side by side.
  const FADE_FROM = 0.9;
  const FADE_TO = 1;
  let end = 420;
  let startTop = 0, startLeft = 0, endTop = 0, endLeft = 0, scale = 1;
  let clone = null;
  let pinned = null;           // remembered so the class is only touched on change

  /* ---------- Measuring the glyphs, not the boxes ----------
     An h1's client rect is its border box, which is much wider than the text it
     holds ("Yang Ye" fills 335px of a 466px box here). Landing a scaled clone by
     element rects therefore always misses; a Range gives the true text box. */
  function glyphBox(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const b = range.getBoundingClientRect();
    if (b.width > 0) return { top: b.top, left: b.left, width: b.width, height: b.height };
    const r = node.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }

  /* ---------- Measure once, and again whenever the layout changes ---------- */
  function measure() {
    const wasFlying = clone !== null;
    if (wasFlying) restore();
    nav.classList.remove('nav-pinned');

    const t = title.getBoundingClientRect();
    const h = glyphBox(heroText);
    const g = refName.getBoundingClientRect();
    startTop = t.top;
    startLeft = t.left;
    endTop = g.top;
    endLeft = g.left;
    // Text widths track font size linearly, so this lands the heading's glyphs on
    // exactly the pill's width at the moment of contact.
    scale = h.width > 0 ? Math.min(1, g.width / h.width) : 1;
    end = Math.max(200, Math.round(h.top - g.top));

    if (wasFlying) update();
  }

  /* ---------- Build / remove the flying copy ---------- */
  function toFlying() {
    clone = title.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clone.classList.add('hero-title-flying');
    clone.setAttribute('aria-hidden', 'true');
    title.parentNode.insertBefore(clone, title.nextSibling);
    title.style.visibility = 'hidden';
  }

  function restore() {
    if (clone) { clone.remove(); clone = null; }
    title.style.visibility = '';
    title.style.opacity = '';
    if (label) label.style.opacity = '';
    if (tagline) { tagline.style.opacity = ''; tagline.style.transform = ''; }
    if (desc) { desc.style.opacity = ''; desc.style.transform = ''; }
    if (scrollCue) scrollCue.style.opacity = '';
  }

  /* ---------- Where the clone actually sits when untransformed ----------
     Measured rather than assumed: the heading's client rect is not always the
     clone's layout origin, and guessing that offset is what put the landing in
     the wrong place. */
  function cloneBase() {
    const prev = clone.style.transform;
    clone.style.transform = 'none';
    const b = clone.getBoundingClientRect();
    clone.style.transform = prev;
    return { top: b.top, left: b.left };
  }

  /* ---------- The scroll mapping ----------
     Everything here works in viewport coordinates and re-reads the live
     positions each frame. Caching the heading's start position does not work:
     the heading travels up the viewport as the page scrolls, so a cached value
     leaves the clone lagging behind by exactly the scroll distance. */
  function update() {
    const y = window.scrollY || window.pageYOffset || 0;
    const raw = Math.min(1, Math.max(0, y / end));
    const p = reduced.matches ? (raw > 0.5 ? 1 : 0) : raw;

    // At rest the clone has nothing to do, so drop it and show the real heading.
    if (p <= 0) {
      if (clone) restore();
      if (tagline) { tagline.style.opacity = '1'; tagline.style.transform = 'translateY(0px)'; }
      if (desc) { desc.style.opacity = '1'; desc.style.transform = 'translateY(0px)'; }
      if (scrollCue) scrollCue.style.opacity = '1';
      title.style.setProperty('--glitch-fade', '1');
      if (pinned !== false) { pinned = false; nav.classList.remove('nav-pinned'); }
      return;
    }

    if (!clone) toFlying();

    const heroNow = glyphBox(heroText);
    const base = cloneBase();
    const x = heroNow.left + (endLeft - heroNow.left) * p;
    const ty = heroNow.top + (endTop - heroNow.top) * p;
    clone.style.transform =
      `translate(${(x - base.left).toFixed(2)}px, ${(ty - base.top).toFixed(2)}px) scale(${(1 + (scale - 1) * p).toFixed(4)})`;
    // Cross-fade into the pill's own label while the two are exactly on top of
    // each other, so the change of typeface happens invisibly.
    const fade = Math.min(1, Math.max(0, (p - FADE_FROM) / (FADE_TO - FADE_FROM)));
    clone.style.opacity = String(1 - fade);
    if (label) label.style.opacity = String(fade);

    // secondary hero copy leaves early so the heading travels alone
    const bleed = Math.min(1, p / 0.5);
    const lift = `${(-28 * bleed).toFixed(1)}px`;
    if (tagline) { tagline.style.opacity = String(1 - bleed); tagline.style.transform = `translateY(${lift})`; }
    if (desc) { desc.style.opacity = String(1 - bleed); desc.style.transform = `translateY(${lift})`; }
    if (scrollCue) scrollCue.style.opacity = String(1 - bleed);

    // glitch layers shrink out of the way as the heading closes in
    title.style.setProperty('--glitch-fade', String(1 - p));

    const nowPinned = p >= 1;
    if (nowPinned !== pinned) {
      pinned = nowPinned;
      nav.classList.toggle('nav-pinned', nowPinned);
    }
  }

  /* ---------- Wiring ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }

  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  }

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  reduced.addEventListener('change', () => { measure(); update(); });

  /* ---------- Debug handle ----------
     Handy from the console: __heroCollapse.state shows the measured geometry,
     and the class toggle can be tested with
     document.querySelector('.nav').classList.add('nav-pinned'). */
  window.__heroCollapse = {
    get state() {
      return {
        end, scale: +scale.toFixed(4),
        startTop: +startTop.toFixed(1), startLeft: +startLeft.toFixed(1),
        endTop: +endTop.toFixed(1), endLeft: +endLeft.toFixed(1),
        pinned, flying: !!clone,
      };
    },
    // Undisturbed clone position and the live heading position, side by side.
    probe() {
      if (!clone) return { error: 'no clone; scroll a little first' };
      const hero = heroText.getBoundingClientRect();
      return {
        cloneBase: cloneBase(),
        heroNow: { top: +hero.top.toFixed(1), left: +hero.left.toFixed(1), w: +hero.width.toFixed(1) },
        startTop: +startTop.toFixed(1), startLeft: +startLeft.toFixed(1),
        endTop: +endTop.toFixed(1), endLeft: +endLeft.toFixed(1),
        scrollY: Math.round(window.scrollY),
        cloneTransform: clone.style.transform,
        nameNow: (() => { const r = refName.getBoundingClientRect(); return { top: +r.top.toFixed(1), left: +r.left.toFixed(1), w: +r.width.toFixed(1) }; })(),
      };
    },
    measure, update,
  };
}
