# Portfolio con mundo vivo de TinyRTS: diseño

Fecha: 2026-09-17. Estado: aprobado e implementado.

## Objetivo

Portfolio personal de Manuel Allegue López con la UI del pack Tiny Swords (tablones, pergaminos, cintas, botones)
y, de fondo, una aldea de TinyRTS viva: terreno, agua con espuma, bosque, edificios, aldeanos trabajando, ovejas,
guardias y nubes. Bilingüe ES/EN con selector. Sitio estático, desplegable en Vercel o cualquier hosting estático.

## Decisiones tomadas con el autor

| Tema | Decisión |
| --- | --- |
| Fondo | Mundo simulado en un `<canvas>` 2D propio. Sin Phaser ni dependencias nuevas. |
| Scroll | Mundo tan alto como la página. Canvas fijo; la cámara sigue el scroll. |
| Vida | Aldea pacífica, solo Free Pack. Sin combate ni interacción del visitante. |
| Mapa | Diseñado por Claude con `docs/reference.png` como referencia. Formato propio, terreno llano. |
| Móvil | Misma composición; la cámara se centra en la columna central. |
| Secciones | Home → About → Projects → Skills → Contact. Sin Experience, sin botón de CV. |
| Proyectos | TinyRTS, Mario Hacendado (2dMario), RiftLens. Ampliable editando un fichero. |
| Contenido | Extraído del CV y de los portfolios anteriores; el autor lo revisa aquí. |
| Idiomas | ES y EN con selector. |
| Contacto | Servicio de formularios sin backend (Formspree). Modo demo hasta tener el endpoint. |
| Despliegue | Vercel en principio. Ruta base por defecto; nada específico de Vercel en el código. |

## Enfoque

Se conserva la UI existente (nine-slice, secciones, estilos, formulario, tests) y se sustituye solo el sistema de
fondo. Se descartaron reescribir desde cero (la UI ya resuelve lo difícil) y Phaser (1 MB para lo que hacen
unas 400 líneas de canvas).

Paso previo: `git init` y un commit con el estado actual, para que los borrados de este trabajo sean reversibles.

## 1. Mundo (`src/world/`)

### Canvas y cámara

Un `<canvas>` con `position: fixed; inset: 0; z-index` por debajo de `.world`, `aria-hidden="true"` e
`image-rendering: pixelated`. `imageSmoothingEnabled = false`. El tamaño interno es el del viewport multiplicado
por `devicePixelRatio` redondeado a entero.

- `camera.y = scrollY / escala`. `camera.x` centra la columna central del mapa en el viewport.
- Escala del mundo: 1 en escritorio (tile de 64 px), 0,5 por debajo de 768 px. Se valida a ojo en las capturas de
  390 px; si la reducción a la mitad degrada el arte, se activa el suavizado solo en ese caso.
- Solo se pintan tiles y entidades que intersectan el viewport más un margen de 2 tiles.

### Composición: escenas ancladas y relleno

La altura de la página cambia con el idioma, el ancho y el número de proyectos, así que el mapa no es una rejilla
fija. Se compone al cargar y en cada `resize` a partir de las posiciones reales de las secciones:

- **Escenas** (`scenes.ts`): bloques escritos a mano, de 30 tiles de ancho y alto fijo, cada uno con su terreno
  (filas de caracteres: `.` hierba, `~` agua), objetos, animales, unidades y rutas en coordenadas locales.
  - `home`: alto de un viewport. Castillo, torre, casas, estanque, oro, ovejas; hueco a la izquierda para el
    pergamino del Hero (como ahora).
  - Una **franja** por cada hueco entre secciones (About, Projects, Skills, Contact), de 5 tiles de alto en
    escritorio: es donde el mundo se ve a todo lo ancho.
    - antes de About: casas y un estanque con rocas de agua.
    - antes de Projects: talleres, veta de oro y leñadores.
    - antes de Skills: cuartel, dianas de tiro, arqueros y patrulla.
    - antes de Contact: monasterio, monjes y lago.
  - `shore`: bajo el footer el mapa termina en costa con espuma y mar abierto.
- **Laterales**: junto a los paneles, cada sección declara unos pocos objetos anclados a su borde superior
  (casas, torres, arbustos, ovejas). El resto del lateral y todo lo que quede fuera de los 30 tiles en pantallas
  anchas es **bosque de relleno determinista**: árboles, arbustos y rocas colocados con un generador con semilla fija
  por fila, más denso hacia los bordes. Mismo resultado en cada visita.
- La columna bajo los paneles es hierba sin objetos.

El CSS da a las secciones un margen vertical que garantiza el alto de las franjas: 5 tiles de mundo, es decir
320 px en escritorio y 160 px en móvil (escala 0,5).

### Terreno

Hierba de `Tilemap_color1`. Agua: `Water Background color` debajo, `Water Foam` animada en cada tile de costa y
borde de hierba autotileado con una máscara de 4 vecinos sobre el mismo tilemap (16 casos, tabla fija). Sin
elevación ni acantilados.

### Sprites (`sprites.ts`)

Un registro: `id → { src, frameW, frameH, frames, fps, anchorX, anchorY }`. El ancla es el punto de los pies y
define el orden de pintado. Los PNG se copian del ZIP a `public/assets/world/` sin modificar.

### Entidades (`entities.ts`)

Máquinas de estados mínimas, movimiento en línea recta entre puntos definidos en la escena. Sin pathfinding: las
rutas se escriben a mano y el validador garantiza que no pisan agua ni edificios.

| Entidad | Ciclo |
| --- | --- |
| Peón leñador | ir al árbol → `Interact Axe` 4 s → volver con `Run Wood` al almacén → `Idle` 1 s → repetir |
| Peón minero | igual con `Interact Pickaxe` y `Run Gold` |
| Peón constructor | `Interact Hammer` junto a un edificio, pausas en `Idle Hammer` |
| Oveja | alterna `Sheep_Grass`, `Sheep_Idle` y `Sheep_Move` hacia un punto aleatorio dentro de su prado |
| Guerrero, lancero | patrulla una ruta cerrada; `Guard`/`Idle` en los extremos |
| Arquero | `Archer_Shoot` hacia la diana con flecha visible, pausas en `Idle` |
| Monje | pasea entre 2 o 3 puntos; de vez en cuando `Heal` con su efecto |
| Árbol, arbusto, roca de agua | animación en bucle con desfase por instancia |
| Nube | deriva horizontal lenta por encima de todo, con parallax vertical 0,8 |

Las unidades se voltean en horizontal según la dirección. El azar (pausas, destino de la oveja) usa un generador
con semilla para que los tests sean estables.

### Render (`renderer.ts`)

Un bucle `requestAnimationFrame` con `dt` acotado a 50 ms. Capas: agua → espuma → hierba y costa → sombras →
entidades y objetos ordenados por Y de los pies → nubes. El terreno estático de cada escena se pinta una vez en un
canvas fuera de pantalla y se reutiliza.

### Integración con React (`WorldCanvas.tsx`)

Único punto de contacto. Mide las secciones (`getBoundingClientRect` + `ResizeObserver` sobre `.world`), compone el
mundo, arranca el bucle y lo detiene al desmontar. Se pausa con `document.hidden`. Con el botón de pausa existente
o con `prefers-reduced-motion` pinta un único frame estático y solo repinta al hacer scroll o `resize`.

Mientras cargan las imágenes, `body` tiene el verde de la hierba como color de fondo. Si una imagen falla, se
registra un aviso en consola y el mundo se pinta sin ella; la página sigue siendo usable.

## 2. UI, secciones e idiomas

### Lo que se conserva

`NineSliceSurface`, `PixelPanel`, `PixelButton`, `SectionTitle` (cinta), `Navigation`, `Footer`, `Skills` con slots
de madera, `Contact` con campos SpecialPaper, y la tipografía Pixelify Sans local. De `scripts/prepare-assets.py`
se conserva solo la extracción de celdas UI; se elimina la composición de escenas.

`global.css` tiene reglas redefinidas más abajo por iteraciones anteriores (por ejemplo `.projects, .skills,
.contact` dos veces). Al tocarlo se fusionan esos duplicados; no se reestructura nada más.

### Cambios por sección

- **Navegación**: enlaces Home, About, Projects, Skills, Contact y selector `ES | EN` (dos botones con
  `aria-pressed`). En móvil los enlaces pasan a una segunda fila, como ahora.
- **Home**: pergamino con nombre, rol, descripción, botones "Ver proyectos" y "Contacto", y enlaces sociales.
  Desaparece el enlace de CV. Se mantiene el control "Explorar ↓ / Pausar movimiento".
- **About** (nueva): panel de papel con un avatar del pack (`UI Elements/Human Avatars`) enmarcado, dos párrafos y
  cuatro datos cortos en fila (ubicación, puesto actual, estudios, idiomas).
- **Projects**: tablón de madera con una nota de papel por proyecto. Cada nota admite una captura opcional
  (`image`) a la izquierda. Los botones "Ver proyecto" y "Código" solo se muestran si el proyecto tiene esa URL. Se
  retira el sufijo "(placeholder link)" de los `aria-label`.
- **Skills**: cuatro grupos con iconos del pack. Sin niveles ni porcentajes.
- **Contact**: igual que ahora, conectado a Formspree.
- **Footer**: copyright, atribución a Pixel Frog y vuelta arriba.

### Idiomas (`src/i18n.tsx`)

Sin librería. Un contexto con `lang`, `setLang` y el diccionario activo; hook `useContent()`.

- `src/content/en.ts` define todo el texto visible, incluidos proyectos y skills, y exporta su tipo.
  `src/content/es.ts` está tipado con ese tipo, de modo que una clave que falte no compila.
- Idioma inicial: `localStorage` → `navigator.language` que empiece por `es` → inglés.
- Al cambiar: se guarda, y se actualizan `<html lang>`, `document.title` y la meta descripción.
- `siteConfig.ts` queda solo con lo no traducible: email, URLs sociales y `contactEndpoint`. Se eliminan
  `data/projects.ts` y `data/skills.ts`.

Cambiar de idioma altera la altura de la página; el `ResizeObserver` recompone el mundo.

### Contacto

`contactEndpoint` apunta a `https://formspree.io/f/<id>`. El adaptador añade la cabecera `Accept:
application/json` (Formspree la exige para responder JSON en vez de redirigir) y un campo oculto `_gotcha` como
trampa para bots. Con `contactEndpoint: null` se mantiene el modo demo actual. La validación de campos no cambia.

### Contenido propuesto (a revisar por el autor)

**Hero**

| | EN | ES |
| --- | --- | --- |
| Nombre | Manuel Allegue López | igual |
| Rol | Full-Stack Developer · .NET · Python · React | Desarrollador Full-Stack · .NET · Python · React |
| Descripción | I turn ideas into software: robust, scalable applications and services, from the database up to the interface. | Convierto ideas en software: aplicaciones y servicios robustos y escalables, desde la base de datos hasta la interfaz. |

**About**

- EN: "I'm a Full-Stack Developer based in A Coruña, Spain. At GT Motive I build backend billing processes in
  PL/SQL, automate operations on Linux and turn business data into reports and dashboards; before that I developed
  C# and .NET applications and REST APIs there." / "I'm always learning. I'm studying Computer Engineering alongside
  work, hold an MBA in Big Data Analytics, and in my spare time I build games and tools, like the strategy game
  whose world is running behind this page."
- ES: "Soy Desarrollador Full-Stack en A Coruña. En GT Motive desarrollo procesos de facturación en backend con
  PL/SQL, automatizo operaciones en Linux y convierto datos de negocio en informes y dashboards; antes desarrollé
  allí aplicaciones y APIs REST con C# y .NET." / "Siempre estoy aprendiendo. Estudio Ingeniería Informática
  mientras trabajo, tengo un MBA en Big Data Analytics y en mi tiempo libre hago juegos y herramientas, como el
  juego de estrategia cuyo mundo se mueve detrás de esta página."
- Datos: A Coruña, Spain · Business Services Developer @ GT Motive · Computer Engineering (in progress) ·
  Spanish, Galician, English B2.

No se nombra la universidad: el CV dice UNED y el portfolio anterior UNIR.

**Projects**

1. **TinyRTS**. Real-time strategy game · Desktop / Juego de estrategia en tiempo real · Escritorio.
   EN: "A small-scale Warcraft-style RTS for Linux and Windows: economy, construction, combat, technology, fog of
   war, AI opponents for 2 to 4 players and an in-game map editor. A deterministic C# simulation at 20 Hz, fully
   decoupled from Godot's rendering and covered by 145 tests."
   ES: "Un RTS al estilo Warcraft en pequeño para Linux y Windows: economía, construcción, combate, tecnología,
   niebla de guerra, IA para 2 a 4 jugadores y editor de mapas dentro del juego. Simulación determinista en C# a
   20 Hz, separada por completo del render de Godot y cubierta por 145 tests."
   Stack: Godot 4 · C# · .NET 8 · xUnit. Código: `github.com/9n-dev/TinyRTS`.
2. **Mario Hacendado**. 2D platformer · Browser / Plataformas 2D · Navegador.
   EN: "A Mario-style platformer with its own physics engine and no game framework: game loop, collisions, camera,
   enemy state machines, Tiled map loader and sprite system, all tested. One 300-column level with four enemy types."
   ES: "Un plataformas estilo Mario con motor de físicas propio y sin framework de juegos: bucle de juego,
   colisiones, cámara, máquinas de estados de enemigos, cargador de mapas de Tiled y sistema de sprites, todo con
   tests. Un nivel de 300 columnas con cuatro tipos de enemigo."
   Stack: TypeScript · Canvas 2D · Vite · Vitest · Tiled. Código: `github.com/9n-dev/MarioHacendado`.
3. **RiftLens**. Desktop app · League of Legends / App de escritorio · League of Legends.
   EN: "A desktop companion for League of Legends: player stats, champion tier list and an in-game overlay. Rust
   backend on Tauri talking to the Riot and LCU APIs, with a local SQLite cache and a React front end."
   ES: "Una app de escritorio para League of Legends: estadísticas de jugadores, tier list de campeones y overlay
   en partida. Backend en Rust sobre Tauri que habla con las APIs de Riot y LCU, con caché local en SQLite y
   frontend en React."
   Stack: Tauri 2 · Rust · React · TypeScript · SQLite. Sin enlaces (el repo no tiene remoto).

Capturas: `2dMario/docs/screenshots`, un frame del tráiler de TinyRTS; RiftLens sin captura salvo que el autor
aporte una.

**Skills**

| Frontend | Backend | Data | DevOps & Tools |
| --- | --- | --- | --- |
| React, TypeScript, JavaScript, HTML & CSS, Angular | C# / .NET, Python / Django, Node.js, Java | SQL & PL/SQL, SQL Server, BI & IBM Cognos, MongoDB | Linux, Bash, Docker, Git & GitHub, Azure DevOps |

**Enlaces**: GitHub `github.com/9n-dev`, LinkedIn `linkedin.com/in/manuel-allegue-lópez`, email
`manuelallegue14@gmail.com`.

## 3. Limpieza, pruebas y entrega

### Se elimina

`src/components/MapScene.tsx`, `src/data/scenes/`, `public/assets/terrain/*.webp`, `public/assets/units/`, la parte
de escenas de `prepare-assets.py`, `docs/scene-validation.json`, `docs/selected-assets.json`, y las capturas de
iteraciones anteriores (`docs/revision/`, `docs/clean/`, `docs/inhabited/`, `docs/screenshot-*.png`,
`docs/hero-*.png`). El ZIP del pack queda en local y fuera de git (no se redistribuye); la
imagen de referencia se queda en el repo y fuera del sitio publicado.

### Pruebas

- **Validador del mundo** (`tests/world.spec.ts`, se ejecuta con Playwright como test sin navegador): para cada
  escena, ningún objeto, puesto de trabajo ni segmento de ruta pisa agua o la huella de un edificio; todos los
  sprites referenciados existen en el registro y en disco; ninguna escena invade la columna reservada a paneles.
  Compone el mundo para tres alturas de página distintas y comprueba que las franjas no se solapan.
- **E2E existentes, adaptados**: sin overflow horizontal a 1728, 1440, 1024, 768, 390 y 320 px; sin errores de
  consola; navegación activa con las cinco secciones; formulario; foco visible; botón pulsado; nine-slice.
- **Nuevos E2E**: el canvas no está en blanco (muestreo de píxeles); dos capturas separadas 1 s difieren con
  movimiento activo y son idénticas en pausa y con `prefers-reduced-motion`; el selector de idioma cambia textos y
  `<html lang>` y persiste tras recargar.
- Capturas de revisión a 1728×864, 1440×900 y 390×844 en `docs/screenshots/`, revisadas a ojo contra la referencia.

### Rendimiento

Objetivo: 60 fps en un portátil normal con el mundo visible, y ningún frame por encima de 8 ms de script en la
medición con Playwright. Peso de assets del mundo por debajo de 1,5 MB (los PNG del pack son pequeños).

### Documentación

Se reescribe `README.md`: cómo editar contenido e idiomas, cómo editar escenas, cómo conectar Formspree, cómo
desplegar. `docs/asset-audit.md` se actualiza con los assets del mundo.

## Fuera de alcance

Combate y Enemy Pack, interacción del visitante con el mundo, elevación y acantilados, compatibilidad con el formato
de mapas v4 de TinyRTS, sección Experience, descarga de CV, blog, analítica. Cada uno se puede añadir después sin
rehacer lo anterior.

## Pendiente del autor

1. Revisar los textos de este documento.
2. Confirmar que los repos `9n-dev/TinyRTS` y `9n-dev/MarioHacendado` son públicos, y si RiftLens tendrá enlace.
3. Crear el formulario en Formspree y pasar el endpoint (no bloquea el desarrollo).
