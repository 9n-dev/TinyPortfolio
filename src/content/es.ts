import type { Content } from './en';

export const es: Content = {
  role: 'Desarrollador Full-Stack · .NET · Python · React',
  description: 'Convierto ideas en software: aplicaciones y servicios robustos y escalables, desde la base de datos hasta la interfaz.',
  nav: { home: 'Inicio', about: 'Sobre mí', projects: 'Proyectos', skills: 'Skills', contact: 'Contacto', main: 'Navegación principal', language: 'Idioma' },
  skip: 'Saltar al contenido',
  hero: { projects: 'Ver proyectos', contact: 'Contacto', explore: 'Explorar', pause: 'Pausar', resume: 'Reanudar',
    pauseLabel: 'Pausar las animaciones decorativas', resumeLabel: 'Reanudar las animaciones decorativas' },
  about: {
    title: 'Sobre mí',
    paragraphs: [
      'Soy Desarrollador Full-Stack en A Coruña. En GT Motive desarrollo procesos de facturación en backend con PL/SQL, automatizo operaciones en Linux y convierto datos de negocio en informes y dashboards; antes desarrollé allí aplicaciones y APIs REST con C# y .NET.',
      'Siempre estoy aprendiendo. Estudio Ingeniería Informática mientras trabajo, tengo un MBA en Big Data Analytics y en mi tiempo libre hago juegos y herramientas, como el juego de estrategia cuyo mundo se mueve detrás de esta página.',
    ],
    facts: [
      { label: 'Ubicación', value: 'A Coruña, España' },
      { label: 'Actualmente', value: 'Business Services Developer en GT Motive' },
      { label: 'Estudiando', value: 'Ingeniería Informática' },
      { label: 'Idiomas', value: 'Español, gallego, inglés (B2)' },
    ],
  },
  projects: {
    title: 'Proyectos',
    intro: 'Juegos, motores y herramientas de escritorio que hago en mi tiempo libre.',
    view: 'Ver proyecto', source: 'Código', stackLabel: 'Tecnologías',
    list: [
      { name: 'TinyRTS', category: 'Estrategia en tiempo real · Escritorio',
        description: 'Un RTS al estilo Warcraft en pequeño para Linux y Windows: economía, construcción, combate, tecnología, niebla de guerra, IA para 2 a 4 jugadores y editor de mapas dentro del juego. Simulación determinista en C# a 20 Hz, separada por completo del render de Godot y cubierta por 145 tests.',
        stack: ['Godot 4', 'C#', '.NET 8', 'xUnit'], sourceUrl: 'https://github.com/9n-dev/TinyRTS' },
      { name: 'Mario Hacendado', category: 'Plataformas 2D · Navegador',
        description: 'Un plataformas estilo Mario con motor de físicas propio y sin framework de juegos: bucle de juego, colisiones, cámara, máquinas de estados de enemigos, cargador de mapas de Tiled y sistema de sprites, todo con tests. Un nivel de 300 columnas con cuatro tipos de enemigo.',
        stack: ['TypeScript', 'Canvas 2D', 'Vite', 'Vitest', 'Tiled'], sourceUrl: 'https://github.com/9n-dev/MarioHacendado' },
      { name: 'RiftLens', category: 'App de escritorio · League of Legends',
        description: 'Una app de escritorio para League of Legends: estadísticas de jugadores, tier list de campeones y overlay en partida. Backend en Rust sobre Tauri que habla con las APIs de Riot y LCU, con caché local en SQLite y frontend en React.',
        stack: ['Tauri 2', 'Rust', 'React', 'TypeScript', 'SQLite'] },
    ],
  },
  skills: {
    title: 'Mis herramientas',
    intro: 'Lo que uso a diario, desde la base de datos hasta la interfaz.',
    groups: [
      { name: 'Frontend', icon: '05', description: 'Interfaces que se sienten bien.', technologies: ['React', 'TypeScript', 'JavaScript', 'HTML y CSS', 'Angular'] },
      { name: 'Backend', icon: '06', description: 'Cimientos sólidos por debajo.', technologies: ['C# / .NET', 'Python / Django', 'Node.js', 'Java'] },
      { name: 'Datos', icon: '03', description: 'Que los números cuenten algo.', technologies: ['SQL y PL/SQL', 'SQL Server', 'BI e IBM Cognos', 'MongoDB'] },
      { name: 'DevOps', icon: '10', description: 'Un flujo de trabajo fiable.', technologies: ['Linux', 'Bash', 'Docker', 'Git y GitHub', 'Azure DevOps'] },
    ],
  },
  contact: {
    sectionTitle: 'Contacto', title: 'Construyamos algo juntos.',
    description: '¿Tienes un proyecto en mente, un reto interesante o solo quieres saludar? Deja un mensaje en el puesto avanzado.',
    formTitle: 'Deja un mensaje', name: 'Nombre', namePlaceholder: 'Tu nombre', email: 'Email', emailPlaceholder: 'tu@email.com', message: 'Mensaje',
    messagePlaceholder: 'Cuéntame tu idea…', messageRequired: 'Escribe un mensaje.', send: 'Enviar mensaje', sending: 'Enviando…',
    privacy: 'Tus datos solo se usan para responder a tu mensaje.', demoNotice: 'Formulario de demostración: los mensajes aún no se envían.',
    demoResult: 'Tu mensaje está listo. Esta demo no está conectada a un servicio de correo, así que no se ha enviado nada.',
    success: 'Gracias por escribir. Tu mensaje se ha enviado.',
    error: 'No se pudo enviar el mensaje. Inténtalo de nuevo o usa el enlace de email.',
  },
  footer: { attribution: 'Pixel art: Tiny Swords de Pixel Frog', top: 'Volver arriba' },
};
