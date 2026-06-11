# Scripts

## prerender.mjs

Pre-renders key pages of the Red Dirt Blooms React SPA to static HTML so Google and AI crawlers can index real content.

### Why this matters

React SPAs serve an empty `<div id="root"></div>` to crawlers. Googlebot eventually executes JavaScript, but it's slower and less reliable than serving pre-rendered HTML. This script fixes that.

### How to run

```bash
# Build the app first, then pre-render
pnpm build:full

# Or run prerender separately after a build
pnpm prerender
```

### What it does

1. Spins up a local static server on port 3099 serving `dist/client/`
2. Uses Puppeteer (headless Chrome) to visit each route and wait for React to hydrate
3. Saves the rendered HTML to `dist/client/<route>/index.html`

### Routes pre-rendered

- `/` — Homepage
- `/harvest-stand` — Shop
- `/bloom-diary` — Bloom Diary
- `/whats-in-the-ground` — What's in the Ground
- `/roots-and-story` — Farm Story
- `/come-find-us` — Contact / Location
- `/bouquet-bar` — Bouquet Bar
- `/florist-portal` — Florist Wholesale

### Adding new routes

Edit the `ROUTES` array in `scripts/prerender.mjs` and add the new path.

### Requirements

- `puppeteer` and `serve-handler` must be installed (already in devDependencies)
- Run `pnpm build` before `pnpm prerender`
