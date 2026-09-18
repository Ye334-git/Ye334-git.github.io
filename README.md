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
node preview.mjs
# Open http://localhost:8000
```

This site is built from ES modules, so opening `index.html` directly via
`file://` will not work — the browser blocks module loading.

Do **not** use `python -m http.server`: it serves `.js` files as `text/plain`,
and browsers refuse to execute a module with the wrong MIME type. The symptom is
a page with no project cards and no particle background. `preview.mjs` exists to
serve the correct content types.

Use a different port if 8000 is taken:

```bash
$env:PORT=8123; node preview.mjs     # PowerShell
PORT=8123 node preview.mjs           # bash
```

### Deploy

```bash
git add -A
git commit -m "Update portfolio"
git push origin main
```

GitHub Pages serves from the `main` branch root automatically.
