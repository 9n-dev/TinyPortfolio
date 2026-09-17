import { useEffect, useRef } from 'react';
import { compose } from './compose';
import type { SectionBox, World } from './compose';
import { spawn, step } from './entities';
import type { Entity } from './entities';
import { draw, loadImages } from './renderer';
import type { Images } from './renderer';
import { TILE } from './terrain';

/** Extra canvas above and below the viewport, in CSS pixels. A fling can outrun a frame or two of JavaScript;
 * what scrolls into view in the meantime is already painted. */
const OVERSCAN = 320;

/** The living world behind the page.
 * It reads where the sections really are, so the scenery fits any content height, language or width.
 *
 * The canvas is a little taller than the screen and is part of the page: the browser scrolls it together with the
 * panels on the compositor thread. Each frame it is slid back around the viewport and repainted for its new position.
 * (A fixed canvas repainted from scrollY visibly judders on phones, where scrolling does not wait for JavaScript.)
 */
export function WorldCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current!, ctx = element.getContext('2d')!;
    const page = element.parentElement!;
    const phone = matchMedia('(max-width: 767px)'), calm = matchMedia('(prefers-reduced-motion: reduce)');
    let images: Images | undefined, world: World | undefined, entities: Entity[] = [];
    let layout = '', time = 0, last = 0, painted = NaN, frame = 0, tallest = 0;
    const costs: number[] = [];   // ms of script per painted frame, most recent 300

    const measure = () => {
      // Phones: half scale, and at most 2 device pixels per CSS pixel, so one sprite pixel is one whole device pixel.
      const scale = phone.matches ? 0.5 : 1, ratio = Math.min(2, Math.max(1, Math.round(devicePixelRatio)));
      const width = page.clientWidth;
      // Only ever grow: a phone's address bar changes innerHeight mid-scroll, and resizing a canvas clears it.
      tallest = Math.max(tallest, innerHeight);
      const height = Math.min(tallest + 2 * OVERSCAN, page.offsetHeight);
      const worldW = width / scale, worldH = page.offsetHeight / scale;
      const left = (Math.max(30, Math.ceil(worldW / TILE)) * TILE - worldW) / 2;
      const origin = page.getBoundingClientRect();
      const boxes: SectionBox[] = [...page.querySelectorAll<HTMLElement>('main > section, footer')].map(section => ({
        id: section.id || 'footer',
        rects: [...section.querySelectorAll<HTMLElement>(':scope > .pixel-panel, :scope > .section-heading, :scope > .home-content')].map(ui => {
          const r = ui.getBoundingClientRect();
          return { x: Math.round((r.left - origin.left) / scale + left), y: Math.round((r.top - origin.top) / scale), w: Math.round(r.width / scale), h: Math.round(r.height / scale) };
        }),
      })).filter(box => box.rects.length);
      if (element.width !== width * ratio || element.height !== height * ratio) {
        element.width = width * ratio; element.height = height * ratio;
        element.style.height = `${height}px`;
      }
      const signature = JSON.stringify([boxes, worldW, worldH]);
      if (signature !== layout) {
        layout = signature;
        world = compose(boxes, worldW, worldH);
        entities = spawn(world.actors, 1);
        // Start mid-day, not at dawn: nobody should be found stacked at their doorstep, least of all in a still frame.
        for (let i = 0; i < 900; i++) step(entities, 0.05);
        Object.assign(window, { __world: { world, entities, costs } });   // read by the end-to-end tests
      }
      painted = NaN;
      return { scale, ratio, left, width, height, pageHeight: page.offsetHeight };
    };
    let view = measure();
    const remeasure = () => { view = measure(); };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Where the canvas must sit to surround the viewport, on whole CSS pixels and inside the page.
      const top = Math.round(Math.min(Math.max(scrollY - OVERSCAN, 0), view.pageHeight - view.height));
      const still = calm.matches;
      if (!world || !images || (still && top === painted)) return;
      const started = performance.now();
      if (!still) { time += dt; step(entities, dt); }
      if (top !== painted) { element.style.transform = `translate3d(0, ${top}px, 0)`; painted = top; }
      draw(ctx, world, entities, images, { x: view.left, y: top / view.scale, w: view.width / view.scale, h: view.height / view.scale, zoom: view.scale * view.ratio }, time);
      if (costs.push(performance.now() - started) > 300) costs.shift();
    };
    loadImages().then(loaded => { images = loaded; painted = NaN; });
    frame = requestAnimationFrame(loop);

    const observer = new ResizeObserver(remeasure);
    observer.observe(page);
    addEventListener('resize', remeasure);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('resize', remeasure); };
  }, []);

  return <canvas ref={canvas} className="world-canvas" aria-hidden="true" />;
}
