# TinyPortfolio

Portfolio de Manuel Allegue López con la interfaz del pack **Tiny Swords** (tablones, pergaminos, cintas, botones) y, de
fondo, una aldea de [TinyRTS](https://github.com/9n-dev/TinyRTS) viva: agua con espuma, bosque que se mece, aldeanos que
talan y pican, ovejas, patrullas, arqueros tirando a las dianas y nubes. React + TypeScript + Vite, un `<canvas>` 2D
propio y ninguna dependencia de juego. En español e inglés.

## Desarrollo

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # sitio estático en dist/
npm run test:e2e   # arranca su propio servidor en el puerto 5183
```

Node 22 recomendado. La primera vez, `npx playwright install chromium`.

## Cambiar el contenido

| Qué | Dónde |
| --- | --- |
| Todo el texto visible, proyectos y skills, en inglés | `src/content/en.ts` |
| Lo mismo en español (tipado con el tipo de `en.ts`: si falta una clave, no compila) | `src/content/es.ts` |
| Nombre, email, redes y endpoint del formulario | `src/data/siteConfig.ts` |

Un proyecto es `{ name, category, description, stack, url?, sourceUrl?, image? }`. Los botones "Ver proyecto" y "Código"
solo aparecen si hay URL; `image` es una captura opcional servida desde `public/`.

El idioma inicial sale de `localStorage`, luego del idioma del navegador, y si no, inglés.

## Formulario de contacto

Sin endpoint, el formulario valida y avisa de que no envía nada. Para activarlo, crea un formulario en
[Formspree](https://formspree.io) y pon su URL en `contactEndpoint` (`https://formspree.io/f/…`). Se envía un POST JSON
`{ name, email, message }` con timeout y gestión de errores; hay un campo trampa `_gotcha` contra bots.

## El mundo (`src/world/`)

| Fichero | Responsabilidad |
| --- | --- |
| `scenes.ts` | Escenas escritas a mano, 30 tiles de ancho: filas de caracteres (`.` hierba, `~` agua, `T` árbol, `b` arbusto, `r` roca, `o` roca en el agua, `s` tocón), edificios y actores con sus rutas. También los claros 3×3 de los márgenes. |
| `compose.ts` | Mide dónde están las secciones y compone el mundo: `home` arriba, una franja en el hueco sobre cada sección, la costa al final, claros junto a los paneles y bosque de relleno con semilla fija. |
| `validate.ts` | Reglas de diseño: nada pisa agua ni atraviesa edificios, los sprites existen, las escenas no se solapan. |
| `entities.ts` | Comportamientos como guiones (generadores): leñador, minero, constructor, oveja, patrulla, arquero, monje, flecha. |
| `renderer.ts` | Pinta un frame: hierba, agua, espuma, costa, todo lo demás ordenado por la Y de los pies, nubes. |
| `WorldCanvas.tsx` | Único contacto con React: canvas fijo, cámara ligada al scroll, pausa y `prefers-reduced-motion`. |
| `sprites.generated.ts` | Registro de sprites, generado por `scripts/prepare-assets.py`. No se edita. |

Para cambiar el paisaje se edita `scenes.ts` y se ejecuta `npx playwright test tests/world.spec.ts`: el validador dice
qué ruta cruza qué. Un portátil de 1440 px enseña las columnas 4–26 y un móvil solo las 9–21 (a media escala), así que
lo importante de cada franja va en el centro. En móvil la escena de `home` se coloca debajo del pergamino y desplazada
para que se vea el castillo.

La altura de las franjas la reserva el CSS: `margin-top` de las secciones en `src/styles/global.css`.

## Assets

Arte de **Tiny Swords (Free Pack), de Pixel Frog**. El ZIP original no está en el repositorio porque su licencia no
permite redistribuirlo; solo se versionan los PNG que la web usa. Para regenerarlos (Python + Pillow) hay que dejar
`Tiny Swords (Free Pack).zip` en la raíz y ejecutar `python3 scripts/prepare-assets.py`. Detalle en
`docs/asset-audit.md`. Tipografía Pixelify Sans servida en local.

## Pruebas

`tests/world.spec.ts` prueba sin navegador el autotile, la composición a varias anchuras y alturas, el validador y
los comportamientos. `tests/portfolio.spec.ts` comprueba en Chromium: sin overflow ni errores de consola de 1728 a
320 px, navegación activa, formulario, que el mundo se pinta, se mueve, se congela en pausa y con movimiento reducido,
cambio y persistencia de idioma, teclado y coste por frame. `tests/visual-review.spec.ts` guarda las capturas de
`docs/screenshots/`.

Verificado en Chromium. Queda pendiente probar en Safari, Firefox, un lector de pantalla y móviles físicos.

## Despliegue

Sitio estático: en Vercel basta importar el repositorio (detecta Vite; build `npm run build`, salida `dist`). No hay
nada específico de Vercel en el código.

Diseño y plan en `docs/superpowers/`.
