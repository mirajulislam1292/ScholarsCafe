import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Static hosting cannot issue per-request nonces, so allow exactly the inline scripts in this
// build by hash. Any injected or modified inline script is blocked by the browser.
function writeSecurityPolicy(clientDir, html) {
  const hashes = [
    ...html.matchAll(
      /<script(?![^>]*\bsrc=)(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ]
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
    // The student portal: "Save to My List" on /colleges (backend/my-list.js).
    "connect-src 'self' https://admin.scholarscafe.com https://student.scholarscafe.com",
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
    "/colleges": "0.8",
  };
  for (const p of pages) if (p.startsWith("/resources/blog/")) weight[p] = "0.7";
  const urls = pages
    .filter((p) => !p.startsWith("/forms/") && !p.startsWith("/sign/"))
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

// Pre-render with the admin's published content as it is right now, so the pages ship the current
// text (not the built-in defaults that the live content would then replace on screen). If the admin
// can't be reached the build still works: pages then wait briefly for the live content in the browser.
async function bakeLiveContent() {
  const endpoint = process.env.VITE_CONTENT_API || "https://admin.scholarscafe.com";
  try {
    const r = await fetch(endpoint + "/public/content", { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const { items } = await r.json();
    if (!Array.isArray(items)) throw new Error("no items");
    globalThis.__SC_CONTENT__ = items;
    console.log(`[OK] Baked ${items.length} live content items into the pages`);
  } catch (error) {
    console.warn(
      `[WARN] Live content not baked in (${error.message}); pages use built-in text until it loads`,
    );
  }
}

async function generateIndexHtml() {
  const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
  const clientDir = join(distDir, "client");
  const serverEntryPath = join(distDir, "server", "index.js");
  const serverEntry = await import(pathToFileURL(serverEntryPath).href);
  await bakeLiveContent();
  // Pre-render every page so each URL ships its own HTML (fast first paint, correct SEO).
  // Paths must match routes in src/routes. Each page goes to <path>/index.html.
  const pages = [
    "/",
    "/about",
    "/programs",
    "/services",
    "/resources",
    "/resources/blog",
    "/resources/eca",
    "/resources/webinars",
    "/resources/podcast",
    // Essay tools: core values, activity list, supplemental prompt bank (all client-side).
    "/resources/tools",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/links",
    // Book a 1-on-1 mentor session (open times load in the browser).
    "/book",
    // List of every live form (the forms themselves load in the browser).
    "/forms",
    // Shell for every form: .htaccess serves it at /forms/<slug>; the form loads in the browser.
    "/forms/_",
    // Shell for every agreement link: .htaccess serves it at /sign/<token> (noindex, nothing pre-rendered
    // per token); the agreement loads in the browser after the identity check.
    "/sign/_",
  ];
  // One international-student brief per US state (src/data/state-universities.ts).
  const stateData = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "src/data/state-universities.ts"),
    "utf8",
  );
  const stateSlugs = [...stateData.matchAll(/^\s*"?slug"?: "([a-z-]+)",$/gm)].map((m) => m[1]);
  if (stateSlugs.length !== 50)
    throw new Error(`Expected 50 state pages, found ${stateSlugs.length}`);
  pages.push(...stateSlugs.map((slug) => `/universities/${slug}`));
  // College directory (src/data/college-directory.ts), plus colleges added in the admin
  // (published "colleges" entries baked in above). Hidden ones are skipped.
  const collegeData = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "src/data/college-directory.ts"),
    "utf8",
  );
  const collegeSlugs = new Set(
    [...collegeData.matchAll(/^\s*"?slug"?: "([a-z0-9-]+)",$/gm)].map((m) => m[1]),
  );
  for (const item of globalThis.__SC_CONTENT__ || []) {
    if (item.kind !== "colleges" || typeof item.data?.slug !== "string") continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.data.slug)) continue;
    if (item.data.hidden === true) collegeSlugs.delete(item.data.slug);
    else collegeSlugs.add(item.data.slug);
  }
  pages.push("/colleges", ...[...collegeSlugs].map((slug) => `/colleges/${slug}`));
  // Long-form guides (src/data/guides.ts), one page each under the blog.
  const guideData = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "src/data/guides.ts"),
    "utf8",
  );
  const guideSlugs = [...guideData.matchAll(/^\s*slug: "([a-z0-9-]+)",$/gm)].map((m) => m[1]);
  if (!guideSlugs.length) throw new Error("No guides found in src/data/guides.ts");
  pages.push(...guideSlugs.map((slug) => `/resources/blog/${slug}`));
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
  // The "page not found" page. .htaccess serves it with a real 404 status for unknown addresses, so
  // search engines drop dead links instead of indexing them as copies of the home page.
  const missing = await serverEntry.default.fetch(new Request("https://example.com/404"));
  if (missing.status !== 404)
    throw new Error(`Expected the not-found page to render with 404, got ${missing.status}`);
  const notFoundHtml = (await missing.text())
    .replace(/\u0000/g, "\\u0000")
    .replace(
      "</head>",
      '<title>Page not found | Scholars Cafe</title><meta name="robots" content="noindex"/></head>',
    );
  if (!notFoundHtml.includes("Page not found</h2>"))
    throw new Error("Not-found page did not render its message");
  writeFileSync(join(clientDir, "404.html"), notFoundHtml);
  rendered.push(notFoundHtml);
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
