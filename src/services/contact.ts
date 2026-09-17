import { siteConfig } from '../data/siteConfig';
export type ContactMessage = { name: string; email: string; message: string };
export async function sendContact(message: ContactMessage): Promise<'demo' | 'sent'> {
  if (!siteConfig.contactEndpoint) return 'demo';
  // Accept: Formspree answers JSON instead of redirecting to its thank-you page.
  const response = await fetch(siteConfig.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(message), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Contact request failed');
  return 'sent';
}
