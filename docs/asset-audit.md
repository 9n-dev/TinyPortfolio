# Auditoría de UI y escena — iteración actual

Se inspeccionaron el ZIP, la referencia de mapa, capturas existentes y las77 imágenes UI del pack (también avatars/cursors y banners de tienda). El inventario completo permanece en `asset-inventory.txt`. No se encontró una captura de UI adicional en los archivos accesibles; se usaron directamente los originales. Las imágenes se revisaron como contact sheets y los atlas elegidos a resolución original.

## UI

| Fuente | Construcción y uso |
| --- | --- |
| RegularPaper,320×320 | 9-slice64 con paso128. Notas de Projects, inventario, navbar y formulario. Centro16×16 uniforme del propio papel; bordes repetidos |
| SpecialPaper,320×320 | 9-slice independiente. Campos de contacto y botones secundarios; texto claro sobre #525b66 |
| WoodTable,448×448 | Esquinas128; ejes centrales64 con gutters. Se recorta exclusivamente margen exterior44/40/44/24. Renderer a1/4: columnas21/centro/21, filas22/centro/26. Navbar, quest board, Skills y footer |
| Banner,448×448 | Pergamino enrollado 9-slice. Se retiran márgenes28/60/44/16; columnas25/centro/21 y filas17/centro/28 a1/4. Hero y Contact usan este marco con el centro opaco de RegularPaper para lectura limpia |
| WoodTable_Slots,192×192 | Slot independiente,48×48. Fondo de iconos en Skills; no se interpreta como atlas |
| SmallBar_Base,320×64 | Atlas horizontal de extremos/centro. Tres recortes individuales y repetición del centro para un separador. Sin rellenar ni inventar niveles de habilidad |
| BigBlueButton Regular/Pressed,320×320 | Atlas 9-slice, recortes distintos de ambos estados; esquinas16, hover y foco visibles |
| BigRibbons,448×640 | Atlas de cinco colores, tres piezas por fila. Variante azul a media escala, centro repetido |
| SmallRibbons, Banner_Slots, Swords, otros botones, avatars y cursores | Inspeccionados. Se evita introducir adornos o funcionalidades sin utilidad |
| Icon02/03/05/06/10,64×64 | Iconos independientes a32px |

No se estira ningún atlas completo. Las celdas recortadas mantienen su proporción por eje. Los tests comparan PNG de las esquinas a dos tamaños para paper/slate/wood/scroll.

## Mundo

- Castle, House1/2/3, Tower, Barracks, Archery, Monastery: sprites independientes, tamaño nativo, solo escenario.
- Tree1/2:8 frames192×256; Tree3/4:8 frames192×192. Se utiliza frame0. Copas solapadas únicamente si sus bases están separadas.
- Bushes:8 frames128×128; Rocks y Gold Stone3: sprites individuales. Vegetación/recursos a escala nativa.
- Warrior/Pawn:8 frames192×192. Archer/Monk:6 frames192×192. Lancer:12 frames320×320. Sheep:6 frames128×128.
- Se calcula la unión alfa de todos los frames de cada unidad antes de recortar. Así la animación no salta ni invade espacio no validado.
- Water Rocks01:16 frames64×64, se usa frame0. Tilemap_color2:atlas64, piezas de costa y tile interior. Water Background color:tile64.
- Water Foam fue inspeccionado; no se usa una tira rectangular de espuma en estanques de otra forma.
- El ZIP no contiene cerdos. Se conservan los animales reales disponibles, sin recolorear ovejas ni recurrir a otro pack.

## Validación y capas

Las posiciones se guardan en `world.json`, sin aleatoriedad. El generador valida reservas de UI, colisiones entre cajas visibles, agua y bases de árboles; pinta agua antes de objetos y ordena estos por el borde inferior de su caja. Los sprites animados no intersectan ningún otro elemento, por lo que pueden dibujarse sobre la composición estática sin ambigüedad de profundidad.

La aplicación usa niveles explícitos para terreno/escenario, contenido y navbar. El terreno está en `.world`; las imágenes de región son transparentes y están ancladas a la sección. Los tests comparan las cajas de los datos con las superficies reales del navegador y comprueban habitantes completos en1728/1440/1366/1024/768/390/320px.

`selected-assets.json` lista las exportaciones; `world.json` identifica las fuentes de los objetos que se componen en WebP. Las capturas actuales están en `inhabited/`; `clean/` y `revision/` conservan las iteraciones anteriores.
