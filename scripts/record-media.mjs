// Records the README media from a running site into docs/media/: stills, and two GIFs cut with ffmpeg from one video.
//   node scripts/record-media.mjs [url]      (default: the published site; needs ffmpeg on PATH)
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const url = process.argv[2] ?? 'https://9n-dev.github.io/TinyPortfolio/';
const out = 'docs/media';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ready = page => page.waitForFunction(() => window.__world && document.fonts.status === 'loaded');
/** Scroll so the strip of world above a section fills the screen. */
const toStrip = (page, id, seconds = 0) => page.evaluate(([id, seconds]) => new Promise(done => {
  const strip = window.__world.world.placed.find(scene => scene.id === id);
  const scale = matchMedia('(max-width: 767px)').matches ? 0.5 : 1;
  const target = Math.max(0, (strip.row + strip.rows / 2) * 64 * scale - innerHeight * 0.42), from = scrollY, start = performance.now();
  if (!seconds) { scrollTo({ top: target, behavior: 'instant' }); return done(); }
  const tick = now => {
    const t = Math.min(1, (now - start) / (seconds * 1000)), eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    scrollTo({ top: from + (target - from) * eased, behavior: 'instant' });
    t < 1 ? requestAnimationFrame(tick) : done();
  };
  requestAnimationFrame(tick);
}), [id, seconds]);

// Stills
for (const [name, width, height, lang] of [['desktop', 1440, 900, 'ES'], ['mobile', 390, 844, 'ES']]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: name === 'mobile' ? 2 : 1 });
  await page.goto(url);
  await ready(page);
  await page.getByRole('button', { name: lang, exact: true }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-home.png` });
  for (const id of name === 'desktop' ? ['about', 'projects', 'skills', 'contact', 'shore'] : ['projects']) {
    await toStrip(page, id);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${name}-${id}.png` });
  }
  await page.close();
}

// Demo video: the hero, then a slow trip past the mine and the barracks.
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: out, size: { width: 1280, height: 720 } } });
const page = await context.newPage();
await page.goto(url);
await ready(page);
await page.getByRole('button', { name: 'ES', exact: true }).click();
await page.waitForTimeout(4000);
await toStrip(page, 'projects', 3); await page.waitForTimeout(3000);
await toStrip(page, 'skills', 3.5); await page.waitForTimeout(3500);
await toStrip(page, 'contact', 3); await page.waitForTimeout(2500);
const video = page.video();
await context.close();
await browser.close();
// Still camera only: a scrolling GIF of this page weighs 20 MB, a still one 3 MB.
const filter = 'fps=10,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle';
for (const [name, start, length] of [['demo-home', 2.2, 3.6], ['demo-skills', 16.2, 3.2]])
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(start), '-t', String(length), '-i', await video.path(), '-vf', filter, `${out}/${name}.gif`]);
rmSync(await video.path());
