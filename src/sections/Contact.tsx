import { SceneRegion } from '../components/MapScene';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { NineSliceSurface } from '../components/NineSliceSurface';
import { siteConfig } from '../data/siteConfig';
import { PixelPanel, SectionTitle } from '../components/PixelUI';
import { SocialLinks } from '../components/SocialLinks';
import { sendContact } from '../services/contact';

export function Contact() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setStatus('');
    try {
      const result = await sendContact({ name: String(data.get('name')).trim(), email: String(data.get('email')).trim(), message: String(data.get('message')).trim() });
      setStatus(result === 'demo' ? siteConfig.contact.demoResult : siteConfig.contact.success);
      if (result === 'sent') form.reset();
    } catch { setStatus(siteConfig.contact.error); }
    finally { setBusy(false); }
  }
  return <section id="contact" className="section contact" aria-labelledby="contact-title">
    <SceneRegion region="contact" />
    <SectionTitle id="contact-title" title={siteConfig.contact.sectionTitle} />
    <PixelPanel className="contact-paper" skin="scroll">
      <div className="contact-intro">
        <h3>{siteConfig.contact.title}</h3>
        <p>{siteConfig.contact.description}</p>
        <SocialLinks />
      </div>
      <form onSubmit={submit} aria-describedby="form-notice">
        <NineSliceSurface skin="paper" />
        <div className="form-heading"><img src="/assets/ui/Icon_02.png" width="32" height="32" alt="" /><h3>Leave a message</h3></div>
        <label htmlFor="name">Name</label>
        <div className="pixel-field"><NineSliceSurface skin="slate" /><input id="name" name="name" autoComplete="name" placeholder="Your name" required maxLength={120} pattern=".*\S.*" /></div>
        <label htmlFor="email">Email</label>
        <div className="pixel-field"><NineSliceSurface skin="slate" /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></div>
        <label htmlFor="message">Message</label>
        <div className="pixel-field"><NineSliceSurface skin="slate" /><textarea id="message" name="message" rows={4} onInput={event => event.currentTarget.setCustomValidity(event.currentTarget.value.trim() ? '' : 'Please write a message.')} placeholder="Tell me about your idea…" required maxLength={5000} /></div>
        <button className="pixel-button" type="submit" disabled={busy}><NineSliceSurface skin="button" />{busy ? 'Sending…' : 'Send Message'} <span aria-hidden="true">↗</span></button>
        <p id="form-notice" className="form-notice">{siteConfig.contactEndpoint ? 'Your details are only used to reply to your message.' : siteConfig.contact.demoNotice}</p>
        <p className="form-status" role="status">{status}</p>
      </form>
    </PixelPanel>
  </section>;
}
