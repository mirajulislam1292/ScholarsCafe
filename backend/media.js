import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import express from 'express';
import { canPublish } from './security.js';

const fail = (status, message) => Object.assign(new Error(message), { status });
export function installMedia(app, store, config, limit) {
  // Registered after authentication and CSRF verification. No untrusted file paths.
  app.get('/api/media', async (_req, res) => {
    const items = await store.query('SELECT id,name,size,created_at FROM media ORDER BY created_at DESC LIMIT 200');
    res.json({ items: items.map(item => ({ ...item, url: config.ADMIN_ORIGIN + '/public/media/' + item.id })) });
  });
  app.post('/api/media', (req, _res, next) => {
    if (!canPublish(req.actor.role)) throw fail(403, 'Only owners and admins can upload images.');
    if (!/^image\/(png|jpeg|webp)$/.test(req.get('Content-Type') || '')) throw fail(415, 'Choose a PNG, JPEG or WebP image.');
    next();
  }, limit, express.raw({ type: ['image/png', 'image/jpeg', 'image/webp'], limit: '5mb' }), async (req, res) => {
    if (!Buffer.isBuffer(req.body) || !req.body.length) throw fail(400, 'Choose an image.');
    let bytes;
    try {
      const image = sharp(req.body, { limitInputPixels: 16000000, animated: false, failOn: 'warning' });
      const info = await image.metadata();
      if (!['png', 'jpeg', 'webp'].includes(info.format) || (info.pages || 1) > 1) throw Error('format');
      // Re-encode and remove metadata; never serve the original upload.
      bytes = await image.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    } catch { throw fail(415, 'The image could not be read. Use a static PNG, JPEG or WebP under 16 megapixels.'); }
    if (bytes.length > 4 * 1024 * 1024) throw fail(413, 'Please choose a smaller image.');
    const id = randomUUID();
    const name = String(req.get('X-File-Name') || 'Image').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);
    await store.transaction(async c => {
      const [actor] = await store.query('SELECT role,active FROM users WHERE id=? FOR UPDATE', [req.actor.id], c);
      if (!actor?.active || !canPublish(actor.role)) throw fail(403, 'Upload access was removed.');
      // A single locked quota row serializes concurrent uploads across all admins.
      const [quota] = await store.query('SELECT used_bytes FROM media_quota WHERE id=1 FOR UPDATE', [], c);
      if (!quota || Number(quota.used_bytes) + bytes.length > 100 * 1024 * 1024) throw fail(413, 'The 100 MB media library is full.');
      await store.query('INSERT INTO media (id,name,bytes,size,actor_id) VALUES (?,?,?,?,?)', [id,name,bytes,bytes.length,req.actor.id], c);
      await store.query('UPDATE media_quota SET used_bytes=used_bytes+? WHERE id=1', [bytes.length], c);
      await store.audit(req.actor.id, 'upload_image', id, c);
    });
    res.status(201).json({ id, url: config.ADMIN_ORIGIN + '/public/media/' + id });
  });
}

export function serveMedia(app, store) {
  app.get('/public/media/:id', async (req, res) => {
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(req.params.id)) throw fail(404, 'Image not found.');
    const [image] = await store.query('SELECT bytes FROM media WHERE id=?', [req.params.id]);
    if (!image) throw fail(404, 'Image not found.');
    res.set({ 'Content-Type': 'image/webp', 'Cache-Control': 'public,max-age=31536000,immutable', 'Cross-Origin-Resource-Policy': 'cross-origin', 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' }).send(image.bytes);
  });
}
