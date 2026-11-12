import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Static hosting cannot issue per-request nonces, so allow exactly the inline scripts in this
// build by hash. Any injected or modified inline script is blocked by the browser.
function writeSecurityPolicy(clientDir, html) {
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .filter((body) => body.length > 0)
    .map((body) => `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`)
    .filter((hash, i, all) => all.indexOf(hash) === i);
  const turnstile = process.env.VITE_TURNSTILE_SITE_KEY ? " https://challenges.cloudflare.com" : "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}${turnstile}`,
    // React/motion set inline style attributes; styles cannot run code.
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: https:",
    "media-src 'self' https://admin.scholarscafe.com",
    "connect-src 'self' https://admin.scholarscafe.com",
    `frame-src${turnstile || " 'none'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Only the admin may show the site in a frame (the Super Admin's visual editor); no other site can.
    "frame-ancestors 'self' https://admin.scholarscafe.com",
    "upgrade-insecure-requests",
  ].join("; ");
  const file = join(clientDir, ".htaccess");
  const template = readFileSync(file, "utf8");
  if (!template.includes("__CSP__"))
    throw new Error(".htaccess is missing the __CSP__ placeholder");
  writeFileSync(file, template.replace("__CSP__", csp));
  console.log(`[OK] Content-Security-Policy written with ${hashes.length} inline script hash(es)`);
}

// sitemap.xml for search engines: every public page (not the form shell). Paths with a priority hint for
// the pages that matter most for search.
function writeSitemap(clientDir, pages) {
  const site = "https://scholarscafe.com";
  const today = new Date().toISOString().slice(0, 10);
  const weight = {
    "/": "1.0",
    "/programs": "0.9",
    "/services": "0.9",
    "/resources": "0.9",
    "/contact": "0.8",
  };
  const urls = pages
    .filter((p) => !p.startsWith("/forms/"))
    .map(
      (p) =>
        `  <url><loc>${site}${p === "/" ? "/" : p}</loc><lastmod>${today}</lastmod>` +
        `<priority>${weight[p] || (["/privacy", "/terms", "/cookies"].includes(p) ? "0.3" : "0.6")}</priority></url>`,
    );
  writeFileSync(
    join(clientDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
  );
  console.log(`[OK] sitemap.xml written with ${urls.length} pages`);
}

async function generateIndexHtml() {
  const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
  const clientDir = join(distDir, "client");
  const serverEntryPath = join(distDir, "server", "index.js");
  const serverEntry = await import(pathToFileURL(serverEntryPath).href);
  // Pre-render every page so each URL ships its own HTML (fast first paint, correct SEO).
  // Paths must match routes in src/routes. Each page goes to <path>/index.html.
  const pages = [
    "/",
    "/about",
    "/programs",
    "/services",
    "/resources",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/links",
    // Shell for every form: .htaccess serves it at /forms/<slug>; the form loads in the browser.
    "/forms/_",
  ];
  const rendered = [];
  for (const path of pages) {
    const response = await serverEntry.default.fetch(new Request("https://example.com" + path));
    if (!response.ok)
      throw new Error(`SSR render of ${path} failed with status ${response.status}`);
    // Literal NUL characters in serialized route IDs are replaced by the HTML parser.
    // Preserve the JavaScript string value with an escape, so hydration IDs still match.
    const html = (await response.text()).replace(/\u0000/g, "\\u0000");
    if (path === "/" && (!html.includes('id="top"') || !html.includes('id="destinations"'))) {
      throw new Error("SSR did not produce the home page; refusing to publish an error page");
    }
    const dir = path === "/" ? clientDir : join(clientDir, path.slice(1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html);
    rendered.push(html);
  }
  writeSecurityPolicy(clientDir, rendered.join("\n"));
  writeSitemap(clientDir, pages);
  console.log(`[OK] Pre-rendered ${pages.length} pages`);

  // Hostinger's native Git deploy serves the configured `dist` directory,
  // while the TanStack build emits browser assets under `dist/client`.
  // Mirror the client output into `dist` so both the native Git deploy and
  // the existing FTP workflow (which uploads `dist/client`) remain valid.
  for (const entry of readdirSync(clientDir)) {
    cpSync(join(clientDir, entry), join(distDir, entry), {
      recursive: true,
      force: true,
    });
  }

  console.log("[OK] Generated SSR index.html and prepared Hostinger output");
}

generateIndexHtml().catch((error) => {
  console.error("[ERROR] Failed to generate index.html:", error.message);
  process.exit(1);
});
