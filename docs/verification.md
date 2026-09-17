# Verificación final — tablón vertical y mundo habitado

## Ejecuciones

- `python3 scripts/prepare-assets.py`: correcto.79 exportaciones,215477bytes.119 objetos entre escenas desktop y mobile validados.
- `npm run build`: correcto; TypeScript estricto con `tsc -b` y build Vite sin warnings de assets.
- No existen scripts independientes de lint/typecheck; no se añadieron dependencias.
- Vite disponible en localhost:5173 y ejercitado por Chromium.
- `CHROMIUM_PATH=/home/dev9/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome npm run test:e2e`:5 pruebas aprobadas.

## UI y comportamiento

- Home capturado e inspeccionado en1728×864,1440×900,390×844.
- Página completa revisada en desktop/mobile; capturas adicionales a1024/768/320px.
- Cuatro variantes 9-slice: paper/slate/wood/scroll. Esquinas de los PNG idénticas a dos tamaños de panel; pressed y foco por teclado comprobados.
- Projects es una lista ordenada vertical a todos los tamaños, con cuatro notas sin edificios/imágenes interiores.
- Superficies opacas y sin filtros/opacity en antecesores de contenido.
- Párrafos, tecnologías y campos usan fuente normal. Texto de interfaz permanece en inglés.
- Navegación, indicador activo, enlaces de salto, formulario demo, pausa y reduced motion correctos.
- Sin overflow horizontal, errores JavaScript, warnings en consola web ni HTTP de assets fallidos.

## Composición

- El generador comprueba cajas visibles, reservas UI, agua y bases de árboles. Ordena sprites estáticos por Y antes de componerlos.
- El navegador verifica las cajas de los sprites frente a los paneles reales a1728/1440/1366/1024/768/390/320px.
- Los habitantes no quedan cortados horizontalmente a esas anchuras.
-15 edificios,16 humanos (incluidos2 monjes,4 arqueros y4 lanceros),10 ovejas en la composición desktop.4 estanques.
- Las copas de árboles pueden solaparse intencionadamente con bases separadas. Los demás pares no se superponen según sus cajas visibles.
- El terreno es único; las capas transparentes se anclan a cada sección para acompañar su contenido. Móvil/tablet usan composiciones pequeñas en bandas reservadas debajo de los paneles.

## Evidencia y límites

Capturas actuales: `inhabited/`. Las capturas por sección ocultan la navbar y el enlace de salto no enfocado únicamente durante esa captura, evitando artefactos de elementos fijos al capturar regiones mayores que el viewport. Las capturas completas y de Home mantienen la UI real.

El ZIP no contiene cerdos y no se ha sustituido el pack. No se encontró una captura adicional de UI accesible; se inspeccionaron directamente sus77 PNG UI y la referencia de mapa disponible.

El runner emite un aviso ambiental NO_COLOR/FORCE_COLOR; no aparece en la consola web. Validado en Chromium automatizado, sin afirmar pruebas en Safari/Firefox, lectores de pantalla o dispositivos físicos. URLs/contenido son placeholders y el formulario conserva modo demo.
