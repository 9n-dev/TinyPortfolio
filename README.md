# Tiny World — Developer Portfolio

Portfolio React + TypeScript + Vite, con un mundo pixel-art construido exclusivamente con Tiny Swords (Free Pack). Navegación convencional, cuatro secciones y diseño adaptable. Sin motor de juego ni librería de animación.

## Desarrollo

```sh
npm install
npm run dev
npm run build
npm run preview
```

Node 22 recomendado. `dist/` es el sitio estático publicable. El ZIP, la referencia, los scripts y las capturas no se incluyen en el sitio publicado.

## Personalizar contenido

| Archivo | Contenido |
| --- | --- |
| `src/data/siteConfig.ts` | Nombre, cargo (separado por ` · `), descripción, email, CV, textos de secciones y endpoint de contacto |
| `src/data/projects.ts` | Proyectos, descripciones, categorías, tecnologías y URLs |
| `src/data/skills.ts` | Categorías y tecnologías de ejemplo |
| `src/data/socials.ts` | GitHub y LinkedIn; Email utiliza `siteConfig.email` |

Todos los proyectos y perfiles son **placeholders**. Sustituirlos antes de publicar. El CV está oculto por defecto: colocar `cv.pdf` en `public/` y configurar `cvUrl: '/cv.pdf'` para mostrarlo.

## Arquitectura

- `components/`: navegación, botones, paneles, títulos, sprites animados y tarjetas.
- `sections/`: Home, Projects, Skills y Contact.
- `data/`: contenido provisional centralizado.
- `services/contact.ts`: adaptador del formulario, independiente de su presentación.
- `styles/`: estilos generales, `ui.css` para las nueve piezas y `home.css` para el primer viewport.
- `data/scenes/world.json`: composición estática, registro de sprites, recortes y categorías de escala.
- `components/NineSliceSurface.tsx`: nueve celdas de UI con esquinas fijas y texturas repetidas.
- `components/MapScene.tsx`: capas visuales separadas de los datos de escena.
- `public/assets/`: únicamente imágenes elegidas o composiciones derivadas.
- `scripts/prepare-assets.py`: composición reproducible de mapas y ensamblaje de piezas UI.
- `docs/`: inventario de los 410 PNG, manifiesto de selección, decisiones de arte y capturas.

El terreno se repite una sola vez sobre `.world` y continúa bajo todas las secciones y el footer. `SceneRegion` sitúa capas transparentes, sin fondos independientes, alrededor de cada sección. Los datos de `world.json` definen la escena; `generated.json` contiene las dimensiones verificadas y los pocos sprites animados.

La UI conserva React, TypeScript y Vite. Hero y Contact combinan el marco enrollado de `Banner` y el centro legible de `RegularPaper`. Projects es un tablón **vertical** WoodTable con cuatro notas de papel. Skills usa slots reales de madera y una barra segmentada como separador decorativo, nunca como porcentaje. Navbar y footer usan madera con interior claro. Los campos del formulario y botones secundarios usan SpecialPaper.

Las nueve piezas tienen dimensiones independientes por eje; las esquinas y los bordes mantienen su escala real aunque se retiren los márgenes vacíos del atlas. El centro se repite. Los botones primarios cambian al atlas Pressed al pulsarlos.

## Composición del mapa

Editar `src/data/scenes/world.json`: fuentes, fotogramas, posiciones y variantes desktop/mobile. Las coordenadas corresponden a la caja visible, no al margen transparente del spritesheet. Se usan monjes, arqueros, lanceros, soldados, aldeanos y ovejas del ZIP. **El Free Pack proporcionado no incluye cerdos**; no se han inventado ni obtenido de otro pack.

```sh
python3 scripts/prepare-assets.py
```

El generador comprueba coordenadas enteras, zonas reservadas para UI, cajas visibles de sprites, exclusión del agua y separación de elementos. Solo permite solapamientos de copas de árboles con bases separadas. Ordena los elementos estáticos por la posición Y de su base y genera composiciones WebP sin pérdida. Si encuentra una colisión, termina con un error que identifica los objetos. `docs/scene-validation.json` registra el resultado.

El navegador mantiene el terreno continuo; la decoración está anclada a las secciones para acompañar la altura del contenido. Por debajo de1440px se utilizan composiciones reducidas debajo de los paneles para que las unidades no queden cortadas en los laterales. Las animaciones CSS tienen pausa y respetan prefers-reduced-motion.

## Contacto

Por defecto el formulario valida los campos y explica que no se ha enviado nada. No guarda datos ni simula un envío exitoso.

Para conectar un backend, establecer `contactEndpoint` en `siteConfig.ts`. El adaptador envía un POST JSON `{ name, email, message }`, espera un estado HTTP satisfactorio y gestiona errores y timeout. El servidor deberá validar datos, limitar solicitudes y efectuar el envío. No poner credenciales en el frontend.

## Assets y tipografía

Arte de **Tiny Swords — Pixel Frog**, procedente del ZIP proporcionado. Se conservan los colores originales; UI mediante nueve celdas con los espacios del atlas eliminados; las esquinas nunca se estiran. Pixelify Sans se sirve localmente desde `@fontsource/pixelify-sans`; párrafos en fuente de sistema.

Para recomponer assets (solo durante desarrollo, requiere Python + Pillow):

```sh
python3 scripts/prepare-assets.py
```

No se genera arte nuevo ni se utiliza la captura de referencia como fondo. Los PNG originales mantienen transparencia; los WebP se comprimen sin pérdida. `image-rendering: pixelated` se aplica al escenario y sus recursos. Las celdas UI conservan escalas coherentes (media escala o cuarto de escala). El mapa conserva resolución nativa y no usa interpolación suave. Los estanques combinan celdas de costa de Tilemap_color2 con Water Background color; su forma se define con filas de tiles en `world.json`. Casas, torres, talleres, recursos, aldeanos y ovejas pertenecen al escenario, nunca a las fichas de proyectos.

## Verificación

Con Vite iniciado:

```sh
npx playwright install chromium
npm run test:e2e
```

Se puede usar un Chromium existente con `CHROMIUM_PATH=/ruta/a/chrome npm run test:e2e`.

Las pruebas recorren 1728×864, 1440×900 y 390×844, además de 1024, 768 y 320px. Comprueban overflow, assets, navegación activa, formulario, pausa, movimiento reducido, acceso por teclado y consola. Comparan píxel a píxel las esquinas de cuatro skins a distintos tamaños y comprueban el sprite pressed y focus-visible. Validan también la lista vertical y las cajas visibles de todas las decoraciones frente a los paneles reales a siete anchuras, incluido1366px. Guarda capturas completas y por sección en `docs/inhabited/`. Playwright solo es dependencia de desarrollo.

La verificación realizada corresponde a Chromium, no a una certificación de accesibilidad ni a una prueba en dispositivos físicos.

## Próximos pasos

1. Sustituir ejemplos por proyectos reales: capturas, casos de estudio, resultados comprobables y CV.
2. Conectar el formulario, añadir metadatos sociales con identidad definitiva y revisar Safari/Firefox y lector de pantalla antes de publicar.

La auditoría detallada de esta revisión está en `docs/asset-audit.md` y las decisiones y capturas actuales en `docs/inhabited/`. Las capturas de `docs/revision/` y `docs/clean/` corresponden a iteraciones anteriores.
