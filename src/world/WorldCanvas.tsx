import { useEffect, useRef } from 'react';
import { compose } from './compose';
import type { SectionBox, World } from './compose';
import { spawn, step } from './entities';
import type { Entity } from './entities';
import { draw, loadImages } from './renderer';
import type { Images } from './renderer';
import { TILE } from './terrain';

/** The living world behind the page: one fixed canvas whose camera follows the scroll.
 * It reads where the sections really are, so the scenery fits any content height, language or width.
 */
export function WorldCanvas({ paused }: { paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const element = canvas.current!, ctx = element.getContext('2d')!;
    const page = document.querySelector<HTMLElement>('.world')!;
    const phone = matchMedia('(max-width: 767px)'), calm = matchMedia('(prefers-reduced-motion: reduce)');
    let images: Images | undefined, world: World | undefined, entities: Entity[] = [];
    let layout = '', time = 0, last = 0, dirty = true, frame = 0;
    const costs: number[] = [];   // ms of script per painted frame, most recent 300

    const measure = () => {
      const scale = phone.matches ? 0.5 : 1, ratio = Math.max(1, Math.round(devicePixelRatio));
      const width = element.clientWidth, height = element.clientHeight;   // the viewport without the scrollbar
      const worldW = width / scale, worldH = page.offsetHeight / scale;
      const left = (Math.max(30, Math.ceil(worldW / TILE)) * TILE - worldW) / 2;
      const boxes: SectionBox[] = [...page.querySelectorAll<HTMLElement>('main > section, footer')].map(section => ({
        id: section.id || 'footer',
        rects: [...section.querySelectorAll<HTMLElement>(':scope > .pixel-panel, :scope > .section-heading, :scope > .home-content')].map(ui => {
          const r = ui.getBoundingClientRect();
          return { x: Math.round(r.left / scale + left), y: Math.round((r.top + scrollY) / scale), w: Math.round(r.width / scale), h: Math.round(r.height / scale) };
        }),
      })).filter(box => box.rects.length);
      if (element.width !== width * ratio || element.height !== height * ratio) { element.width = width * ratio; element.height = height * ratio; }
      const signature = JSON.stringify([boxes, worldW, worldH]);
      if (signature !== layout) {
        layout = signature;
        world = compose(boxes, worldW, worldH);
        entities = spawn(world.actors, 1);
        Object.assign(window, { __world: { world, entities, costs } });   // read by the end-to-end tests
      }
      dirty = true;
      return { scale, ratio, left, w: worldW, h: height / scale };
    };
    let view = measure();
    const remeasure = () => { view = measure(); };
    const touch = () => { dirty = true; };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const still = pausedRef.current || calm.matches;
      if (!world || !images || (still && !dirty)) return;
      const started = performance.now();
      if (!still) { time += dt; step(entities, dt); }
      dirty = false;
      draw(ctx, world, entities, images, { x: view.left, y: scrollY / view.scale, w: view.w, h: view.h, zoom: view.scale * view.ratio }, time);
      if (costs.push(performance.now() - started) > 300) costs.shift();
    };
    loadImages().then(loaded => { images = loaded; dirty = true; });
    frame = requestAnimationFrame(loop);

    const observer = new ResizeObserver(remeasure);
    observer.observe(page);
    addEventListener('resize', remeasure);
    addEventListener('scroll', touch, { passive: true });
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      removeEventListener('resize', remeasure); removeEventListener('scroll', touch);
    };
  }, []);

  // A pause toggle must repaint once so the frozen frame matches what was on screen.
  useEffect(() => { dispatchEvent(new Event('scroll')); }, [paused]);
  return <canvas ref={canvas} className="world-canvas" aria-hidden="true" />;
}
