import { test, expect } from '@playwright/test';
import { grassFrame, hasFoam } from '../src/world/terrain';
import { compose } from '../src/world/compose';
import { validate } from '../src/world/validate';
import { spawn, step } from "../src/world/entities";

const pond = ['.....', '.~~~.', '.~~~.', '.....'];
test('autotile: convex edges around a pond', () => {
  expect(grassFrame(pond, 0, 0)).toBe(10);
  expect(grassFrame(pond, 2, 0)).toBe(19);
  expect(grassFrame(pond, 0, 1)).toBe(11);
  expect(hasFoam(pond, 2, 0)).toBe(true);
  expect(hasFoam(pond, 0, 0)).toBe(false);
});

const layout = (h: number) => ['home', 'about', 'projects', 'skills', 'contact', 'footer'].map((id, i) =>
  ({ id, rects: [{ x: 440, y: i * h + (i ? 448 : 150), w: 1040, h: h - (i ? 448 : 150) }] }));
for (const h of [900, 1300, 2000]) for (const width of [780, 1440, 1920, 2560]) test(`valid world: ${h}px sections, ${width}px wide`, () => {
  const world = compose(layout(h), width, 6 * h + 400);
  expect(validate(world)).toEqual([]);
  expect(world.placed.map(s => s.id)).toEqual(['home', 'about', 'projects', 'skills', 'contact', 'shore']);
  expect(compose(layout(h), width, 6 * h + 400)).toEqual(world);
});

test('woodcutter completes its cycle and comes back loaded', () => {
  const entities = spawn([{ kind: 'woodcutter', path: [[128, 128], [512, 128]], look: [560, 128] }], 1);
  const seen = new Set<string>();
  for (let i = 0; i < 60 * 40; i++) { step(entities, 1 / 60); seen.add(entities[0].sprite); }
  expect([...seen].sort()).toEqual(['pawnIdle', 'pawnInteractAxe', 'pawnRunAxe', 'pawnRunWood']);
});
test('sheep never leaves its meadow', () => {
  const entities = spawn([{ kind: 'sheep', path: [[256, 256], [448, 384]] }], 7);
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < 60 * 120; i++) { step(entities, 1 / 60); xs.push(entities[0].x); ys.push(entities[0].y); }
  expect([Math.min(...xs), Math.min(...ys)].every((v, i) => v >= [256, 256][i])).toBe(true);
  expect([Math.max(...xs), Math.max(...ys)].every((v, i) => v <= [448, 384][i])).toBe(true);
  expect(new Set(xs).size).toBeGreaterThan(10);   // and it does move
});
test('archer looses an arrow that lands and disappears', () => {
  const entities = spawn([{ kind: 'archer', path: [[100, 100]], look: [400, 100] }], 3);
  let most = 1;
  for (let i = 0; i < 60 * 12; i++) { step(entities, 1 / 60); most = Math.max(most, entities.length); }
  expect(most).toBe(2);
  for (let i = 0; i < 60; i++) step(entities, 1 / 60);
  expect(entities.filter(e => e.sprite === 'arrow').length).toBeLessThanOrEqual(1);
});
