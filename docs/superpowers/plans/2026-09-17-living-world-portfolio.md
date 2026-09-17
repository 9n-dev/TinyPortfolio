# Living World Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el fondo estático del portfolio por una aldea de TinyRTS simulada en canvas, añadir About, ES/EN y contenido real.

**Architecture:** Un `<canvas>` fijo detrás de la UI de React pinta un mundo compuesto en tiempo de ejecución a partir de las posiciones reales de las secciones: escenas escritas a mano + bosque de relleno con semilla. La lógica (terreno, composición, entidades) es TypeScript puro y se prueba sin navegador; `WorldCanvas.tsx` es el único punto de contacto con React.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Canvas 2D, Playwright (tests con y sin navegador), Python + Pillow solo para extraer assets.

**Spec:** `docs/superpowers/specs/2026-09-17-living-world-portfolio-design.md`

## Global Constraints

- Sin dependencias nuevas en `package.json`.
- Solo arte del Free Pack de Tiny Swords; PNG sin modificar. El ZIP no entra en git.
- Tile de 64 px. Escala del mundo 1 en escritorio, 0,5 por debajo de 768 px.
- Escenas de 30 tiles de ancho; franjas entre secciones de 5 tiles de alto.
- Todo azar con semilla fija (mismo mundo en cada visita, tests estables).
- Canvas `aria-hidden`; pausa con `document.hidden`, botón de pausa y `prefers-reduced-motion`.
- Todo texto visible sale de `src/content/{en,es}.ts`; `es` tipado con el tipo de `en`.
- Sin overflow horizontal a 1728, 1440, 1024, 768, 390 y 320 px; sin errores de consola.
- Commits pequeños, uno por tarea como mínimo.

## File Structure

```
scripts/prepare-assets.py        UI nine-slice (se conserva) + exportación del mundo (nuevo); fuera: escenas horneadas
public/assets/world/             PNG del pack usados por el canvas (generado)
src/world/sprites.generated.ts   registro de sprites medido por el script (generado)
src/world/rng.ts                 mulberry32
src/world/terrain.ts             rejilla de caracteres, autotile de hierba, tiles de espuma
src/world/scenes.ts              escenas escritas a mano (datos)
src/world/compose.ts             secciones medidas → World (terreno, objetos, actores, nubes)
src/world/validate.ts            reglas de validez de un World
src/world/entities.ts            máquinas de estados y avance por dt
src/world/renderer.ts            carga de imágenes y pintado de un frame
src/world/WorldCanvas.tsx        montaje, medición, bucle, pausa
src/i18n.tsx                     contexto de idioma y hook useContent
src/content/en.ts, es.ts         todo el texto
src/sections/About.tsx           sección nueva
tests/world.spec.ts              tests sin navegador de terrain/compose/validate/entities
tests/portfolio.spec.ts          E2E adaptados + nuevos
```

Se eliminan: `src/components/MapScene.tsx`, `src/data/scenes/`, `src/data/projects.ts`, `src/data/skills.ts`,
`src/data/socials.ts`, `public/assets/terrain/`, `public/assets/units/`, capturas viejas de `docs/`.

---

### Task 1: Exportación de assets del mundo

**Files:** Modify `scripts/prepare-assets.py`; Create `public/assets/world/*`, `src/world/sprites.generated.ts`.

**Interfaces — Produces:**

```ts
export type SpriteDef = { src: string; frameW: number; frameH: number; frames: number; fps: number;
  anchorX: number; anchorY: number;          // pies: centro-abajo de la caja opaca del frame 0, en px del frame
  box: [number, number, number, number] };   // caja opaca x0,y0,x1,y1 del frame 0
export const sprites: Record<SpriteId, SpriteDef>;
export type SpriteId = keyof typeof sprites;
```

Ids: `castle house1 house2 house3 tower barracks archery monastery tree1..tree4 stump1..stump4 bush1..bush4
rock1..rock4 waterRock1..waterRock4 gold1..gold6 goldResource woodResource cloud1..cloud8 sheepIdle sheepGrass
sheepMove pawnIdle pawnRun pawnIdleAxe pawnRunAxe pawnInteractAxe pawnRunWood pawnIdlePickaxe pawnRunPickaxe
pawnInteractPickaxe pawnRunGold pawnIdleHammer pawnInteractHammer warriorIdle warriorRun warriorGuard lancerIdle
lancerRun archerIdle archerRun archerShoot arrow monkIdle monkRun monkHeal tilemap foam shadow avatar`.

Anchos de frame: unidades 192 (lancero 320), oveja 128, árbol 192 (alto 256 en tree1/2, 192 en tree3/4), arbusto 128,
roca de agua 64, espuma 192, resto un solo frame. fps 10 (espuma 8, nubes 0).

- [ ] Quitar de `prepare-assets.py` todo lo que lea `world.json` o escriba en `terrain/` y `units/`; conservar `UI_SHEETS`, cinta, divisor e iconos.
- [ ] Añadir tabla `WORLD = {id: (ruta en el ZIP, frameW, frameH, fps)}`, copiar cada PNG a `public/assets/world/<id>.png`, medir la caja opaca del frame 0 con `Image.getbbox()` y escribir `sprites.generated.ts`.
- [ ] Run `python3 scripts/prepare-assets.py` → lista de ficheros sin errores; `du -sh public/assets/world` < 1,5 MB.
- [ ] Borrar `public/assets/terrain`, `public/assets/units`, `src/data/scenes`, `docs/scene-validation.json`, `docs/selected-assets.json`. Commit.

### Task 2: Terreno, RNG, escenas, composición y validación (lógica pura)

**Files:** Create `src/world/{rng,terrain,scenes,compose,validate}.ts`, `tests/world.spec.ts`.

**Interfaces — Produces:**

```ts
// rng.ts
export function rng(seed: number): () => number;                  // mulberry32, [0,1)
// terrain.ts
export const TILE = 64;
export type Grid = string[];                                       // filas; '~' agua, '.' hierba
export const isLand = (g: Grid, x: number, y: number) => boolean;  // fuera de la rejilla: tierra, salvo bajo la última fila (mar)
export function grassFrame(g: Grid, x: number, y: number): number; // índice en tilemap de 9 columnas (puerto de Terrain.PickFrame de TinyRTS: Block 0, VStrip 3, HStrip 27, Single 30)
export function hasFoam(g: Grid, x: number, y: number): boolean;   // tierra con agua en ortogonal
// scenes.ts
export type Prop  = { sprite: SpriteId; x: number; y: number; solid?: [number, number] }; // x,y en tiles (pies); solid = huella w,h en tiles
export type Actor = { kind: 'woodcutter'|'miner'|'builder'|'sheep'|'patrol'|'archer'|'monk';
  unit?: 'warrior'|'lancer'; path: [number, number][]; };          // puntos en tiles; significado por kind
export type Scene = { rows: Grid; props: Prop[]; actors: Actor[] };
export const scenes: Record<'home'|'about'|'projects'|'skills'|'contact'|'shore', Scene>;
export const SCENE_COLS = 30; export const STRIP_ROWS = 5;
// compose.ts
export type SectionBox = { id: string; top: number; bottom: number; panelLeft: number; panelRight: number }; // px de mundo
export type World = { cols: number; rows: number; originX: number;  // originX: px de mundo de la columna 0 de las escenas
  grid: Grid; props: Placed[]; actors: PlacedActor[]; clouds: Cloud[]; reserved: Rect[] };
export function compose(sections: SectionBox[], worldW: number, worldH: number): World;
// validate.ts
export function validate(w: World): string[];                      // mensajes; vacío = válido
```

Reglas de `compose`: `home` en y=0; cada franja centrada en el hueco entre la sección anterior y la suya; `shore` al
final; relleno de bosque con `rng(fila)` fuera de las escenas y de `reserved` (rectángulos de paneles + 1 tile),
densidad creciente hacia los bordes; nunca sobre agua ni a menos de 1 tile de un prop sólido.

Reglas de `validate`: ningún prop, punto de ruta ni segmento (muestreado cada 16 px) sobre agua o dentro de una huella
sólida ajena; ningún prop de escena dentro de `reserved`; todo `sprite` existe en `sprites`; las escenas no se solapan.

- [ ] **Test primero** (`tests/world.spec.ts`, sin `page`):

```ts
import { test, expect } from '@playwright/test';
import { grassFrame, hasFoam } from '../src/world/terrain';
import { compose } from '../src/world/compose';
import { validate } from '../src/world/validate';

const pond = ['.....', '.~~~.', '.~~~.', '.....'];
test('autotile: bordes convexos alrededor de un estanque', () => {
  expect(grassFrame(pond, 0, 0)).toBe(10);  // interior del bloque: fila 1, col 1
  expect(grassFrame(pond, 2, 0)).toBe(19);  // agua debajo: fila 2 del bloque
  expect(grassFrame(pond, 0, 1)).toBe(11);  // agua a la derecha
  expect(hasFoam(pond, 2, 0)).toBe(true);
  expect(hasFoam(pond, 0, 0)).toBe(false);
});
const layout = (h: number) => ['home', 'about', 'projects', 'skills', 'contact'].map((id, i) =>
  ({ id, top: i * h, bottom: i * h + h - 320, panelLeft: 440, panelRight: 1480 }));
for (const h of [900, 1300, 2000]) test(`mundo válido con secciones de ${h}px`, () => {
  const world = compose(layout(h), 1920, 5 * h + 600);
  expect(validate(world)).toEqual([]);
  expect(compose(layout(h), 1920, 5 * h + 600)).toEqual(world);   // determinista
});
```

- [ ] Run `npx playwright test tests/world.spec.ts` → FAIL (módulos inexistentes).
- [ ] Implementar `rng`, `terrain`, `scenes` (primer borrador de las seis escenas según la referencia), `compose`, `validate`.
- [ ] Run → PASS. Commit.

### Task 3: Entidades

**Files:** Create `src/world/entities.ts`; extend `tests/world.spec.ts`.

**Interfaces — Produces:**

```ts
export type Entity = { x: number; y: number; sprite: SpriteId; t: number; flip: boolean; /* estado interno */ };
export function spawn(actors: PlacedActor[], seed: number): Entity[];
export function step(entities: Entity[], dt: number): void;        // dt en segundos; muta
```

Ciclos como en la tabla del spec. Velocidades: peón 60 px/s, patrulla 50, monje 35, oveja 25. La flecha del arquero es
una entidad más, creada en el frame 6 de `archerShoot` y eliminada al llegar a la diana.

- [ ] Test primero:

```ts
test('leñador completa el ciclo y vuelve cargado', () => {
  const [e] = spawn([{ kind: 'woodcutter', path: [[2, 2], [8, 2]] } as any], 1);
  const seen = new Set<string>();
  for (let i = 0; i < 60 * 40; i++) { step([e], 1 / 60); seen.add(e.sprite); }
  expect([...seen].sort()).toEqual(['pawnIdle', 'pawnInteractAxe', 'pawnRunAxe', 'pawnRunWood']);
});
test('la oveja no sale de su prado', () => {
  const [e] = spawn([{ kind: 'sheep', path: [[4, 4], [7, 6]] } as any], 7);
  for (let i = 0; i < 60 * 120; i++) { step([e], 1 / 60);
    expect(e.x).toBeGreaterThanOrEqual(4 * 64); expect(e.x).toBeLessThanOrEqual(7 * 64); }
});
```

- [ ] Run → FAIL. Implementar. Run → PASS. Commit.

### Task 4: Render e integración

**Files:** Create `src/world/renderer.ts`, `src/world/WorldCanvas.tsx`; Modify `src/App.tsx`, secciones (quitar `SceneRegion`), `src/styles/global.css`, `home.css`; Delete `src/components/MapScene.tsx`.

**Interfaces:**

```ts
export function loadImages(): Promise<Record<SpriteId, HTMLImageElement>>;   // una imagen rota avisa y se omite
export function draw(ctx: CanvasRenderingContext2D, world: World, entities: Entity[], images, cam: { x: number; y: number; w: number; h: number; scale: number }, time: number): void;
export function WorldCanvas({ paused }: { paused: boolean }): JSX.Element;
```

- [ ] `draw`: fondo agua → espuma (fase `(x*3+y*5)%16`, 8 fps) → hierba autotileada → sombras → props+entidades por Y de pies → nubes. Recorte por viewport + 2 tiles. Terreno cacheado en un canvas fuera de pantalla por World.
- [ ] `WorldCanvas`: mide `section[id]` y su `.pixel-panel` principal, `ResizeObserver` sobre `.world`, recompone; rAF con `dt ≤ 0.05`; para con `document.hidden`; con `paused` o `prefers-reduced-motion` pinta un frame y repinta solo en scroll/resize. Expone `window.__world = { world, entities }` solo en `import.meta.env.DEV` para los tests.
- [ ] CSS: `body { background: #6aa84f-equivalente del tile }`, `.world` sin imagen de fondo, canvas `position: fixed; inset: 0; z-index: 0`, contenido `z-index: 1`; margen vertical entre secciones de 320 px (160 px < 768 px).
- [ ] `npm run build` → sin errores. `npm run dev` + captura a 1440×900 con Playwright → el mundo se ve. Commit.

### Task 5: Idiomas, contenido y secciones

**Files:** Create `src/i18n.tsx`, `src/content/en.ts`, `src/content/es.ts`, `src/sections/About.tsx`; Modify todas las secciones, `Navigation`, `ProjectCard`, `SocialLinks`, `Footer`, `siteConfig.ts`, `services/contact.ts`, `main.tsx`, `index.html`; Delete `src/data/{projects,skills,socials}.ts`.

**Interfaces:**

```ts
export type Lang = 'en' | 'es';
export function LanguageProvider(props: PropsWithChildren): JSX.Element;
export function useContent(): { lang: Lang; setLang(l: Lang): void; t: Content };   // Content = typeof en
```

- [ ] `en.ts` con los textos del spec; `es.ts: Content`. Proyecto: `{ name, category, description, stack, url?, sourceUrl?, image? }`.
- [ ] Idioma inicial: `localStorage.lang` → `navigator.language.startsWith('es')` → `en` (con try/catch). Efecto: `documentElement.lang`, `document.title`, meta descripción.
- [ ] Selector `ES | EN` en la navbar (`<button aria-pressed>`). About con avatar, dos párrafos y cuatro datos. Botones de proyecto condicionales. Quitar CV.
- [ ] `contact.ts`: cabecera `Accept: application/json`; campo `_gotcha` oculto en el formulario, y si viene relleno no se envía.
- [ ] `npx tsc -b` → sin errores. Commit.

### Task 6: E2E, revisión visual e iteración

**Files:** Modify `tests/portfolio.spec.ts`, `tests/visual-review.spec.ts`, `playwright.config.ts` si hace falta.

- [ ] Adaptar los E2E a cinco secciones y sin `SceneRegion`. Nuevos tests:

```ts
test('el mundo se pinta, se mueve y se congela en pausa', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => (window as any).__world);
  const shot = () => page.locator('canvas.world-canvas').screenshot();
  const a = await shot(); await page.waitForTimeout(1000); const b = await shot();
  expect(a.equals(b)).toBe(false);
  await page.getByRole('button', { name: /pause/i }).click();
  const c = await shot(); await page.waitForTimeout(1000); expect((await shot()).equals(c)).toBe(true);
});
test('el idioma cambia y persiste', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'ES' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('link', { name: 'Proyectos' }).first()).toBeVisible();
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});
```

- [ ] `validate(window.__world.world)` en navegador a 1728, 1440, 1024, 768, 390 y 320 px y en ambos idiomas → `[]`.
- [ ] Capturas completas y por sección a 1728×864, 1440×900 y 390×844 en `docs/screenshots/`. Revisarlas a ojo contra `fae6f04b-….png`: densidad de la aldea, bosque cerrado en los bordes, nada cortado por paneles, legibilidad del texto, móvil a escala 0,5. Corregir escenas y repetir hasta que quede bien.
- [ ] Medir tiempo de frame (`performance.now()` alrededor de `step`+`draw`, media y máximo en 300 frames) → media < 4 ms, máximo < 8 ms.
- [ ] `npm run test:e2e` → todo PASS. Commit.

### Task 7: Documentación, limpieza y entrega

- [ ] Borrar `docs/revision`, `docs/clean`, `docs/inhabited`, `docs/screenshot-*.png`, `docs/hero-*.png`, `docs/verification.md`.
- [ ] Reescribir `README.md` (contenido e idiomas, escenas, Formspree, despliegue) y actualizar `docs/asset-audit.md`.
- [ ] `npm run build` y `npm run test:e2e` → PASS. Commit y `git push`.
