import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/index.html');
await p.evaluate(() => window.ready);
for (const t of times) { await p.evaluate(t => seek(t), t); await p.screenshot({ path: `/tmp/claude-0/-home-user-Resa/a34a3508-7658-5350-a34c-d8e6422f7182/scratchpad/st-${t}.png` }); }
await b.close();
