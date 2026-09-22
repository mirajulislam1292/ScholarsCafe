import { cpSync, readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

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
