# Ye334-git.github.io

Personal portfolio site — live at [Ye334-git.github.io](https://Ye334-git.github.io).

## How to update

### Add or remove a project

Edit `js/projects.js` — add/remove an entry in the `PROJECTS` array:

```js
{
  id: "my-project",
  name: "Project Name",
  tagline: "One-line summary",
  description: "Full description.",
  builtWith: ["Tech1", "Tech2"],
  size: "~5,000 LOC",
  year: "2026",
  accent: "#00f0ff",
  links: { repo: "https://github.com/Ye334-git/my-repo" }
}
```

That's it — no other files need to change.

### Local preview

```bash
python -m http.server 8000
# Open http://localhost:8000
```

ES modules require a local HTTP server — opening `index.html` directly via `file://` won't work.

### Deploy

```bash
git add -A
git commit -m "Update portfolio"
git push origin main
```

GitHub Pages serves from the `main` branch root automatically.
