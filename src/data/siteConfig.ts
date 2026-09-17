/** Everything that is the same in every language. Visible text lives in src/content/. */
export const siteConfig = {
  name: 'Manuel Allegue López',
  email: 'manuelallegue14@gmail.com',
  /** Formspree form URL (https://formspree.io/f/…). While null the form validates but sends nothing. */
  contactEndpoint: null as string | null,
  socials: [
    { label: 'GitHub', url: 'https://github.com/9n-dev' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/manuel-allegue-lópez' },
    { label: 'Email', url: 'mailto:manuelallegue14@gmail.com' },
  ],
  sections: ['home', 'about', 'projects', 'skills', 'contact'] as const,
};

/** URL of a file in public/, wherever the site is mounted (GitHub Pages serves it under /TinyPortfolio/). */
export const asset = (path: string) => import.meta.env.BASE_URL + path;
