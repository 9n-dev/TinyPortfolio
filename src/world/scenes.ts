import type { SpriteId } from './sprites.generated';

/** Hand-authored scenes, 30 tiles wide. Coordinates are in tiles, local to the scene, and name the feet of the sprite.
 * On phones only columns 9–21 are on screen, so each strip keeps its subject there.
 *
 * Row legend: '.' grass  '~' water  'T' tree  'b' bush  'r' rock  'o' rock in water  's' stump
 */
export type Point = [number, number];
export type Prop = { sprite: SpriteId; x: number; y: number };
export type Actor =
  | { kind: 'woodcutter' | 'miner'; path: [Point, Point]; look: Point }   // path: store → work spot
  | { kind: 'builder' | 'archer'; path: [Point]; look: Point }
  | { kind: 'sheep'; path: [Point, Point] }                               // meadow corners
  | { kind: 'patrol'; unit: 'warrior' | 'lancer' | 'pawn'; path: Point[] } // closed route
  | { kind: 'monk'; path: Point[] };                                      // wanders between these
export type Scene = { rows: string[]; props: Prop[]; actors: Actor[] };
export type SceneId = 'home' | 'about' | 'projects' | 'skills' | 'contact' | 'shore';
export const SCENE_COLS = 30;

export const scenes: Record<SceneId, Scene> = {
  home: {
    rows: [
      'TTTTT.T...............T.TTTTTT',
      'TTTT..................b..TTTTT',
      'TTT......................T.TTT',
      'TT.T......................TTTT',
      'TTT........................TTT',
      'TT..........................TT',
      'TTT.........................TT',
      'TT.........................TTT',
      'T.T.........................TT',
      'TT..~~~~...................TTT',
      'TT..~~~~~.......r...........TT',
      'TTT.~~o~~..................TTT',
      'TT...~~~.....b..............TT',
      'TTT......................T.TTT',
      'TTTT.T................T.TTTTTT',
    ],
    props: [
      { sprite: 'castle', x: 22, y: 8 }, { sprite: 'tower', x: 26.5, y: 6.2 }, { sprite: 'house1', x: 19.5, y: 4 },
      { sprite: 'house2', x: 25, y: 12 }, { sprite: 'house3', x: 5.5, y: 5 },
      { sprite: 'gold5', x: 4.2, y: 7.6 }, { sprite: 'gold3', x: 5.4, y: 8.2 },
    ],
    actors: [
      { kind: 'miner', path: [[6.2, 5.5], [6.4, 7.9]], look: [5.4, 8] },
      { kind: 'woodcutter', path: [[22, 8.6], [24.3, 13.2]], look: [25.5, 13.5] },
      { kind: 'patrol', unit: 'warrior', path: [[19, 9.6], [25, 9.6], [25, 10.4], [19, 10.4]] },
      { kind: 'patrol', unit: 'lancer', path: [[23.6, 8.7], [24.4, 8.7]] },
      { kind: 'archer', path: [[27.6, 8.4]], look: [20, 8.4] },
      { kind: 'sheep', path: [[9.5, 10.2], [12.5, 13.2]] }, { kind: 'sheep', path: [[9.5, 10.2], [12.5, 13.2]] },
      { kind: 'sheep', path: [[14, 12.2], [18, 13.4]] },
    ],
  },
  about: {
    rows: [
      'TTT.T....................T.TTT',
      'TT........~~~~~............TTT',
      'TTT......~~~o~~~.....b......TT',
      'TT.......~~~~~~~..........T.TT',
      'TTT..b.....~~~~............TTT',
      'TTTT.T..................T.TTTT',
    ],
    props: [{ sprite: 'house1', x: 6, y: 3.4 }, { sprite: 'house2', x: 19, y: 2.6 }, { sprite: 'house3', x: 24.5, y: 3.4 }],
    actors: [
      { kind: 'builder', path: [[7.4, 3.5]], look: [6, 3.5] },
      { kind: 'patrol', unit: 'pawn', path: [[6.4, 4.2], [8, 5.4], [17, 5.4], [19, 3.4], [17, 5.4], [8, 5.4]] },
      { kind: 'sheep', path: [[17, 4], [22, 5.4]] }, { kind: 'sheep', path: [[17, 4], [22, 5.4]] },
    ],
  },
  projects: {
    rows: [
      'TTTT.T..................TTTTTT',
      'TTT.......................TTTT',
      'TT.......................T.TTT',
      'TTT........................TTT',
      'TT.T...................T.TTTTT',
      'TTTTT..................T.TTTTT',
    ],
    props: [
      { sprite: 'gold5', x: 8, y: 2.2 }, { sprite: 'gold3', x: 9.1, y: 2.8 }, { sprite: 'gold6', x: 7.2, y: 3.3 },
      { sprite: 'house3', x: 12.5, y: 2.2 }, { sprite: 'house2', x: 15, y: 3 }, { sprite: 'house1', x: 18, y: 2.4 },
      { sprite: 'goldResource', x: 13.6, y: 3.6 }, { sprite: 'woodResource', x: 16.4, y: 3.7 },
    ],
    actors: [
      { kind: 'miner', path: [[14, 3.9], [10.2, 3.4]], look: [9.1, 3.4] },
      { kind: 'miner', path: [[14.2, 4.3], [8.4, 4]], look: [7.2, 4] },
      { kind: 'woodcutter', path: [[16, 4], [24.3, 3.2]], look: [25.5, 3.2] },
      { kind: 'woodcutter', path: [[16.4, 4.4], [22.2, 5]], look: [23.5, 5] },
      { kind: 'builder', path: [[19.2, 2.6]], look: [18, 2.6] },
    ],
  },
  skills: {
    rows: [
      'TTTT.T.................T.TTTTT',
      'TTT........................TTT',
      'TT.T......................TTTT',
      'TTT........................TTT',
      'TT........................T.TT',
      'TTTT.T..................TTTTTT',
    ],
    props: [
      { sprite: 'tower', x: 6, y: 3.6 }, { sprite: 'barracks', x: 11, y: 3.2 }, { sprite: 'archery', x: 19.5, y: 3.2 },
      { sprite: 'tower', x: 25, y: 3.6 },
    ],
    actors: [
      { kind: 'patrol', unit: 'warrior', path: [[8, 4.7], [22, 4.7], [22, 5.4], [8, 5.4]] },
      { kind: 'patrol', unit: 'lancer', path: [[12.6, 3.7], [13.6, 3.7]] },
      { kind: 'archer', path: [[14.6, 4]], look: [18, 3.6] },
      { kind: 'archer', path: [[15.2, 4.5]], look: [18.4, 4] },
      { kind: 'patrol', unit: 'warrior', path: [[24, 4.4], [26.4, 4.4]] },
    ],
  },
  contact: {
    rows: [
      'TTT.T.....................TTTT',
      'TT...........~~~~~~~~.......TT',
      'TTT.........~~~~~~o~~~....T.TT',
      'TT..........~~o~~~~~~~......TT',
      'TTT...........~~~~~~.......TTT',
      'TTTT.T..................T.TTTT',
    ],
    props: [{ sprite: 'monastery', x: 9.5, y: 4.4 }, { sprite: 'house1', x: 24.5, y: 3 }],
    actors: [
      { kind: 'monk', path: [[7.2, 5.2], [9.5, 5.5], [11.8, 5.2]] },
      { kind: 'monk', path: [[11.6, 4.9], [11.7, 2.4]] },
      { kind: 'sheep', path: [[22.5, 3.8], [25.5, 5.3]] }, { kind: 'sheep', path: [[22.5, 3.8], [25.5, 5.3]] },
    ],
  },
  shore: {
    rows: [
      'TTT.T...................T..TTT',
      'TT..................b.......TT',
      'T.......~~~~~.........~~~~~~~~',
      '~~~~~~~~~~~~~~~~...~~~~~~~~~~~',
      '~~~~o~~~~~~~~~~~~~~~~~o~~~~~~~',
      '~~~~~~~~~~~~o~~~~~~~~~~~~~~~~~',
    ],
    props: [],
    actors: [{ kind: 'sheep', path: [[10, 0.8], [16, 1.8]] }],
  },
};
