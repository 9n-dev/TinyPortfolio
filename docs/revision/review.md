# Revisión de fundamentos

## Decisiones

- Mantener React/Vite, contenido, navegación y formulario existentes.
- Hero como ventana oscura de500px anclada a una composición diagonal. Único texto ambiental: Explore.
- Navbar compacta de720px de ancho y aproximadamente62px de alto; sin numeración, subtítulo, icono o control de animaciones dentro de la barra.
- Mover el control existente de pausa junto a Explore, sin añadir controles nuevos.
- Un castillo, una casa, un personaje, un árbol cercano y tres pequeñas decoraciones. Sin estanque.
- Bosque compuesto manualmente, sin espejo ni generación procedural, conservando cuatro especies nativas.
- Terreno global único y capas transparentes, sin cambios de fondo por sección.
- Projects/Skills/Contact conservan su organización; solo se corrigen paneles, escalas de UI y legibilidad.

## Contraste medido de los colores reales

| Uso | Texto | Fondo | Ratio |
| --- | --- | --- | --- |
| Hero y navbar | #eee1c6 | #525b66 | 5.32:1 |
| Cargo destacado (26/24px) | #d7b888 | #525b66 | 3.64:1, texto grande |
| Texto secundario sobre papel | #495060 | #eee1c6 | 6.24:1 |
| Botón normal | #161c2e | #41919d | 4.65:1 |
| Botón pulsado | #f2eadb | #4a6982 | >4.5:1 |

En320px el cargo se reduce a21px y usa el mismo color claro del párrafo (5.32:1). La selección de navbar se distingue por subrayado dorado; el texto conserva el contraste alto. No existen fades, filtros ni padres translúcidos.

## Evidencia

- `hero-1728x864.png`, `hero-1440x900.png`, `hero-390x844.png`: capturas requeridas, revisadas visualmente.
- `hero-paper-comparison.png`: comparación del papel claro con misma escena.
- `ui-nine-slice-proof.png`: RegularPaper, SpecialPaper y WoodTable a dos tamaños.
- `button-pressed.png`, `button-focus.png`: estados del botón real.
- Las capturas completas se guardan en `docs/screenshot-*.png`.

Las pruebas incluyen límites de contenido, imágenes/carga, consola, navegación activa, formulario, pausa y prefers-reduced-motion. Las esquinas se comparan como buffers PNG idénticos entre tamaños. La app no recibe ningún fixture visual de pruebas en producción.

Limitaciones: Chromium automatizado, sin lector de pantalla ni dispositivos físicos. No se afirma conformidad WCAG integral. No hay linter independiente configurado; `npm run build` ejecuta la comprobación estricta de TypeScript antes de Vite.
