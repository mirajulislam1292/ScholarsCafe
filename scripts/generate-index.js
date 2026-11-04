import { cpSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Static hosting cannot issue per-request nonces, so allow exactly the inline scripts in this
// build by hash. Any injected or modified inline script is blocked by the browser.
function writeSecurityPolicy(clientDir, html) {
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .filter((body) => body.length > 0)
    .map((body) => `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  const turnstile = process.env.VITE_TURNSTILE_SITE_KEY ? " https://challenges.cloudflare.com" : "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}${turnstile}`,
    // React/motion set inline style attributes; styles cannot run code.
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: https:",
    "media-src 'self'",
    "connect-src 'self' https://admin.scholarscafe.com",
    `frame-src${turnstile || " 'none'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  const file = join(clientDir, ".htaccess");
  const template = readFileSync(file, "utf8");
  if (!template.includes("__CSP__"))
    throw new Error(".htaccess is missing the __CSP__ placeholder");
  writeFileSync(file, template.replace("__CSP__", csp));
  console.log(`[OK] Content-Security-Policy written with ${hashes.length} inline script hash(es)`);
}

async function generateIndexHtml() {
  const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
  const clientDir = join(distDir, "client");
  const serverEntryPath = join(distDir, "server", "index.js");
  const serverEntry = await import(pathToFileURL(serverEntryPath).href);
  const response = await serverEntry.default.fetch(new Request("https://example.com/"));

  if (!response.ok) {
    throw new Error(`SSR render failed with status ${response.status}`);
  }

  // Literal NUL characters in serialized route IDs are replaced by the HTML parser.
  // Preserve the JavaScript string value with an escape, so hydration IDs still match.
  const html = (await response.text()).replace(/\u0000/g, "\\u0000");
  if (!html.includes('id="top"') || !html.includes('id="programs"')) {
    throw new Error("SSR did not produce the home page; refusing to publish an error page");
  }
  writeFileSync(join(clientDir, "index.html"), html);
  writeSecurityPolicy(clientDir, html);

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
