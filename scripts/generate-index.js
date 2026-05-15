import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

async function generateIndexHtml() {
  const clientDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'client');
  const serverEntryPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'server', 'index.js');
  const serverEntry = await import(pathToFileURL(serverEntryPath).href);
  const response = await serverEntry.default.fetch(new Request('https://example.com/'));

  if (!response.ok) {
    throw new Error(`SSR render failed with status ${response.status}`);
  }

  const html = (await response.text()).replaceAll('/assets/', './assets/');
  writeFileSync(join(clientDir, 'index.html'), html);
  console.log('[OK] Generated SSR index.html');
}

generateIndexHtml().catch((error) => {
  console.error('[ERROR] Failed to generate index.html:', error.message);
  process.exit(1);
});