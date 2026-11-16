import site from '../data/site.json';

/** "7:00" -> "7 a.m.", "20:00" -> "8 p.m.", "15:30" -> "3:30 p.m." */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'p.m.' : 'a.m.';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hr}:${String(m).padStart(2, '0')} ${suffix}` : `${hr} ${suffix}`;
}

export const hours = site.hours.map((h) => ({
  ...h,
  text: `${formatTime(h.open)} - ${formatTime(h.close)}`,
}));

/** Hours as JSON for the small in-browser "open now" script. */
export const hoursJson = JSON.stringify(site.hours.map(({ days, open, close }) => ({ days, open, close })));

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;
