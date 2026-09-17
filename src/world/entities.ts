import type { PlacedActor } from './compose';
import { rng } from './rng';
import type { Point } from './scenes';
import { sprites } from './sprites.generated';
import type { SpriteId } from './sprites.generated';

/** Something drawn that changes over time. `t` is seconds into the current animation. */
export type Entity = {
  x: number; y: number; sprite: SpriteId; t: number; flip: boolean; rot?: number; shadow: boolean;
  /** Advances the entity; returns false when it should be removed. May add entities (an arrow). */
  tick(dt: number, all: Entity[]): boolean;
};

const UNIT = {
  warrior: { run: 'warriorRun', rest: 'warriorGuard', speed: 50 },
  lancer: { run: 'lancerRun', rest: 'lancerIdle', speed: 50 },
  pawn: { run: 'pawnRun', rest: 'pawnIdle', speed: 55 },
} as const;
const WORKER = {
  woodcutter: { out: 'pawnRunAxe', work: 'pawnInteractAxe', back: 'pawnRunWood' },
  miner: { out: 'pawnRunPickaxe', work: 'pawnInteractPickaxe', back: 'pawnRunGold' },
} as const;

/** A script is a generator of steps; each step runs until it reports done. Keeps every behaviour a plain loop. */
type Step = (dt: number, all: Entity[]) => boolean;
function entity(start: Point, script: (e: Entity) => Generator<Step>): Entity {
  const e: Entity = { x: start[0], y: start[1], sprite: 'pawnIdle', t: 0, flip: false, shadow: true, tick: () => true };
  const steps = script(e);
  let current: Step | undefined;
  e.tick = (dt, all) => {
    e.t += dt;
    while (!current || current(dt, all)) {
      const next = steps.next();
      if (next.done) return false;
      current = next.value; dt = 0;
    }
    return true;
  };
  return e;
}
const show = (e: Entity, sprite: SpriteId) => { if (e.sprite !== sprite) { e.sprite = sprite; e.t = 0; } };
function wait(e: Entity, sprite: SpriteId, seconds: number): Step {
  let left = seconds, started = false;
  return dt => { if (!started) { show(e, sprite); started = true; } left -= dt; return left <= 0; };
}
function walk(e: Entity, sprite: SpriteId, [tx, ty]: Point, speed: number): Step {
  return dt => {
    show(e, sprite);
    const dx = tx - e.x, dy = ty - e.y, distance = Math.hypot(dx, dy), move = speed * dt;
    if (Math.abs(dx) > 1) e.flip = dx < 0;
    if (distance <= move) { e.x = tx; e.y = ty; return true; }
    e.x += dx / distance * move; e.y += dy / distance * move;
    return false;
  };
}
const face = (e: Entity, [x]: Point): Step => () => { e.flip = x < e.x; return true; };
const length = (sprite: SpriteId) => sprites[sprite].frames / sprites[sprite].fps;

export function spawn(actors: PlacedActor[], seed: number): Entity[] {
  return actors.map((actor, i) => {
    const random = rng(seed + i * 101), between = (a: number, b: number) => a + random() * (b - a);
    switch (actor.kind) {
      case 'woodcutter': case 'miner': { const s = WORKER[actor.kind]; return entity(actor.path[0], function* (e) {
        e.t = between(0, 1);
        for (;;) {
          yield wait(e, 'pawnIdle', between(1, 2.5));
          yield walk(e, s.out, actor.path[1], 60); yield face(e, actor.look!);
          yield wait(e, s.work, length(s.work) * Math.round(between(5, 8)));
          yield walk(e, s.back, actor.path[0], 60);
        }
      }); }
      case 'builder': return entity(actor.path[0], function* (e) {
        for (;;) {
          yield face(e, actor.look!);
          yield wait(e, 'pawnInteractHammer', length('pawnInteractHammer') * Math.round(between(6, 12)));
          yield wait(e, 'pawnIdleHammer', between(1.5, 3));
        }
      });
      case 'sheep': { const [[x0, y0], [x1, y1]] = actor.path;
        const sheep = entity([between(x0, x1), between(y0, y1)], function* (e) {
          e.flip = random() < 0.5;
          for (;;) {
            yield wait(e, 'sheepGrass', length('sheepGrass') * Math.round(between(1, 3)));
            yield wait(e, 'sheepIdle', between(1, 4));
            if (random() < 0.6) yield walk(e, 'sheepMove', [between(x0, x1), between(y0, y1)], 25);
          }
        });
        return sheep; }
      case 'patrol': { const unit = UNIT[actor.unit]; return entity(actor.path[0], function* (e) {
        for (let i = 1; ; i = (i + 1) % actor.path.length) {
          yield wait(e, unit.rest, between(2, 4.5));
          yield walk(e, unit.run, actor.path[i], unit.speed);
        }
      }); }
      case 'monk': return entity(actor.path[0], function* (e) {
        for (;;) {
          yield wait(e, 'monkIdle', between(3, 6));
          if (random() < 0.3) yield wait(e, 'monkHeal', length('monkHeal'));
          yield walk(e, 'monkRun', actor.path[Math.floor(random() * actor.path.length)], 35);
        }
      });
      case 'archer': return entity(actor.path[0], function* (e) {
        const [tx, ty] = actor.look!;
        for (;;) {
          yield face(e, actor.look!);
          yield wait(e, 'archerIdle', between(1.5, 3.5));
          yield wait(e, 'archerShoot', 0.6);
          yield (_, all) => { all.push(arrow([e.x + (e.flip ? -30 : 30), e.y - 50], [tx, ty - 40])); return true; };
          yield wait(e, 'archerShoot', length('archerShoot') - 0.6);
        }
      });
    }
  });
}

function arrow(from: Point, to: Point): Entity {
  const e = entity(from, function* (e) { yield walk(e, 'arrow', to, 520); });
  e.rot = Math.atan2(to[1] - from[1], to[0] - from[0]); e.shadow = false;
  return e;
}

export function step(entities: Entity[], dt: number): void {
  for (let i = entities.length - 1; i >= 0; i--) if (!entities[i].tick(dt, entities)) entities.splice(i, 1);
}
