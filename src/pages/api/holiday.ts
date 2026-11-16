/*
  The holiday menu Eric switches on and off from /update/.
  GET  /api/holiday/  -> current holiday menu setting (cached at the edge for 30 seconds)
  POST /api/holiday/  -> save it (needs the PIN). The menu file itself is uploaded
                         separately through /api/holiday-upload/.
*/
import type { APIRoute } from 'astro';
import { json, readJson, writeJson, pinOk, wrongPin, clean, CACHE_PUBLIC } from '../../lib/store';

export const prerender = false;

const FILE = 'holiday.json';

export type LiveHoliday = {
  show: boolean;
  name: string; // "Rosh Hashanah"
  title: string; // "Rosh Hashanah Catering Menu 2027"
  note: string; // "Order by noon Friday Sept 24. Pickup Thursday Sept 30 after 11 AM."
  fileUrl: string;
  fileType: 'pdf' | 'image' | '';
  showUntil: string; // YYYY-MM-DD or ''
  updatedAt: string;
};

const isBlobUrl = (u: string) => /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s"'<>]+$/i.test(u);

export const GET: APIRoute = async () => {
  try {
    const data = await readJson<LiveHoliday>(FILE);
    return data ? json(data, 200, CACHE_PUBLIC) : json({ error: 'nothing posted yet' }, 404);
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
};

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Something went wrong sending the form. Try again.' }, 400);
  }
  if (!pinOk(body.pin)) return wrongPin();

  const fileUrl = clean(body.fileUrl, 500);
  const fileType = body.fileType === 'pdf' ? 'pdf' : body.fileType === 'image' ? 'image' : '';
  const until = clean(body.showUntil, 10);
  const holiday: LiveHoliday = {
    show: Boolean(body.show),
    name: clean(body.name, 40),
    title: clean(body.title, 90),
    note: clean(body.note, 300),
    fileUrl: fileUrl && isBlobUrl(fileUrl) ? fileUrl : '',
    fileType: fileUrl && isBlobUrl(fileUrl) ? fileType : '',
    showUntil: /^\d{4}-\d{2}-\d{2}$/.test(until) ? until : '',
    updatedAt: new Date().toISOString(),
  };

  if (holiday.show) {
    if (!holiday.name) return json({ error: 'Pick or type the holiday name.' }, 400);
    if (!holiday.fileUrl) return json({ error: 'Add the menu file (PDF or picture) before turning it on.' }, 400);
  }
  if (!holiday.title && holiday.name) holiday.title = `${holiday.name} Menu`;

  try {
    await writeJson(FILE, holiday);
  } catch {
    return json({ error: 'Could not save right now. Try again in a minute.' }, 502);
  }
  return json({ ok: true, holiday });
};
