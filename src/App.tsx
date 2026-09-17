import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './sections/Home';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';
import { Contact } from './sections/Contact';
import { siteConfig } from './data/siteConfig';

export default function App() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    document.title = `${siteConfig.name} — ${siteConfig.role}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', siteConfig.description);
  }, []);
  return <div className={paused ? 'app motion-paused' : 'app'}>
    <a href="#main" className="skip-link">Skip to content</a>
    <Navigation />
    <div className="world">
      <main id="main"><Home paused={paused} onToggle={() => setPaused(value => !value)} /><Projects /><Skills /><Contact /></main>
      <Footer />
    </div>
  </div>;
}
