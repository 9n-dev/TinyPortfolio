import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './sections/Home';
import { About } from './sections/About';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';
import { Contact } from './sections/Contact';
import { WorldCanvas } from './world/WorldCanvas';
import { useContent } from './i18n';

export default function App() {
  const [paused, setPaused] = useState(false);
  const { t } = useContent();
  return <div className="app">
    <a href="#main" className="skip-link">{t.skip}</a>
    <WorldCanvas paused={paused} />
    <Navigation />
    <div className="world">
      <main id="main"><Home paused={paused} onToggle={() => setPaused(value => !value)} /><About /><Projects /><Skills /><Contact /></main>
      <Footer />
    </div>
  </div>;
}
