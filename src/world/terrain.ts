export const TILE = 64;
export const WATER = '~';
/** Rows of characters: '~' water, anything else land. */
export type Grid = string[];

const TILESET_COLUMNS = 9;
// Flat-ground block of the Tiny Swords tilemap: 3×3 block, vertical strip, horizontal strip, single tile.
const BLOCK = 0, V_STRIP = 3, H_STRIP = 27, SINGLE = 30;

/** Out-of-range cells repeat the nearest edge cell, so the map has no border of its own. */
export function isLand(g: Grid, x: number, y: number): boolean {
  const row = g[Math.min(Math.max(y, 0), g.length - 1)];
  return row[Math.min(Math.max(x, 0), row.length - 1)] !== WATER;
}

/** Tilemap frame from which orthogonal neighbours are land. Port of TinyRTS Terrain.PickFrame: the pack only has convex edges. */
export function grassFrame(g: Grid, x: number, y: number): number {
  const up = isLand(g, x, y - 1), down = isLand(g, x, y + 1), left = isLand(g, x - 1, y), right = isLand(g, x + 1, y);
  if (!left && !right) {
    if (!up && !down) return SINGLE;
    return V_STRIP + (!up ? 0 : !down ? 2 : 1) * TILESET_COLUMNS;
  }
  if (!up && !down) return H_STRIP + (!left ? 0 : !right ? 2 : 1);
  return BLOCK + (!up ? 0 : !down ? 2 : 1) * TILESET_COLUMNS + (!left ? 0 : !right ? 2 : 1);
}

/** Land touching water orthogonally carries animated foam under its edge. */
export function hasFoam(g: Grid, x: number, y: number): boolean {
  return isLand(g, x, y) && !(isLand(g, x, y - 1) && isLand(g, x, y + 1) && isLand(g, x - 1, y) && isLand(g, x + 1, y));
}
