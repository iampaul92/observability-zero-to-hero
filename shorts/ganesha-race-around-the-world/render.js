// Renders scene.html to video frames with headless Chromium, piping JPEGs into ffmpeg.
//   node render.js preview 4.5 12 30   -> writes preview PNG contact sheet of given times
//   node render.js video out.mp4 [workers]
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const page_url = 'file://' + path.join(__dirname, 'scene.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  await page.goto(page_url);
  await page.evaluate(() => window.ready);
  return page;
}

async function renderRange(browser, f0, f1, outFile) {
  const page = await openPage(browser);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    const url = await page.evaluate(t => window.frame(t, 0.93), f / FPS);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 150 === 0) console.log(`${outFile}: frame ${f}/${f1}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await page.close();
}

(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const browser = await chromium.launch();
  if (mode === 'preview') {
    const page = await openPage(browser);
    const dir = fs.mkdtempSync('/tmp/prev-');
    for (const t of args.map(Number)) {
      const url = await page.evaluate(t => window.frame(t, 0.9), t);
      fs.writeFileSync(path.join(dir, `t${String(t).padStart(6, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
    }
    console.log(dir);
  } else {
    const out = args[0] || 'video.mp4';
    const workers = Number(args[1] || 3);
    const total = Math.round((await (await openPage(browser)).evaluate(() => window.DURATION)) * FPS);
    const per = Math.ceil(total / workers);
    const parts = [];
    await Promise.all(Array.from({ length: workers }, (_, i) => {
      const file = `/tmp/part${i}.mp4`; parts.push(file);
      return renderRange(browser, i * per, Math.min(total, (i + 1) * per), file);
    }));
    fs.writeFileSync('/tmp/parts.txt', parts.map(p => `file '${p}'`).join('\n'));
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', '/tmp/parts.txt', '-c', 'copy', out]);
    console.log('wrote', out);
  }
  await browser.close();
})();
