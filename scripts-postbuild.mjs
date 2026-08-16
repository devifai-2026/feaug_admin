// Copy the built index.html to 404.html.
//
// This app uses BrowserRouter, so reloading /products/add asks the host for a
// file that does not exist. The correct fix is a rewrite rule (/* -> /index.html)
// but that is host configuration, and Render ignores Netlify-style _redirects.
// Static hosts serve 404.html for unknown paths, so making 404.html a copy of
// the app means the router boots and resolves the path itself — clean URLs, no
// dashboard setup. Remove this once a real rewrite rule is in place.
import { copyFileSync, existsSync } from 'fs';

const src = 'dist/index.html';
const dest = 'dist/404.html';

if (!existsSync(src)) {
  console.error(`postbuild: ${src} not found — did vite build run?`);
  process.exit(1);
}
copyFileSync(src, dest);
console.log(`postbuild: ${src} -> ${dest} (SPA deep-link fallback)`);
