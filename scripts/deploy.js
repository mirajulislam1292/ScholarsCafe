import { Client } from 'basic-ftp';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

// Load .env file
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PORT = parseInt(process.env.FTP_PORT || '21', 10);
const FTP_PASS = process.env.FTP_PASS || process.env.FTP_PASSWORD;
const RAW_REMOTE_DIR = process.env.FTP_DIR;
const LOCAL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'client');

function normalizeRemoteDir(remoteDir) {
  if (!remoteDir) return remoteDir;
  if (remoteDir === '/') return remoteDir;
  return remoteDir.replace(/\/+$/, '');
}

const REMOTE_DIR = normalizeRemoteDir(RAW_REMOTE_DIR);

if (!FTP_HOST) {
  console.error('[ERROR] FTP_HOST environment variable not set');
  process.exit(1);
}

if (!FTP_USER) {
  console.error('[ERROR] FTP_USER environment variable not set');
  process.exit(1);
}

if (!FTP_PASS) {
  console.error('[ERROR] FTP_PASS environment variable not set');
  process.exit(1);
}

if (!REMOTE_DIR) {
  console.error('[ERROR] FTP_DIR environment variable not set');
  process.exit(1);
}

const FTP_CONFIG = {
  host: FTP_HOST,
  user: FTP_USER,
  password: FTP_PASS,
  port: FTP_PORT,
};

async function generateIndexHtml(clientDir) {
  const serverEntryPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'server', 'index.js');
  const serverEntry = await import(pathToFileURL(serverEntryPath).href);
  const response = await serverEntry.default.fetch(new Request('https://example.com/'));
  if (!response.ok) throw new Error(`SSR render failed with status ${response.status}`);
  const html = (await response.text()).replaceAll('/assets/', './assets/');
  writeFileSync(join(clientDir, 'index.html'), html);
  console.log('[OK] Generated SSR index.html');
}

function createClient() {
  const client = new Client();
  client.ftp.verbose = false;
  // Extend socket timeout to 5 minutes to handle large file uploads
  client.ftp.socket.setTimeout(300000);
  return client;
}

async function connect(client) {
  await client.access(FTP_CONFIG);
}

// Delete a remote file silently (used to clean up orphaned .in. temp files)
async function tryDelete(client, remotePath) {
  try { await client.remove(remotePath); } catch (_) {}
}

function sortDeployFiles(files) {
  return [...files].sort((a, b) => {
    const aName = a.remotePath.split('/').pop();
    const bName = b.remotePath.split('/').pop();

    if (aName === '.htaccess') return -1;
    if (bName === '.htaccess') return 1;
    if (aName === 'index.html') return 1;
    if (bName === 'index.html') return -1;
    return a.remotePath.localeCompare(b.remotePath);
  });
}

// Upload a single file. On .in. temp conflict, clean up and retry with a fresh connection.
async function uploadFile(localFile, remoteFile, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const client = createClient();
    try {
      await connect(client);
      await client.uploadFrom(localFile, remoteFile);
      return; // success
    } catch (e) {
      const msg = e.message || '';
      const isTempFileConflict = msg.includes('.in.');

      if (isTempFileConflict) {
        console.log(`  [CLEANUP] Temp file conflict on ${remoteFile}`);
        // Try to clean up guessed temp path
        const dir = remoteFile.includes('/') ? remoteFile.substring(0, remoteFile.lastIndexOf('/')) : '';
        const base = remoteFile.includes('/') ? remoteFile.substring(remoteFile.lastIndexOf('/') + 1) : remoteFile;
        const tempPath = (dir ? dir + '/' : '') + '.in.' + base + '.';
        const cleanClient = createClient();
        try {
          await connect(cleanClient);
          await tryDelete(cleanClient, tempPath);
        } finally {
          cleanClient.close();
        }
      }

      if (attempt === retries) {
        throw new Error(`Failed to upload ${remoteFile} after ${retries} attempts: ${msg}`);
      }

      console.log(`  [RETRY ${attempt}/${retries}] ${remoteFile}`);
    } finally {
      client.close();
    }
  }
}

async function ensureDir(client, remotePath) {
  try {
    await client.send('MKD ' + remotePath);
  } catch (_) {
    // Ignore — directory likely already exists (550)
  }
}

async function collectFiles(localPath, remotePath, list = []) {
  const entries = readdirSync(localPath);

  // Collect directories
  const dirs = entries.filter(f => statSync(join(localPath, f)).isDirectory());
  for (const dir of dirs) {
    const rf = remotePath && remotePath !== '.' ? `${remotePath}/${dir}` : dir;
    list.push({ type: 'dir', remotePath: rf });
    await collectFiles(join(localPath, dir), rf, list);
  }

  // Collect files
  for (const file of entries) {
    const lf = join(localPath, file);
    const rf = remotePath && remotePath !== '.' ? `${remotePath}/${file}` : file;
    if (!statSync(lf).isDirectory()) {
      list.push({ type: 'file', localPath: lf, remotePath: rf });
    }
  }

  return list;
}

async function deploy() {
  try {
    await generateIndexHtml(LOCAL_DIR);

    console.log('[...] Connecting to Hostinger FTP...');

    // First pass: create all directories in the live folder using one connection
    const client = createClient();
    await connect(client);
    console.log(`[...] Creating remote directories at ${REMOTE_DIR}...`);
    const allItems = await collectFiles(LOCAL_DIR, REMOTE_DIR);
    const dirs = allItems.filter(i => i.type === 'dir');
    for (const d of dirs) {
      console.log(`  [DIR] ${d.remotePath}`);
      await ensureDir(client, d.remotePath);
    }
    client.close();

    // Second pass: upload each file directly into the live folder.
    // Upload .htaccess early and index.html last so Hostinger never serves a partial site.
    const files = sortDeployFiles(allItems.filter(i => i.type === 'file'));
    console.log(`[...] Uploading ${files.length} files to live folder...`);
    for (const f of files) {
      console.log(`  [UP] ${f.remotePath}`);
      await uploadFile(f.localPath, f.remotePath);
    }

    // Ensure common web permissions so Hostinger serves files (prevents 403 due to restrictive perms)
    try {
      console.log('[...] Fixing remote permissions (this may be slow)...');
      const permClient = createClient();
      await connect(permClient);
      for (const d of dirs) {
        try {
          await permClient.send(`SITE CHMOD 755 ${d.remotePath}`);
        } catch (_) {}
      }
      for (const f of files) {
        try {
          await permClient.send(`SITE CHMOD 644 ${f.remotePath}`);
        } catch (_) {}
      }
      permClient.close();
      console.log('[OK] Remote permissions updated (best-effort)');
    } catch (e) {
      console.log('[WARN] Could not update remote permissions:', e.message || e);
    }

    console.log('[OK] Deploy complete!');
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Deploy failed:', err.message);
    process.exit(1);
  }
}

deploy();
