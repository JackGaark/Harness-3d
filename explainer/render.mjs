// Renders index.html to an mp4 by stepping the timeline frame by frame.
//   node render.mjs                 full render to ../harness-engineering-full-paper.mp4
//   node render.mjs --stills 3,40   write PNG stills at the given seconds into frames/
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, W = 1920, H = 1080, WORKERS = 5;
const OUT = path.join(here, '..', 'harness-engineering-full-paper.mp4');
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'].find(existsSync);
// The page is ES modules, which browsers refuse over file://, so serve it with Vite while rendering.
const server = await createServer({ root: here, logLevel: 'silent', server: { port: 0, hmr: false } });
await server.listen();
const url = server.resolvedUrls.local[0] + '#render';
const frames = path.join(here, 'frames');

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.goto(url);
  const duration = await page.evaluate(() => window.ready);
  return { page, duration };
}

const browser = await chromium.launch({ executablePath: CHROME });
mkdirSync(frames, { recursive: true });

const stills = process.argv.indexOf('--stills');
if (stills > 0) {
  const { page, duration } = await open(browser);
  console.log('duration', duration.toFixed(1), 's');
  const arg = process.argv[stills + 1];
  // "pages" = one still per page, taken just before its last passage ends
  const times = arg === 'pages' ? await page.evaluate(() => PAGES.map(p => +((p.pass.length ? p.pass.at(-1).e : p.t1) - 0.2).toFixed(2))) : arg.split(',').map(Number);
  for (const t of times) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: path.join(frames, `still-${String(Math.round(t)).padStart(4, '0')}.png`) });
  }
  await browser.close();
  await server.close();
  process.exit();
}

const first = await open(browser);
const total = Math.ceil(first.duration * FPS);
console.log(`${first.duration.toFixed(1)} s, ${total} frames`);
await first.page.close();

// Each worker renders a contiguous slice to its own segment; ffmpeg joins them without re-encoding.
const slice = Math.ceil(total / WORKERS);
const segs = [];
let done = 0;
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const seg = path.join(frames, `seg-${w}.mp4`);
  segs.push([w, seg]);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error(`ffmpeg exited ${c}`)) : res()));
  const own = await chromium.launch({ executablePath: CHROME });
  const { page } = await open(own);
  for (let f = w * slice; f < Math.min(total, (w + 1) * slice); f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const png = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    if (++done % 600 === 0) console.log(`${done}/${total}`);
  }
  ff.stdin.end();
  await Promise.all([closed, own.close()]);
}));
await browser.close();

const list = path.join(frames, 'segments.txt');
writeFileSync(list, segs.sort((a, b) => a[0] - b[0]).map(([, s]) => `file '${s}'`).join('\n'));
const cat = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
await new Promise((res, rej) => cat.on('close', c => c ? rej(new Error(`concat exited ${c}`)) : res()));
for (const [, s] of segs) rmSync(s);
rmSync(list);
await server.close();
console.log('wrote', OUT);
