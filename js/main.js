/* ==========================================
   Main — glitch typewriter, scroll reveal, footer year
   ========================================== */

import './particles.js';
import { renderCards } from './cards.js';

/* ---------- Scroll Reveal ---------- */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ---------- Glitch Typewriter ---------- */
function initTypewriter() {
  const el = document.querySelector('.glitch');
  if (!el) return;
  const fullText = el.textContent;
  const dataText = el.getAttribute('data-text');
  if (!dataText || dataText.length === 0) {
    el.setAttribute('data-text', fullText);
  }
}

/* ---------- Footer Year ---------- */
function initFooter() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Start ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  initReveal();
  initTypewriter();
  initFooter();
});
