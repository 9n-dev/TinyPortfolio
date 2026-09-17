import { rng } from './rng';
import { clearings, scenes, CLEARING_COLS, CLEARING_ROWS, SCENE_COLS } from './scenes';
import type { Actor, Point, Scene, SceneId } from './scenes';
import { sprites } from './sprites.generated';
import type { SpriteId } from './sprites.generated';
import { TILE, WATER, isLand } from './terrain';
import type { Grid } from './terrain';

export type Rect = { x: number; y: number; w: number; h: number };
/** One page section in world pixels: the rectangles its UI covers. */
export type SectionBox = { id: string; rects: Rect[] };
export type Placed = { sprite: SpriteId; x: number; y: number; phase: number; solid: Rect };
export type PlacedActor = Actor & { path: Point[]; look?: Point };   // same shapes, in world pixels
export type Cloud = { sprite: SpriteId; x: number; y: number; speed: number };
export type World = {
  cols: number; rows: number; grid: Grid; props: Placed[]; actors: PlacedActor[]; clouds: Cloud[];
  placed: { id: SceneId; row: number; rows: number }[];
};

const LEGEND: Record<string, SpriteId[]> = {
  T: ['tree1', 'tree2', 'tree3', 'tree4'], b: ['bush1', 'bush2', 'bush3', 'bush4'], r: ['rock1', 'rock2', 'rock3', 'rock4'],
  o: ['waterRock1', 'waterRock2', 'waterRock3', 'waterRock4'], s: ['stump1', 'stump2', 'stump3', 'stump4'],
};

/** The part of a sprite that blocks walking: buildings their lower storey, everything else its base. */
function solid(sprite: SpriteId, x: number, y: number): Rect {
  const [x0, y0, x1, y1] = sprites[sprite].box;
  const building = y1 - y0 > 150 && sprites[sprite].frames === 1;
  const w = building ? x1 - x0 - 16 : Math.min(x1 - x0, 40), h = building ? 72 : 20;
  return { x: x - w / 2, y: y - h, w, h };
}

/** Stable per-cell random in [0,1): scenery must not reshuffle when the viewport width changes. */
const cellRandom = (col: number, row: number, salt: number) => rng((col * 73856093) ^ (row * 19349663) ^ (salt * 83492791))();

export function compose(sections: SectionBox[], worldW: number, worldH: number): World {
  const cols = Math.max(SCENE_COLS, Math.ceil(worldW / TILE));
  const rows = Math.ceil(worldH / TILE);
  const base = Math.floor((cols - SCENE_COLS) / 2);
  const cells = Array.from({ length: rows }, () => Array<string>(cols).fill('.'));
  const world: World = { cols, rows, grid: [], props: [], actors: [], clouds: [], placed: [] };
  const busy = new Set<number>();   // cells the filler forest keeps clear
  const key = (c: number, r: number) => r * cols + c;
  const put = (sprite: SpriteId, x: number, y: number, seed: number) =>
    world.props.push({ sprite, x, y, phase: Math.floor(seed * 16), solid: solid(sprite, x, y) });
  const legend = (char: string, c: number, r: number) => {
    const variants = LEGEND[char];
    if (!variants) return;
    const pick = cellRandom(c - base, r, 1), jitter = char === 'T' ? cellRandom(c - base, r, 2) - 0.5 : 0;
    put(variants[Math.floor(pick * variants.length)], Math.round((c + 0.5 + jitter * 0.4) * TILE),
      Math.round((r + (char === 'o' ? 0.75 : 0.85) + jitter * 0.2) * TILE), pick);
  };

  // Scenes: home on top, one strip centred in the gap above each later section, the shore at the bottom.
  const top = (s: SectionBox) => Math.min(...s.rects.map(r => r.y));
  const bottom = (s: SectionBox) => Math.max(...s.rects.map(r => r.y + r.h));
  const wanted: { id: SceneId; row?: number; gap?: [number, number]; shift?: number }[] = [];
  // Stacked layout (phones): the hero panel is centred and hides the home scene, so the scene moves below it
  // and slides left until the village, not the hole left for the panel, is what the screen shows.
  const hero = sections[0]?.rects[0];
  const stacked = !!hero && Math.abs(hero.x + hero.w / 2 - cols * TILE / 2) < 50;
  sections.forEach((section, i) => {
    if (!(section.id in scenes)) return;
    const id = section.id as SceneId;
    if (i === 0) wanted.push(stacked ? { id, row: Math.ceil((hero.y + hero.h) / TILE) - 3, shift: -6 } : { id, row: 0 });
    else wanted.push({ id, gap: [bottom(sections[i - 1]), top(section)] });
  });
  wanted.push({ id: 'shore', row: rows - scenes.shore.rows.length });
  /** Stamps a scene at a row and column. Full-width scenes repeat their edge terrain out to the sides of wide screens. */
  const place = (scene: Scene, row: number, off: number, width: number) => {
    scene.rows.forEach((line, r) => {
      for (let c = width === SCENE_COLS ? 0 : off; c < (width === SCENE_COLS ? cols : off + width); c++) {
        const char = line[Math.min(Math.max(c - off, 0), width - 1)];
        if (char === WATER || char === 'o') cells[row + r][c] = WATER;
        if (c >= off && c < off + width) { legend(char, c, row + r); busy.add(key(c, row + r)); }
      }
    });
    const px = ([x, y]: Point): Point => [(x + off) * TILE, (y + row) * TILE];
    for (const prop of scene.props) put(prop.sprite, ...px([prop.x, prop.y]), cellRandom(prop.x, prop.y + row, 3));
    for (const actor of scene.actors)
      world.actors.push({ ...actor, path: actor.path.map(px), ...('look' in actor ? { look: px(actor.look) } : {}) } as PlacedActor);
  };
  let free = 0;
  for (const { id, row: fixed, gap, shift = 0 } of wanted) {
    const scene = scenes[id];
    // A strip sits in the middle of what is left of its gap once the scene above has taken its rows.
    const centred = gap ? Math.round((Math.max(gap[0], free * TILE) + gap[1]) / 2 / TILE - scene.rows.length / 2) : fixed!;
    const row = Math.max(centred, free);
    if (row + scene.rows.length > rows) continue;   // page too short for it
    free = row + scene.rows.length;
    world.placed.push({ id, row, rows: scene.rows.length });
    place(scene, row, base + shift, SCENE_COLS);
  }
  // Beside the long panels, small clearings keep the margins alive: one every few rows on each side.
  const taken = (row: number) => world.placed.some(s => row + CLEARING_ROWS > s.row - 1 && row < s.row + s.rows + 1);
  for (let row = 3; row + CLEARING_ROWS < rows; row += CLEARING_ROWS + 2) {
    if (taken(row)) continue;
    [4, SCENE_COLS - 4 - CLEARING_COLS].forEach((col, side) =>
      place(clearings[Math.floor(cellRandom(side, row, 5) * clearings.length)], row, base + col, CLEARING_COLS));
  }
  world.grid = cells.map(line => line.join(''));

  // Filler forest everywhere else: open by the panels, closing in towards the edges.
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (busy.has(key(c, r)) || !isLand(world.grid, c, r) || !isLand(world.grid, c, r + 1)) continue;
    const edge = Math.abs(c + 0.5 - cols / 2) / (SCENE_COLS / 2);
    const chance = cellRandom(c - base, r, 4);
    if (chance < Math.min(0.92, (edge - 0.6) * 4)) legend('T', c, r);
    else if (edge > 0.58 && chance > 0.965) legend(chance > 0.985 ? 'r' : 'b', c, r);
  }
  world.props.sort((a, b) => a.y - b.y);

  const random = rng(rows);
  for (let i = 0; i < Math.max(2, Math.round(rows / 16)); i++)
    world.clouds.push({ sprite: `cloud${1 + Math.floor(random() * 8)}` as SpriteId, x: random() * cols * TILE,
      y: (i + random()) * 16 * TILE, speed: 14 + random() * 12 });
  return world;
}
