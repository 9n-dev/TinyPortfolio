import type { World } from './compose';
import type { Entity } from './entities';
import { sprites } from './sprites.generated';
import type { SpriteId } from './sprites.generated';
import { TILE, grassFrame, hasFoam, isLand } from './terrain';

export type Images = Partial<Record<SpriteId, HTMLImageElement>>;
/** Visible part of the world, in world pixels, and how many device pixels one world pixel takes. */
export type Camera = { x: number; y: number; w: number; h: number; zoom: number };
const WATER_COLOR = '#47aba9';   // Water Background color.png

/** A missing image only costs its own sprites; the page and the rest of the world carry on. */
export function loadImages(): Promise<Images> {
  const images: Images = {};
  return Promise.all((Object.keys(sprites) as SpriteId[]).map(id => new Promise<void>(resolve => {
    const image = new Image();
    image.onload = () => { images[id] = image; resolve(); };
    image.onerror = () => { console.warn(`World sprite failed to load: ${sprites[id].src}`); resolve(); };
    image.src = import.meta.env.BASE_URL + sprites[id].src;
  }))).then(() => images);
}

// Coast tiles per world: water and shoreline cells get water + foam, then every land cell the foam can reach is repainted.
type Coast = { water: [number, number][]; foam: [number, number][]; grass: [number, number, number][] };
const coasts = new WeakMap<World, Coast>();
function coastOf(world: World): Coast {
  let coast = coasts.get(world);
  if (coast) return coast;
  coast = { water: [], foam: [], grass: [] };
  const g = world.grid;
  for (let y = 0; y < world.rows; y++) for (let x = 0; x < world.cols; x++) {
    if (!isLand(g, x, y)) { coast.water.push([x, y]); continue; }
    if (hasFoam(g, x, y)) { coast.water.push([x, y]); coast.foam.push([x, y]); }
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) if (hasFoam(g, x + dx, y + dy)) { near = true; break; }
    if (near) coast.grass.push([x, y, grassFrame(g, x, y)]);
  }
  coasts.set(world, coast);
  return coast;
}

let grass: CanvasPattern | null = null;
function grassPattern(ctx: CanvasRenderingContext2D, tilemap: HTMLImageElement) {
  if (grass) return grass;
  const tile = document.createElement('canvas');
  tile.width = tile.height = TILE;
  tile.getContext('2d')!.drawImage(tilemap, TILE, TILE, TILE, TILE, 0, 0, TILE, TILE);
  return grass = ctx.createPattern(tile, 'repeat');
}

export function draw(ctx: CanvasRenderingContext2D, world: World, entities: Entity[], images: Images, cam: Camera, time: number) {
  const { zoom } = cam;
  // Whole device pixels only: fractional offsets open seams between tiles.
  const ox = Math.round(cam.x * zoom) / zoom, oy = Math.round(cam.y * zoom) / zoom;
  ctx.setTransform(zoom, 0, 0, zoom, -ox * zoom, -oy * zoom);
  ctx.imageSmoothingEnabled = false;
  const top = oy - 2 * TILE, bottom = oy + cam.h + 2 * TILE;
  const seen = (y: number) => y * TILE > top - TILE && y * TILE < bottom;

  const tilemap = images.tilemap, foam = images.foam;
  ctx.fillStyle = (tilemap && grassPattern(ctx, tilemap)) || '#98b552';
  ctx.fillRect(ox, oy, cam.w + 1, cam.h + 1);
  const coast = coastOf(world);
  ctx.fillStyle = WATER_COLOR;
  for (const [x, y] of coast.water) if (seen(y)) ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
  if (foam) for (const [x, y] of coast.foam) if (seen(y)) {
    const frame = (Math.floor(time * sprites.foam.fps) + x * 3 + y * 5) % sprites.foam.frames;
    ctx.drawImage(foam, frame * 192, 0, 192, 192, x * TILE - TILE, y * TILE - TILE, 192, 192);
  }
  if (tilemap) for (const [x, y, frame] of coast.grass) if (seen(y))
    ctx.drawImage(tilemap, frame % 9 * TILE, Math.floor(frame / 9) * TILE, TILE, TILE, x * TILE, y * TILE, TILE, TILE);

  // Everything standing on the ground, back to front by the Y of its feet. Props are pre-sorted.
  const sprite = (id: SpriteId, x: number, y: number, clock: number, flip = false, rot?: number) => {
    const image = images[id], s = sprites[id];
    if (!image) return;
    const sx = (s.fps ? Math.floor(clock * s.fps) % s.frames : 0) * s.frameW;
    if (!flip && rot === undefined) return ctx.drawImage(image, sx, 0, s.frameW, s.frameH, Math.round(x) - s.anchorX, Math.round(y) - s.anchorY, s.frameW, s.frameH);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (rot !== undefined) { ctx.translate(0, -s.anchorY + s.frameH / 2); ctx.rotate(rot); ctx.translate(0, s.anchorY - s.frameH / 2); }
    else ctx.scale(-1, 1);
    ctx.drawImage(image, sx, 0, s.frameW, s.frameH, -s.anchorX, -s.anchorY, s.frameW, s.frameH);
    ctx.restore();
  };
  const props = world.props;
  let lo = 0, hi = props.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (props[mid].y < top) lo = mid + 1; else hi = mid; }
  const moving = entities.filter(e => e.y > top && e.y < bottom + 4 * TILE).sort((a, b) => a.y - b.y);
  ctx.fillStyle = 'rgba(20, 30, 40, 0.22)';
  for (const e of moving) if (e.shadow) { ctx.beginPath(); ctx.ellipse(Math.round(e.x), Math.round(e.y) - 2, 20, 7, 0, 0, Math.PI * 2); ctx.fill(); }
  let next = 0;
  for (let i = lo; i < props.length && props[i].y < bottom + 4 * TILE; i++) {
    const prop = props[i];
    while (next < moving.length && moving[next].y <= prop.y) { const e = moving[next++]; sprite(e.sprite, e.x, e.y, e.t, e.flip, e.rot); }
    sprite(prop.sprite, prop.x, prop.y, time + prop.phase / 8);
  }
  while (next < moving.length) { const e = moving[next++]; sprite(e.sprite, e.x, e.y, e.t, e.flip, e.rot); }

  // Clouds drift above everything and scroll a little slower than the ground.
  const span = world.cols * TILE + 600;
  for (const cloud of world.clouds) {
    const y = cloud.y + oy * 0.2;
    if (y > top - 4 * TILE && y < bottom + 4 * TILE) sprite(cloud.sprite, (cloud.x + cloud.speed * time) % span - 300, y, 0);
  }
}
