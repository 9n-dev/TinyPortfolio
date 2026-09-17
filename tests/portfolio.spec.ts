import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Fails the test on any console warning/error, page error or failed request. */
function watch(page: Page) {
  const issues: string[] = [];
  page.on('pageerror', error => issues.push(error.message));
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) issues.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) issues.push(`${response.status()} ${response.url()}`); });
  return issues;
}
const nav = (page: Page, name: string) => page.getByRole('navigation').getByRole('link', { name, exact: true });
const canvas = (page: Page) => page.locator('canvas.world-canvas');
const ready = (page: Page) => page.waitForFunction(() => (window as any).__world && document.fonts.status === 'loaded');

for (const width of [1728, 1440, 1024, 768, 390, 320]) test(`layout holds at ${width}px`, async ({ page }) => {
  const issues = watch(page);
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await ready(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Manuel Allegue', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const outside = await page.locator('.hero-paper, .about-paper, .project-card, .inventory, .contact-paper, .navigation')
    .evaluateAll(elements => elements.filter(el => { const box = el.getBoundingClientRect(); return box.left < 0 || box.right > innerWidth; }).map(el => el.className));
  expect(outside).toEqual([]);
  await page.locator('footer').scrollIntoViewIfNeeded();
  expect(await page.locator('img').evaluateAll(images => Promise.all(images.map(async image => {
    (image as HTMLImageElement).loading = 'eager';
    await (image as HTMLImageElement).decode();
    return (image as HTMLImageElement).naturalWidth > 0;
  })))).not.toContain(false);
  expect(issues).toEqual([]);
});

test('navigation marks the section in view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const name of ['About', 'Projects', 'Skills', 'Contact']) {
    await nav(page, name).click();
    await expect(page).toHaveURL(new RegExp(`#${name.toLowerCase()}$`));
    await expect(nav(page, name)).toHaveAttribute('aria-current', 'location');
  }
});

// The form service is always mocked: tests must never send real mail.
test('contact form validates, posts the message as JSON and confirms', async ({ page }) => {
  const posted: unknown[] = [];
  await page.route('https://formspree.io/**', route => { posted.push(route.request().postDataJSON()); return route.fulfill({ status: 200, json: { ok: true } }); });
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('.form-status')).toHaveText('');   // native validation stopped it
  expect(posted).toEqual([]);
  await page.getByLabel('Name', { exact: true }).fill('Test Visitor');
  await page.getByLabel('Email', { exact: true }).fill('visitor@example.com');
  await page.getByLabel('Message', { exact: true }).fill('A useful new project.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('status')).toContainText('has been sent');
  expect(posted).toEqual([{ name: 'Test Visitor', email: 'visitor@example.com', message: 'A useful new project.' }]);
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('');
});

test('contact form keeps the message and says so when the service fails', async ({ page }) => {
  await page.route('https://formspree.io/**', route => route.fulfill({ status: 500, json: { error: 'down' } }));
  await page.goto('/#contact');
  await page.getByLabel('Name', { exact: true }).fill('Test Visitor');
  await page.getByLabel('Email', { exact: true }).fill('visitor@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Still here.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('status')).toContainText('could not be sent');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Still here.');
});

test('the world is painted and moves', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await ready(page);
  await page.waitForTimeout(500);
  const first = await page.screenshot();
  await page.waitForTimeout(1000);
  expect((await page.screenshot()).equals(first)).toBe(false);
  // Painted means more than the grass colour: sample the canvas for water, roofs, units…
  const colours = await canvas(page).evaluate((element: HTMLCanvasElement) => {
    const { data } = element.getContext('2d')!.getImageData(0, 0, element.width, element.height);
    const seen = new Set<number>();
    for (let i = 0; i < data.length; i += 4 * 97) seen.add((data[i] >> 4 << 8) | (data[i + 1] >> 4 << 4) | data[i + 2] >> 4);
    return seen.size;
  });
  expect(colours).toBeGreaterThan(50);
});

for (const [width, height] of [[1440, 900], [390, 844]]) test(`the canvas scrolls with the page and always covers the screen at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await ready(page);
  // Scrolling natively with the content is what keeps the background from juddering on phones.
  expect(await canvas(page).evaluate(element => getComputedStyle(element).position)).toBe('absolute');
  const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const top of [0, 700, 2500, end]) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), top);
    await page.waitForTimeout(200);
    const box = await canvas(page).evaluate(element => { const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, screen: innerHeight }; });
    expect(box.top).toBeLessThanOrEqual(0);
    expect(box.bottom).toBeGreaterThanOrEqual(box.screen);
    // and there is spare canvas in the direction of travel, except at the ends of the page
    if (top > 400 && top < end - 400) { expect(box.top).toBeLessThan(-200); expect(box.bottom).toBeGreaterThan(box.screen + 200); }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion shows a still world that still follows the scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await ready(page);
  await page.waitForTimeout(800);
  const still = await page.screenshot();
  await page.waitForTimeout(1000);
  expect((await page.screenshot()).equals(still)).toBe(true);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(500);
  expect((await page.screenshot()).equals(still)).toBe(false);
});

test('language switch translates the page and is remembered', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(nav(page, 'Proyectos')).toBeVisible();
  await expect(page).toHaveTitle(/Desarrollador FullStack y Analista de datos/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { name: 'Sobre mí' })).toBeVisible();
});

test('a Spanish browser gets Spanish first', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await context.close();
});

test('keyboard: skip link first, focus is visible, primary button shows its pressed skin', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe('solid');
  const button = page.getByRole('link', { name: /View Projects/ });
  const cell = button.locator('.slice-c');
  const rest = await cell.evaluate(element => getComputedStyle(element).backgroundImage);
  await button.hover();
  await page.mouse.down();
  expect(await cell.evaluate(element => getComputedStyle(element).backgroundImage)).not.toBe(rest);
  await page.mouse.up();
});

test('a frame of the world costs little script time', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await ready(page);
  await page.waitForTimeout(4000);
  const costs: number[] = await page.evaluate(() => (window as any).__world.costs);
  const mean = costs.reduce((a, b) => a + b, 0) / costs.length, worst = Math.max(...costs.slice(10));
  console.log(`world frame: mean ${mean.toFixed(2)} ms, worst ${worst.toFixed(2)} ms over ${costs.length} frames`);
  expect(costs.length).toBeGreaterThan(60);
  expect(mean).toBeLessThan(4);
});
