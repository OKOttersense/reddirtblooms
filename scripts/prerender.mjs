/**
 * prerender.mjs
 * Pre-renders key pages of the Red Dirt Blooms React SPA to static HTML
 * so Google and AI crawlers can index real content instead of an empty root div.
 *
 * Usage: node scripts/prerender.mjs
 * Run after `pnpm build` — outputs pre-rendered HTML files into dist/
 *
 * How it works:
 * 1. Spins up a local server serving the built dist/
 * 2. Uses Puppeteer to visit each route and wait for content to render
 * 3. Saves the rendered HTML to dist/<route>/index.html
 * 4. The server then serves these static files for crawlers
 */

import puppeteer from "puppeteer";
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import handler from "serve-handler";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "../dist/client");
const PORT = 3099;

// Routes to pre-render — add any new public pages here
const ROUTES = [
  "/",
  "/harvest-stand",
  "/bloom-diary",
  "/whats-in-the-ground",
  "/roots-and-story",
  "/come-find-us",
  "/bouquet-bar",
  "/florist-portal",
];

async function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      handler(req, res, {
        public: DIST_DIR,
        rewrites: [{ source: "**", destination: "/index.html" }],
      });
    });
    server.listen(PORT, () => {
      console.log(`[prerender] Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerenderRoutes() {
  if (!existsSync(DIST_DIR)) {
    console.error("[prerender] dist/client not found — run pnpm build first");
    process.exit(1);
  }

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log(`[prerender] Pre-rendering ${ROUTES.length} routes...`);

  for (const route of ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Wait for React to hydrate — look for a content element
      await page.waitForSelector("main, #root > *", { timeout: 10000 }).catch(() => {
        console.warn(`[prerender] Warning: content selector not found for ${route}`);
      });

      const html = await page.content();

      // Write to dist/client/<route>/index.html
      const outputDir =
        route === "/" ? DIST_DIR : join(DIST_DIR, route.replace(/^\//, ""));
      mkdirSync(outputDir, { recursive: true });
      const outputPath = join(outputDir, "index.html");
      writeFileSync(outputPath, html, "utf-8");

      console.log(`[prerender] ✓ ${route} → ${outputPath.replace(DIST_DIR, "dist/client")}`);
    } catch (err) {
      console.error(`[prerender] ✗ Failed to render ${route}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log("[prerender] Done.");
}

prerenderRoutes().catch((err) => {
  console.error("[prerender] Fatal error:", err);
  process.exit(1);
});
