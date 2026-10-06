// Rendu image par image de index.html → MP4 1080×1920 30 i/s, mixé avec la bande son.
// Usage : node render.mjs <sound.wav> <out.mp4> [variante]   (variante « dm » : carte de fin Instagram Direct)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
const [wav, out, variant] = process.argv.slice(2);
const FPS = 30;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/index.html' + (variant ? `?v=${variant}` : ''));
await p.evaluate(() => window.ready);
const dur = await p.evaluate(() => window.TIMELINE.dur);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-i', wav, '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(dur * FPS);
for (let f = 0; f < total; f++) {
  await p.evaluate(t => seek(t), f / FPS);
  const buf = await p.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 90 === 0) console.log(`frame ${f}/${total}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await b.close();
console.log('done', out);
