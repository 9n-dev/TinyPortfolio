# Auditoría de assets

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

`scripts/prepare-assets.py` copia sin modificar a `public/assets/world/` los PNG del pack que usa el canvas y genera
`src/world/sprites.generated.ts` con la rejilla de frames y la caja opaca del frame 0 de cada uno; el centro inferior
de esa caja es el ancla de los pies, que decide el orden de pintado. En las unidades el ancla X es el centro del frame
para que no salten al cambiar de animación.

- Terreno: `Tilemap_color1` (bloque 3×3, tiras y tile suelto del suelo llano), `Water Foam` (16 frames de 192, 8 fps,
  fase distinta por casilla) y el color de `Water Background color`. El autotile es el de TinyRTS: solo bordes convexos.
- Edificios azules: Castle, House1/2/3, Tower, Barracks, Archery, Monastery. Un frame, tamaño nativo.
- Tree1–4 (8 frames), Stump1–4, Bushe1–4 (8 frames), Rock1–4, Water Rocks 1–4 (16 frames), Clouds 1–8, Gold Stone 1–6,
  Gold Resource, Wood Resource.
- Pawn: Idle, Run, Idle/Run/Interact Axe, Run Wood, Idle/Run/Interact Pickaxe, Run Gold, Idle/Interact Hammer.
  Warrior: Idle, Run, Guard. Lancer: Idle, Run (frames de 320). Archer: Idle, Run, Shoot y Arrow. Monk: Idle, Run, Heal.
  Sheep: Idle, Grass, Move (frames de 128).
- Avatar de About: `Human Avatars/Avatars_01`.
- El Free Pack no contiene cerdos ni otros animales: solo ovejas. No se usa el Enemy Pack.

La sombra de las unidades es una elipse dibujada por el canvas; `Shadow.png` del pack está pensado para mesetas.
El ZIP original no se versiona (licencia de Pixel Frog): hace falta en local solo para volver a ejecutar el script.
