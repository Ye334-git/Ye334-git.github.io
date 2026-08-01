/* ==========================================
   Project Card Renderer
   ========================================== */

import { PROJECTS } from './projects.js';

function createCard(project) {
  const card = document.createElement('article');
  card.className = 'card';
  card.style.setProperty('--card-accent', project.accent || 'var(--cyan)');

  card.innerHTML = `
    <div class="card-header">
      <h3 class="card-name">${escapeHtml(project.name)}</h3>
      <span class="card-meta">${escapeHtml(project.size)} &middot; ${escapeHtml(project.year)}</span>
    </div>
    <p class="card-tagline">${escapeHtml(project.tagline)}</p>
    <p class="card-desc">${escapeHtml(project.description)}</p>
    <div class="card-chips">
      ${project.builtWith.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
    </div>
    <a class="card-link" href="${escapeHtml(project.links.repo)}" target="_blank" rel="noopener">
      <span class="card-link-icon">&rarr;</span> View on GitHub
    </a>
  `;

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

export function renderCards() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;
  PROJECTS.forEach((project, i) => {
    const card = createCard(project);
    // Stagger reveal
    card.setAttribute('data-reveal', '');
    card.style.transitionDelay = `${i * 0.08}s`;
    grid.appendChild(card);
  });
}
