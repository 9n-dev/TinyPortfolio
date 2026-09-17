import { useContent } from '../i18n';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { NineSliceSurface } from '../components/NineSliceSurface';
import { siteConfig } from '../data/siteConfig';
import { PixelPanel, SectionTitle } from '../components/PixelUI';
import { SocialLinks } from '../components/SocialLinks';
import { sendContact } from '../services/contact';

export function Contact() {
  const { t } = useContent();
  const c = t.contact;
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;   // honeypot: only bots fill it
    setBusy(true);
    setStatus('');
    try {
      const result = await sendContact({ name: String(data.get('name')).trim(), email: String(data.get('email')).trim(), message: String(data.get('message')).trim() });
      setStatus(result === 'demo' ? c.demoResult : c.success);
      if (result === 'sent') form.reset();
    } catch { setStatus(c.error); }
    finally { setBusy(false); }
  }
  return <section id="contact" className="section contact" aria-labelledby="contact-title">
    <SectionTitle id="contact-title" title={c.sectionTitle} />
    <PixelPanel className="contact-paper" skin="scroll">
      <div className="contact-intro">
        <h3>{c.title}</h3>
        <p>{c.description}</p>
        <SocialLinks />
      </div>
      <form onSubmit={submit} aria-describedby="form-notice">
        <NineSliceSurface skin="paper" />
        <div className="form-heading"><img src="/assets/ui/Icon_02.png" width="32" height="32" alt="" /><h3>{c.formTitle}</h3></div>
        <input className="gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label htmlFor="name">{c.name}</label>
        <div className="pixel-field"><NineSliceSurface skin="slate" /><input id="name" name="name" autoComplete="name" placeholder={c.namePlaceholder} required maxLength={120} pattern=".*\S.*" /></div>
        <label htmlFor="email">{c.email}</label>
        <div className="pixel-field"><NineSliceSurface skin="slate" /><input id="email" name="email" type="email" autoComplete="email" placeholder={c.emailPlaceholder} required maxLength={254} /></div>
        <label htmlFor="message">{c.message}</label>
        <div className="pixel-field"><NineSliceSurface skin="slate" /><textarea id="message" name="message" rows={4} onInput={event => event.currentTarget.setCustomValidity(event.currentTarget.value.trim() ? '' : c.messageRequired)} placeholder={c.messagePlaceholder} required maxLength={5000} /></div>
        <button className="pixel-button" type="submit" disabled={busy}><NineSliceSurface skin="button" />{busy ? c.sending : c.send} <span aria-hidden="true">↗</span></button>
        <p id="form-notice" className="form-notice">{siteConfig.contactEndpoint ? c.privacy : c.demoNotice}</p>
        <p className="form-status" role="status">{status}</p>
      </form>
    </PixelPanel>
  </section>;
}
