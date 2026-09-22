import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import sharp from 'sharp';
import { createApp } from './app.js';
const config={ADMIN_ORIGIN:'https://admin.scholarscafe.com',PUBLIC_ORIGIN:'https://scholarscafe.com',GOOGLE_CLIENT_ID:'test'};
const cookie='__Host-sc_session='+'a'.repeat(64);
function setup(role='owner', active=1,used=0) {
  let saved;
  const store={session:async()=>({id:'1',role,csrf:'test-csrf'}),transaction:fn=>fn({}),audit:async()=>{},query:async(sql,args)=>{
    if(sql.startsWith('SELECT role,active'))return[{role,active}];
    if(sql.startsWith('SELECT used_bytes'))return[{used_bytes:used}];
    if(sql.startsWith('INSERT INTO media ')){saved=args;return{};}
    if(sql.startsWith('UPDATE media_quota'))return{};
    if(sql.startsWith('SELECT bytes'))return saved?[{bytes:saved[2]}]:[];
    throw Error('Unexpected SQL');
  }};
  const app=createApp(store,config);
  const send=()=>request(app).post('/api/media').set('Cookie',cookie).set('Origin',config.ADMIN_ORIGIN).set('X-CSRF-Token','test-csrf');
  return{app,send,saved:()=>saved};
}
test('Media writes require authentication, admin role, correct origin and CSRF',async()=>{
  const {app}=setup();
  await request(app).post('/api/media').set('Content-Type','image/png').send(Buffer.from('x')).expect(401);
  await request(app).post('/api/media').set('Cookie',cookie).set('Origin','https://evil.example').set('X-CSRF-Token','test-csrf').send({}).expect(403);
  await request(app).post('/api/media').set('Cookie',cookie).set('Origin',config.ADMIN_ORIGIN).send({}).expect(403);
  await setup('editor').send().set('Content-Type','image/png').send(Buffer.from('x')).expect(403);
});
test('Rejects SVG, spoofed images and oversized uploads without writing',async()=>{
  const {send,saved}=setup();
  await send().set('Content-Type','image/svg+xml').send('<svg/>').expect(415);
  await send().set('Content-Type','image/png').send(Buffer.from('<script>bad</script>')).expect(415);
  await send().set('Content-Type','image/png').send(Buffer.alloc(5*1024*1024+1)).expect(413);
  assert.equal(saved(),undefined);
});
test('Re-encodes uploads, strips metadata and serves only a generated public image URL',async()=>{
  const {app,send,saved}=setup();
  const input=await sharp({create:{width:32,height:32,channels:3,background:'#1b5988'}}).png().withMetadata().toBuffer();
  const response=await send().set('Content-Type','image/png').set('X-File-Name','logo.png').send(input).expect(201);
  assert.match(response.body.url,/^https:\/\/admin.scholarscafe.com\/public\/media\/[a-f0-9-]+$/);
  const info=await sharp(saved()[2]).metadata();assert.equal(info.format,'webp');assert.equal(info.exif,undefined);
  const publicImage=await request(app).get(new URL(response.body.url).pathname).expect(200).expect('Content-Type',/image\/webp/);
  assert.equal(publicImage.headers['cross-origin-resource-policy'],'cross-origin');
  await request(app).get('/public/media/not-a-uuid').expect(404);
});
test('Quota and revoked access are checked transactionally',async()=>{
  const input=await sharp({create:{width:2,height:2,channels:3,background:'blue'}}).png().toBuffer();
  await setup('owner',0).send().set('Content-Type','image/png').send(input).expect(403);
  await setup('owner',1,100*1024*1024).send().set('Content-Type','image/png').send(input).expect(413);
});
