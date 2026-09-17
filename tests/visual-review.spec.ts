import { test, expect } from '@playwright/test';
import { validate } from '../src/world/validate';

// Review captures, one per section and viewport. The canvas is fixed, so full-page captures cannot show the world:
// each capture is a viewport at the scroll position where the section's strip of world and its panel meet.
const out = process.env.SHOTS_DIR ?? 'docs/screenshots';
const viewports = [[1728, 864], [1440, 900], [1024, 768], [390, 844]] as const;
const only = process.env.SHOTS_WIDTH;

for (const [width, height] of viewports) if (!only || only === String(width)) test(`captures at ${width}×${height}`, async ({ page }) => {
  const problems: string[] = [];
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) problems.push(message.text()); });
  page.on('pageerror', error => problems.push(String(error)));
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.waitForFunction(() => (window as any).__world);
  await page.waitForTimeout(1500);
  for (const id of ['home', 'about', 'projects', 'skills', 'contact']) {
    await page.evaluate(([id, h]) => {
      const top = document.getElementById(id as string)!.getBoundingClientRect().top + scrollY;
      scrollTo({ top: id === 'home' ? 0 : top - (h as number) * 0.55, behavior: 'instant' });
    }, [id, height] as const);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${width}-${id}.png` });
  }
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${width}-shore.png` });
  const world = await page.evaluate(() => (window as any).__world.world);
  expect(validate(world)).toEqual([]);
  expect(problems).toEqual([]);
});
