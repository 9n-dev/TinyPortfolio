export const siteConfig = {
  name: 'YOUR NAME',
  role: 'Full-Stack Developer · Data Analyst',
  description: 'Building web experiences, scalable applications and turning data into useful insights.',
  email: 'hello@example.com',
  cvUrl: null as string | null, // Set to /cv.pdf and place the file in public/ to show Download CV.
  contactEndpoint: null as string | null,
  navigation: [{ id: 'home', label: 'Home' }, { id: 'projects', label: 'Projects' }, { id: 'skills', label: 'Skills' }, { id: 'contact', label: 'Contact' }],
  projects: { title: 'Selected projects', eyebrow: '01 / THE WORKSHOP', description: 'Web applications, backend systems and data tools.', note: 'Four concept projects · Placeholder links' },
  skills: { title: 'My toolkit', eyebrow: '02 / THE INVENTORY', description: 'The right tools to turn an idea into something useful.', note: 'An example inventory, ready to make my own.' },
  contact: { sectionTitle: 'Get in touch', title: "Let's build something together.", eyebrow: '03 / THE NEXT ADVENTURE', description: 'Have a project in mind, an interesting challenge, or just want to say hello? Leave a message at the outpost.', demoNotice: 'Demo form — messages are not sent yet.', demoResult: 'Your message is ready. This demo is not connected to a mail service, so nothing has been sent.', success: 'Thanks for reaching out. Your message has been sent.', error: 'Your message could not be sent. Please try again or use the email link.' },
  footer: 'Crafted with code & a little imagination.',
};
