export type Project = { name: string; category: string; description: string; stack: string[]; url?: string; sourceUrl?: string; image?: string };

export const en = {
  role: 'FullStack Developer and Data Analyst',
  description: 'I turn ideas into software: robust, scalable applications and services, from the database up to the interface.',
  nav: { home: 'Home', about: 'About', projects: 'Projects', skills: 'Skills', contact: 'Contact', main: 'Main navigation', language: 'Language' },
  skip: 'Skip to content',
  hero: { projects: 'View Projects', contact: 'Contact Me' },
  about: {
    title: 'About me',
    paragraphs: [
      "I'm a FullStack Developer and Data Analyst based in A Coruña, Spain. At GT Motive I build backend billing processes in PL/SQL, automate operations on Linux and turn business data into reports and dashboards; before that I developed C# and .NET applications and REST APIs there.",
      "I'm always learning. I'm studying Computer Engineering alongside work, hold an MBA in Big Data Analytics, and in my spare time I build games and tools, like the strategy game whose world is running behind this page.",
    ],
    facts: [
      { label: 'Based in', value: 'A Coruña, Spain' },
      { label: 'Currently', value: 'Business Services Developer at GT Motive' },
      { label: 'Studying', value: 'Computer Engineering' },
      { label: 'Languages', value: 'Spanish, Galician, English (B2)' },
    ],
  },
  projects: {
    title: 'Selected projects',
    intro: 'Games, engines and desktop tools I build in my own time.',
    view: 'View Project', source: 'Source Code', stackLabel: 'Technology stack',
    list: [
      { name: 'TinyRTS', category: 'Real-time strategy game · Desktop',
        description: 'A pixel-art real-time strategy game, like a small Warcraft 3 with the expansion economy of Northgard. Start with a Castle and three Pawns, gather wood and gold, raise an army of Warriors, Archers, Lancers and Monks, and clear goblin villages, spider nests and pirate coves for rewards. Play against up to three AI rivals, with fog of war, plateaus and a built-in map editor. The last Castle standing wins.',
        stack: ['Godot 4', 'C#', 'Linux & Windows'], url: 'https://9n-dev.github.io/TinyRTS-showcase/', sourceUrl: 'https://github.com/9n-dev/TinyRTS-showcase' },
      { name: 'Mario Hacendado', category: '2D platformer · Browser',
        description: 'A Mario-style platformer with its own physics engine and no game framework: game loop, collisions, camera, enemy state machines, Tiled map loader and sprite system, all tested. One 300-column level with four enemy types.',
        stack: ['TypeScript', 'Canvas 2D', 'Vite', 'Vitest', 'Tiled'], sourceUrl: 'https://github.com/9n-dev/MarioHacendado' },
      { name: 'RiftLens', category: 'Desktop app · League of Legends',
        description: 'A desktop companion for League of Legends: player stats, champion tier list and an in-game overlay. Rust backend on Tauri talking to the Riot and LCU APIs, with a local SQLite cache and a React front end.',
        stack: ['Tauri 2', 'Rust', 'React', 'TypeScript', 'SQLite'] },
    ] as Project[],
  },
  skills: {
    title: 'My toolkit',
    intro: 'The tools I reach for, from the database up to the interface.',
    groups: [
      { name: 'Frontend', icon: '05', description: 'Interfaces that feel right.', technologies: ['React', 'TypeScript', 'JavaScript', 'HTML & CSS', 'Angular'] },
      { name: 'Backend', icon: '06', description: 'Solid foundations underneath.', technologies: ['C# / .NET', 'Python / Django', 'Rust', 'Node.js', 'Java'] },
      { name: 'Data', icon: '03', description: 'Make the numbers tell a story.', technologies: ['SQL & PL/SQL', 'Oracle', 'SQL Server', 'BI & IBM Cognos', 'MongoDB'] },
      { name: 'DevOps', icon: '10', description: 'A dependable workflow.', technologies: ['Linux', 'Bash', 'Docker', 'Git & GitHub', 'Azure DevOps'] },
    ],
  },
  contact: {
    sectionTitle: 'Get in touch', title: "Let's build something together.",
    description: 'Have a project in mind, an interesting challenge, or just want to say hello? Leave a message at the outpost.',
    formTitle: 'Leave a message', name: 'Name', namePlaceholder: 'Your name', email: 'Email', emailPlaceholder: 'you@example.com', message: 'Message',
    messagePlaceholder: 'Tell me about your idea…', messageRequired: 'Please write a message.', send: 'Send Message', sending: 'Sending…',
    privacy: 'Your details are only used to reply to your message.', demoNotice: 'Demo form — messages are not sent yet.',
    demoResult: 'Your message is ready. This demo is not connected to a mail service, so nothing has been sent.',
    success: 'Thanks for reaching out. Your message has been sent.',
    error: 'Your message could not be sent. Please try again or use the email link.',
  },
  footer: { attribution: 'Pixel art: Tiny Swords by Pixel Frog', top: 'Back to top' },
};
export type Content = typeof en;
