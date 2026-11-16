/*
  The daily special.
  GET  /api/special/  -> the current special (cached at the edge for 30 seconds)
  POST /api/special/  -> Eric posts a new special from /update/ (needs the PIN)
*/
import type { APIRoute } from 'astro';
import { json, readJson, writeJson, pinOk, wrongPin, clean, CACHE_PUBLIC } from '../../lib/store';

export const prerender = false;

const FILE = 'special.json';
const LABELS = ["Today's Special", 'Breakfast Special', 'Lunch Special', 'Dinner Special', 'Weekend Special'];

export type Special = {
  show: boolean;
  label: string;
  title: string;
  description: string;
  price: string;
  updatedAt: string;
};

export const GET: APIRoute = async () => {
  try {
    const data = await readJson<Special>(FILE);
    return data ? json(data, 200, CACHE_PUBLIC) : json({ error: 'no special posted yet' }, 404);
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

  const label = clean(body.label, 40);
  const special: Special = {
    show: Boolean(body.show),
    label: LABELS.includes(label) ? label : "Today's Special",
    title: clean(body.title, 80),
    description: clean(body.description, 300),
    price: clean(body.price, 30),
    updatedAt: new Date().toISOString(),
  };
  if (special.show && !special.title) {
    return json({ error: 'Add the name of the special before posting.' }, 400);
  }
  try {
    await writeJson(FILE, special);
  } catch {
    return json({ error: 'Could not save right now. Try again in a minute.' }, 502);
  }
  return json({ ok: true, special });
};
