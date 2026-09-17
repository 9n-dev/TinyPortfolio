import { test, expect } from '@playwright/test';
import scenes from '../src/data/scenes/generated.json' with { type: 'json' };

test('first viewport composition and slate comparison', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', error => problems.push(error.message));
  page.on('response', response => { if (response.status() >= 400) problems.push(response.url()); });
  for (const [width, height] of [[1728, 864], [1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const hero = page.locator('.hero-paper');
    await expect(hero).toBeVisible();
    const bounds = await hero.boundingBox();
    if (width > 760) {
      expect(bounds!.width).toBeLessThanOrEqual(520);
      expect(bounds!.height).toBeLessThan(440);
      expect((await page.locator('.navigation').boundingBox())!.height).toBeLessThanOrEqual(76);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const obscuredText = await page.locator('.hero-paper h1, .hero-role, .hero-description, .nav-links a').evaluateAll(elements =>
      elements.some(element => {
        for (let parent: Element | null = element; parent; parent = parent.parentElement) {
          const css = getComputedStyle(parent);
          if (css.opacity !== '1' || css.filter !== 'none') return true;
        }
        return false;
      }));
    expect(obscuredText).toBeFalsy();
    await page.screenshot({ path: `docs/inhabited/hero-${width}x${height}.png` });
    if (width === 1728) {
      await hero.evaluate(element => {
        element.setAttribute('data-skin', 'slate');
        element.querySelector('.nine-slice')!.setAttribute('data-skin', 'slate');
        (element.querySelector('.hero-role span') as HTMLElement).style.color = 'var(--paper)';
      });
      await page.screenshot({ path: 'docs/inhabited/hero-slate-comparison.png' });
    }
  }
  expect(problems).toEqual([]);
});

test('clean reading surfaces and notice board across desktop and mobile', async ({ page }) => {
  for (const width of [1728, 390]) {
    await page.setViewportSize({ width, height: 864 });
    await page.goto('/');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.project-card')).toHaveCount(4);
    await expect(page.locator('.project-card img, .project-card .animated-sprite')).toHaveCount(0);
    const surfaces = page.locator('.hero-paper, .board-intro, .project-card > .pixel-panel, .inventory, .contact-paper, .footer-content, .nav-rail');
    expect(await surfaces.evaluateAll(elements => elements.every(element => {
      // Guard against the previous washed-out reading surfaces, including
      // ancestor opacity/filter and missing opaque fallback backgrounds.
      for (let parent: Element | null = element; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (style.opacity !== '1' || style.filter !== 'none') return false;
      }
      return getComputedStyle(element, '::before').backgroundColor === 'rgb(238, 225, 198)';
    }))).toBeTruthy();
    expect(await page.locator('.hero-description, .project-description, .skill-group p, .contact input').evaluateAll(elements =>
      elements.every(element => !getComputedStyle(element).fontFamily.includes('Pixelify')))).toBeTruthy();
    for (const section of ['projects', 'skills', 'contact']) {
      await page.locator(`#${section}`).screenshot({ path: `docs/inhabited/${section}-${width}.png`, style: '.navigation-wrap, .skip-link:not(:focus) { visibility: hidden; }' });
    }
    await page.locator('footer').screenshot({ path: `docs/inhabited/footer-${width}.png`, style: '.navigation-wrap, .skip-link:not(:focus) { visibility: hidden; }' });
  }
});

test('nine-slice corners, UI atlas variants and button states', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const primary = page.locator('.hero-actions .pixel-button').first();
  const corner = primary.locator('.slice-tl');
  expect(await corner.evaluate(el => getComputedStyle(el).backgroundImage)).toContain('/ui/button/tl.png');
  const normalCorner = await corner.boundingBox();
  await primary.hover();
  await page.mouse.down();
  expect(await corner.evaluate(el => getComputedStyle(el).backgroundImage)).toContain('/ui/button-pressed/tl.png');
  await primary.screenshot({ path: 'docs/inhabited/button-pressed.png' });
  expect((await corner.boundingBox())!.width).toBe(normalCorner!.width);
  await page.mouse.move(10, 100);
  await page.mouse.up();
  await primary.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(primary).toBeFocused();
  expect(await primary.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await primary.screenshot({ path: 'docs/inhabited/button-focus.png' });

  // A temporary browser-only fixture exercises every original UI skin at two
  // sizes. It is never shipped and does not add a component gallery to the app.
  await page.evaluate(() => {
    const fixture = document.createElement('div');
    fixture.id = 'ui-proof';
    fixture.style.cssText = 'position:fixed;inset:0;z-index:100;background:#85b156;padding:32px;display:grid;grid-template-columns:240px 480px;gap:24px;align-content:start';
    const template = document.querySelector('.hero-paper > .nine-slice')!;
    for (const skin of ['paper', 'slate', 'wood', 'scroll']) {
      for (const [index, width] of [240, 480].entries()) {
        const surface = document.createElement('div');
        surface.className = 'pixel-panel';
        surface.dataset.skin = skin;
        surface.dataset.proof = `${skin}-${index}`;
        surface.style.cssText = `width:${width}px;height:${index ? 176 : 112}px`;
        const slices = template.cloneNode(true) as HTMLElement;
        slices.dataset.skin = skin;
        surface.append(slices);
        fixture.append(surface);
      }
    }
    document.body.append(fixture);
  });
  await page.locator('#ui-proof').screenshot({ path: 'docs/inhabited/ui-nine-slice-proof.png' });
  for (const skin of ['paper', 'slate', 'wood', 'scroll']) {
    const small = page.locator(`[data-proof='${skin}-0'] .slice-tl`);
    const large = page.locator(`[data-proof='${skin}-1'] .slice-tl`);
    const a = await small.screenshot();
    const b = await large.screenshot();
    expect(a.equals(b), `${skin} corners must remain pixel-identical`).toBeTruthy();
  }
});

test('reserved world areas, complete inhabitants and vertical quest order', async ({ page }) => {
  for (const width of [1728, 1440, 1366, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => document.fonts.ready);
    const rows = await page.locator('.project-card').evaluateAll(elements => elements.map(el => {
      const { x, y, width, height } = el.getBoundingClientRect(); return { x, y, width, height };
    }));
    for (let index = 1; index < rows.length; index++) {
      expect(rows[index].x).toBe(rows[0].x);
      expect(rows[index].y).toBeGreaterThanOrEqual(rows[index - 1].y + rows[index - 1].height);
    }
    const problems = await page.evaluate(({ scenes, width }) => {
      const result: string[] = [];
      const intersects = (a: number[], b: number[]) => a[0] < b[0]+b[2] && a[0]+a[2] > b[0] && a[1] < b[1]+b[3] && a[1]+a[3] > b[1];
      for (const [region, variants] of Object.entries(scenes)) {
        const layout = width > 1439 ? 'desktop' : 'mobile';
        const layer = document.querySelector(`#${region} .scene-${layout}`)!.getBoundingClientRect();
        const surfaces = [...document.querySelectorAll(`#${region} .pixel-panel, #${region} .ribbon`)];
        for (const item of variants[layout].items) {
          const [x, y, w, h] = item.bounds;
          const rect = [layer.x + x, layer.y + y, w, h];
          for (const surface of surfaces) {
            const box = surface.getBoundingClientRect();
            if (intersects(rect, [box.x, box.y, box.width, box.height])) result.push(`${width}: ${region}/${item.id} intersects UI`);
          }
          if (['monk','archer','lancer','guard','villager','sheep'].includes(item.asset) && (rect[0] < 0 || rect[0]+w > width)) {
            result.push(`${width}: ${region}/${item.id} clipped inhabitant`);
          }
        }
      }
      return result;
    }, { scenes, width });
    expect(problems).toEqual([]);
  }
});
