import type { SpriteId } from './sprites.generated';

/** Hand-authored scenes, 30 tiles wide. Coordinates are in tiles, local to the scene, and name the feet of the sprite.
 * A 1440px laptop shows columns 4–26 and a phone only 9–21, so each strip keeps its subject in the middle and lets
 * the forest take the outer columns. Beyond column 0 and 29 the filler forest of compose.ts continues.
 *
 * Row legend: '.' grass  '~' water  'T' tree  'b' bush  'r' rock  'o' rock in water  's' stump
 */
export type Point = [number, number];
export type Prop = { sprite: SpriteId; x: number; y: number };
export type Actor =
  | { kind: 'woodcutter' | 'miner'; path: [Point, Point]; look: Point }   // path: store → work spot
  | { kind: 'builder' | 'archer'; path: [Point]; look: Point }
  | { kind: 'sheep'; path: [Point, Point] }                               // meadow corners
  | { kind: 'patrol'; unit: 'warrior' | 'lancer' | 'archer' | 'pawn'; path: Point[] } // closed route
  | { kind: 'monk'; path: Point[] };                                      // wanders between these
export type Scene = { rows: string[]; props: Prop[]; actors: Actor[] };
export type SceneId = 'home' | 'about' | 'projects' | 'skills' | 'contact' | 'shore';
export const SCENE_COLS = 30;

export const scenes: Record<SceneId, Scene> = {
  // The hero panel covers columns 8.6–16.4, rows 2.7–9.3; the controls sit at the bottom centre.
  home: {
    rows: [
      'TTTTTT.T..............T.TTTTTT',
      'TTTTT....................TTTTT',
      'TTTT.T....................TTTT',
      'TTTTT.....................TTTT',
      'TTTT......................TTTT',
      'TTTTT......................TTT',
      'TTTT.......................TTT',
      'TTTTT.....................TTTT',
      'TTTT......................TTTT',
      'TTTT.~~~~..................TTT',
      'TTT..~~~~~................TTTT',
      'TTTT.~~o~~...............TTTTT',
      'TTTT..~~~....b.....r.....T.TTT',
      'TTTTT...................TTTTTT',
      'TTTTTT.T..............T.TTTTTT',
    ],
    props: [
      { sprite: 'house3', x: 6.5, y: 4.6 }, { sprite: 'gold5', x: 5.6, y: 7.4 }, { sprite: 'gold3', x: 6.8, y: 8 },
      { sprite: 'house1', x: 18.5, y: 3.4 }, { sprite: 'castle', x: 20.8, y: 7.6 }, { sprite: 'tower', x: 24.6, y: 5.6 },
      { sprite: 'house2', x: 23.8, y: 11.4 },
    ],
    actors: [
      { kind: 'miner', path: [[7.5, 5.2], [7.7, 7.7]], look: [6.8, 7.8] },
      { kind: 'woodcutter', path: [[20.8, 8.4], [23.2, 13.9]], look: [24.5, 13.9] },
      { kind: 'patrol', unit: 'warrior', path: [[18.2, 9.2], [24, 9.2], [24, 10], [18.2, 10]] },
      { kind: 'patrol', unit: 'lancer', path: [[22, 8.3], [22.8, 8.3]] },
      { kind: 'patrol', unit: 'archer', path: [[25.2, 6.8], [25.2, 10.4]] },
      { kind: 'sheep', path: [[10.6, 10.4], [12.6, 13.4]] }, { kind: 'sheep', path: [[10.6, 10.4], [12.6, 13.4]] },
      { kind: 'sheep', path: [[14.5, 10.2], [17.5, 11.8]] }, { kind: 'sheep', path: [[14.5, 10.2], [17.5, 11.8]] },
    ],
  },
  about: {
    rows: [
      'TTTTT.T................T.TTTTT',
      'TTTT......~~~~~...........TTTT',
      'TTTTT....~~~o~~~.....b....TTTT',
      'TTTT.....~~~~~~~..........TTTT',
      'TTTT.......~~~~...........TTTT',
      'TTTTT..b..................TTTT',
      'TTTTTT.T..............T.TTTTTT',
    ],
    props: [
      { sprite: 'house1', x: 6.3, y: 3.4 }, { sprite: 'house2', x: 18.4, y: 2.8 }, { sprite: 'house3', x: 21.2, y: 3.6 },
      { sprite: 'house1', x: 23.8, y: 5.4 },
    ],
    actors: [
      { kind: 'builder', path: [[7.5, 3.5]], look: [6.3, 3.5] },
      { kind: 'patrol', unit: 'pawn', path: [[7, 4.4], [8.5, 5.7], [16.5, 5.7], [18.4, 3.6], [16.5, 5.7], [8.5, 5.7]] },
      { kind: 'sheep', path: [[16.8, 4.4], [20, 6.2]] }, { kind: 'sheep', path: [[16.8, 4.4], [20, 6.2]] },
      { kind: 'sheep', path: [[16.8, 4.4], [20, 6.2]] },
    ],
  },
  projects: {
    rows: [
      'TTTTTT.T...............TTTTTTT',
      'TTTT.....................TTTTT',
      'TTTTT....................TTTTT',
      'TTTT....................TTTTTT',
      'TTTTT.....................TTTT',
      'TTTT.....................TTTTT',
      'TTTTTT.T..............T.TTTTTT',
    ],
    props: [
      { sprite: 'gold5', x: 8.6, y: 2.6 }, { sprite: 'gold3', x: 9.8, y: 3.2 }, { sprite: 'gold6', x: 8, y: 3.8 },
      { sprite: 'gold4', x: 9.4, y: 4.7 }, { sprite: 'house3', x: 13.2, y: 2.6 }, { sprite: 'house2', x: 16, y: 3.2 },
      { sprite: 'house1', x: 19, y: 2.6 }, { sprite: 'goldResource', x: 14.6, y: 3.9 },
      { sprite: 'woodResource', x: 17.5, y: 3.9 }, { sprite: 'woodResource', x: 18.1, y: 4.2 },
    ],
    actors: [
      { kind: 'miner', path: [[14.4, 4.3], [10.9, 3.6]], look: [9.8, 3.4] },
      { kind: 'miner', path: [[14.8, 4.8], [10.5, 5.1]], look: [9.4, 4.8] },
      { kind: 'woodcutter', path: [[17.2, 4.5], [23.3, 3.8]], look: [24.5, 3.8] },
      { kind: 'woodcutter', path: [[17.8, 5], [25.3, 4.9]], look: [26.5, 4.9] },
      { kind: 'builder', path: [[20.1, 2.8]], look: [19, 2.8] },
    ],
  },
  skills: {
    rows: [
      'TTTTTT.T...............T.TTTTT',
      'TTTT.........b....r.......TTTT',
      'TTTTT.....................TTTT',
      'TTTT.......................TTT',
      'TTTTT.....................TTTT',
      'TTTT...................b..TTTT',
      'TTTTTT.T..............T.TTTTTT',
    ],
    props: [
      { sprite: 'tower', x: 6.5, y: 3.8 }, { sprite: 'barracks', x: 10.5, y: 3.4 }, { sprite: 'archery', x: 20, y: 3.6 },
      { sprite: 'tower', x: 24.2, y: 3.8 },
    ],
    actors: [
      { kind: 'patrol', unit: 'warrior', path: [[8, 5], [22.5, 5], [22.5, 5.8], [8, 5.8]] },
      { kind: 'patrol', unit: 'lancer', path: [[12.2, 3.8], [13.2, 3.8]] },
      { kind: 'archer', path: [[16, 3.8]], look: [19.4, 3.7] },
      { kind: 'archer', path: [[15, 4.6]], look: [19.2, 3.8] },
      { kind: 'patrol', unit: 'warrior', path: [[8.4, 4.4], [6, 4.6]] },
      { kind: 'patrol', unit: 'archer', path: [[24.6, 4.6], [22.6, 4.4]] },
    ],
  },
  contact: {
    rows: [
      'TTTTT.T...................TTTT',
      'TTTT.........~~~~~~~~.....TTTT',
      'TTTTT.......~~~~~~o~~~...TTTTT',
      'TTTT........~~o~~~~~~~....TTTT',
      'TTTTT.........~~~~~~......TTTT',
      'TTTT......................TTTT',
      'TTTTTT.T..............T.TTTTTT',
    ],
    props: [{ sprite: 'monastery', x: 9.3, y: 4.7 }, { sprite: 'house1', x: 23.4, y: 3.2 }],
    actors: [
      { kind: 'monk', path: [[7, 5.5], [9.3, 5.8], [11.6, 5.5]] },
      { kind: 'monk', path: [[11.3, 5.1], [11.4, 2.6]] },
      { kind: 'sheep', path: [[21.5, 4.2], [24.5, 5.8]] }, { kind: 'sheep', path: [[21.5, 4.2], [24.5, 5.8]] },
    ],
  },
  shore: {
    rows: [
      'TTTTT.T.................T.TTTT',
      'TTTT................b.....TTTT',
      'TTT.....~~~~~.........~~~~~~~~',
      '~~~~~~~~~~~~~~~~...~~~~~~~~~~~',
      '~~~~o~~~~~~~~~~~~~~~~~o~~~~~~~',
      '~~~~~~~~~~~~o~~~~~~~~~~~~~~~~~',
    ],
    props: [],
    actors: [{ kind: 'sheep', path: [[10, 0.8], [16, 1.8]] }, { kind: 'sheep', path: [[10, 0.8], [16, 1.8]] }],
  },
};
