import { test, expect } from '@playwright/test';
test('responsive portfolio, navigation, form and reduced motion', async ({ page }) => {
 const issues: string[]=[];
 page.on('pageerror',e=>issues.push(e.message));
 page.on('console',m=>{if(['warning','error'].includes(m.type()))issues.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)issues.push(`${r.status()} ${r.url()}`)});
 for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByRole('heading',{name:'YOUR NAME',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.locator('footer').scrollIntoViewIfNeeded();await page.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>{img.loading='eager';return img.decode()}))});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`docs/inhabited/screenshot-${width}.png`,fullPage:true});
  if(width===1440 || width===390) await page.screenshot({path:`docs/inhabited/hero-${width}.png`});
  const contentOverflow=await page.locator('.hero-paper,.project-card,.inventory,.contact-paper,.navigation').evaluateAll(elements=>elements.some(el=>{const box=el.getBoundingClientRect();return box.left < 0 || box.right > innerWidth}));expect(contentOverflow).toBeFalsy();
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await page.getByRole('navigation').getByRole('link',{name:'Projects'}).click();
 await expect(page).toHaveURL(/#projects$/);
 await expect(page.getByRole('navigation').getByRole('link',{name:'Projects'})).toHaveAttribute('aria-current','location');
 await page.getByRole('navigation').getByRole('link',{name:'Skills'}).click();
 await expect(page.getByRole('navigation').getByRole('link',{name:'Skills'})).toHaveAttribute('aria-current','location');
 await page.getByRole('navigation').getByRole('link',{name:'Contact'}).click();
 await page.getByLabel('Name',{exact:true}).fill('Test Visitor');await page.getByLabel('Email',{exact:true}).fill('visitor@example.com');await page.getByLabel('Message',{exact:true}).fill('A useful new project.');await page.getByRole('button',{name:'Send Message'}).click();await expect(page.getByRole('status')).toContainText('nothing has been sent');
 await page.getByRole('button',{name:'Pause decorative animations'}).click();expect(await page.locator('.animated-sprite').first().evaluate(e=>getComputedStyle(e).animationPlayState)).toBe('paused');
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.animated-sprite').first().evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
 await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');
 await page.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>{img.loading='eager';return img.decode()}))});expect(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete && i.naturalWidth>0))).toBeTruthy();
 expect(issues).toEqual([]);
});
