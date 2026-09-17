# Iteración: claridad y mundo habitado

## Decisiones implementadas

- Hero compacto de500px: RegularPaper con tinta oscura, párrafo16px normal, CTAs pixel y enlaces discretos. Sin microcopy adicional.
- Navbar compacta: WoodTable, banda interior opaca y sección activa subrayada.
- Projects: tablón WoodTable con cuatro fichas RegularPaper. Sin imágenes, mini escenas ni edificios asociados a proyectos.
- Skills: inventario de papel dentro de madera, categorías separadas y tecnologías sin porcentajes.
- Contact: un pergamino limpio, campos con borde y superficie clara, labels reales y feedback del formulario existente. Edificios reservados al mundo.
- Footer: panel pequeño de madera/papel dentro del terreno continuo, conserva copyright, atribución y vuelta al inicio.
- Mundo: casas, torre, talleres, unidades, ovejas, recursos y dos estanques. Decoración estática en los márgenes y tres animaciones pequeñas en Home. Se mantiene espacio despejado alrededor del texto.

## Contraste medido desde los PNG y colores CSS

| Combinación | Ratio |
| --- | --- |
| Tinta #161c2e / pergamino #eee1c6 | 13.08:1 |
| Texto secundario #444553 / pergamino | 7.30:1 |
| Tinta / azul de botón #41919d | 4.65:1 |
| Pergamino / botón secundario #525b66 | 5.32:1 |
| Placeholder #444553 / campo #f2eadb | 7.91:1 |

Los centros de papel, panel oscuro y botones tienen alfa255. Los tests verifican que los contenedores y sus antecesores no tengan opacity reducida ni filtros, y que cada superficie de lectura tenga su respaldo opaco. Los párrafos y campos usan fuente normal; títulos y botones conservan Pixelify Sans.

## Revisión visual

Capturas de Home en1728×864,1440×900,390×844; página completa en1440,1024,768,390,320px y capturas por sección en1728/390px. Se comparó también el papel oscuro: se mantiene el claro para seguir la jerarquía solicitada y unificar la lectura.

Se corrigió un estanque inicialmente simétrico y su orden de capas para que no corte vegetación. Las capturas de sección ocultan únicamente la navbar durante la captura; las capturas completas y de Home muestran la navegación real.

Limitación: validación en Chromium automatizado; sin prueba en Safari/Firefox ni dispositivos físicos. Proyectos y contactos siguen siendo placeholders; el formulario no tiene backend configurado.
