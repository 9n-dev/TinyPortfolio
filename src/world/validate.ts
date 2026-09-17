import type { Rect, World } from './compose';
import { clearings, scenes, CLEARING_COLS, SCENE_COLS } from './scenes';
import { sprites } from './sprites.generated';
import { TILE, isLand } from './terrain';

const inside = (r: Rect, x: number, y: number) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;

/** Design rules of a composed world. Returns one message per broken rule; empty means valid. */
export function validate(world: World): string[] {
  const errors: string[] = [];
  const land = (x: number, y: number) => isLand(world.grid, Math.floor(x / TILE), Math.floor(y / TILE));
  for (const [id, scene] of Object.entries(scenes))
    scene.rows.forEach((row, i) => { if (row.length !== SCENE_COLS) errors.push(`${id}: row ${i} has ${row.length} columns`); });
  clearings.forEach((scene, n) => { if (scene.rows.some(row => row.length !== CLEARING_COLS)) errors.push(`clearing ${n} is not ${CLEARING_COLS} wide`); });
  world.placed.forEach((scene, i) => {
    const next = world.placed[i + 1];
    if (next && scene.row + scene.rows > next.row) errors.push(`${scene.id} overlaps ${next.id}`);
  });
  for (const prop of world.props) {
    if (!(prop.sprite in sprites)) errors.push(`unknown sprite ${prop.sprite}`);
    const wet = prop.sprite.startsWith('waterRock');
    if (land(prop.x, prop.y - 4) === wet) errors.push(`${prop.sprite} at ${prop.x},${prop.y} is on ${wet ? 'land' : 'water'}`);
  }
  const clear = (x: number, y: number, who: string) => {
    if (!land(x, y)) errors.push(`${who} walks on water at ${Math.round(x)},${Math.round(y)}`);
    const hit = world.props.find(p => inside(p.solid, x, y));
    if (hit) errors.push(`${who} walks through ${hit.sprite} at ${Math.round(x)},${Math.round(y)}`);
  };
  for (const actor of world.actors) {
    if (actor.kind === 'sheep') {
      const [[x0, y0], [x1, y1]] = actor.path;
      for (let x = x0; x <= x1; x += 16) for (let y = y0; y <= y1; y += 16) clear(x, y, 'sheep');
      continue;
    }
    // Monks walk between any two of their points; everyone else follows the route in order.
    const legs = actor.kind === 'monk'
      ? actor.path.flatMap((a, i) => actor.path.slice(i + 1).map(b => [a, b]))
      : actor.path.map((a, i) => [a, actor.path[(i + 1) % actor.path.length]]);
    for (const [[ax, ay], [bx, by]] of legs) {
      const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 16));
      for (let s = 0; s <= steps; s++) clear(ax + (bx - ax) * s / steps, ay + (by - ay) * s / steps, actor.kind);
    }
  }
  return [...new Set(errors)];
}
